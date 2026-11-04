import { lessonSchema, type Lesson } from '@csk/shared';

import type { ContentIssue } from '../content-check/checkRunner';
import {
  AUTHORED_LESSON_KEYS,
  authoredLessonExtrasSchema,
  type AuthoredSentence,
} from '../lib/authored.schema';
import { zodIssuesToContent, type YamlFile } from '../lib/yamlFile';

export interface ParsedLesson {
  source: YamlFile;
  /** Có khi file đúng schema. */
  lesson?: Lesson;
  sentences: AuthoredSentence[];
  issues: ContentIssue[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const KNOWN_KEYS: ReadonlySet<string> = new Set(AUTHORED_LESSON_KEYS);

/** S2.3 AC1–2: kiểm một file bài YAML theo schema chung, lỗi kèm tên file và số dòng. */
export function parseLesson(source: YamlFile): ParsedLesson {
  if (source.syntaxIssues.length > 0) {
    return { source, sentences: [], issues: source.syntaxIssues };
  }
  const value = source.value;
  if (!isRecord(value)) {
    return {
      source,
      sentences: [],
      issues: [
        {
          level: 'error',
          file: source.file,
          line: 1,
          message: 'File bài phải là một object YAML (id, type, title, …)',
        },
      ],
    };
  }

  const unknownKeys = Object.keys(value)
    .filter((key) => !KNOWN_KEYS.has(key))
    .map((key): ContentIssue => ({
      level: 'error',
      file: source.file,
      line: source.lineOf([key]),
      message: `Field "${key}" không có trong schema bài (${AUTHORED_LESSON_KEYS.join(', ')})`,
    }));
  const { sentences: rawSentences, ...rawLesson } = value;
  const lesson = lessonSchema.safeParse(rawLesson);
  const extras = authoredLessonExtrasSchema.safeParse({
    sentences: rawSentences,
  });

  const issues = [
    ...unknownKeys,
    ...zodIssuesToContent(source, lesson.error?.issues ?? []),
    ...zodIssuesToContent(source, extras.error?.issues ?? []),
  ];
  return {
    source,
    lesson: lesson.success && issues.length === 0 ? lesson.data : undefined,
    sentences: extras.success ? extras.data.sentences : [],
    issues,
  };
}

interface Reference {
  path: (string | number)[];
  id: string;
  target: 'word' | 'sentence';
}

/**
 * Đọc tham chiếu từ dữ liệu thô của `exercises` (không cần đúng schema), để bài còn lỗi schema
 * vẫn được báo luôn lỗi tham chiếu.
 */
function referencesOf(exercises: unknown): Reference[] {
  if (!Array.isArray(exercises)) {
    return [];
  }
  return exercises.flatMap((exercise: unknown, index): Reference[] => {
    if (!isRecord(exercise)) {
      return [];
    }
    const ref = (
      target: Reference['target'],
      id: unknown,
      ...rest: (string | number)[]
    ): Reference[] =>
      typeof id === 'string'
        ? [{ path: ['exercises', index, ...rest], id, target }]
        : [];
    const pair = Array.isArray(exercise.wordIds) ? exercise.wordIds : [];
    return [
      ...ref('word', exercise.wordId, 'wordId'),
      ...pair.flatMap((id: unknown, pairIndex) =>
        ref('word', id, 'wordIds', pairIndex),
      ),
      ...ref('sentence', exercise.sentenceId, 'sentenceId'),
    ];
  });
}

/** ID bài đọc được từ file (kể cả khi file còn lỗi schema), để lộ trình không báo nhầm. */
export function rawLessonId(parsed: ParsedLesson): string | undefined {
  const value = parsed.source.value;
  return isRecord(value) && typeof value.id === 'string' ? value.id : undefined;
}

/** Các ID từ/câu mà bài tham chiếu tới (để gom chữ cho dữ liệu nét chữ). */
export function referencedIds(lesson: Lesson): {
  wordIds: string[];
  sentenceIds: string[];
} {
  const refs = referencesOf(lesson.exercises);
  return {
    wordIds: refs.filter((ref) => ref.target === 'word').map((ref) => ref.id),
    sentenceIds: refs
      .filter((ref) => ref.target === 'sentence')
      .map((ref) => ref.id),
  };
}

/** S2.3 AC3: tham chiếu tới từ không có trong từ điển (hoặc câu chưa khai báo) → lỗi file:dòng. */
export function lessonRefIssues(
  parsed: ParsedLesson,
  wordIds: ReadonlySet<string>,
  sentenceIds: ReadonlySet<string>,
): ContentIssue[] {
  const value = parsed.source.value;
  return referencesOf(isRecord(value) ? value.exercises : undefined)
    .filter((ref) =>
      ref.target === 'word' ? !wordIds.has(ref.id) : !sentenceIds.has(ref.id),
    )
    .map((ref) => ({
      level: 'error',
      file: parsed.source.file,
      line: parsed.source.lineOf(ref.path),
      message:
        ref.target === 'word'
          ? `Từ "${ref.id}" không có trong từ điển`
          : `Câu "${ref.id}" chưa được khai báo trong mục sentences của bài nào`,
    }));
}
