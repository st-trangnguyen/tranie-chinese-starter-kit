import { createHash } from 'node:crypto';

import type { ContentRoot, Lesson, Sentence, Stage } from '@csk/shared';

import { audioJob, type AudioJob } from './audio';
import {
  lessonRefIssues,
  parseLesson,
  rawLessonId,
  referencedIds,
} from './lessons';
import { buildWords } from './words';
import type { ContentIssue } from '../content-check/checkRunner';
import type { HskEntry } from '../content-fetch/hskList';
import {
  authoredPathSchema,
  type TtsOverrides,
  type ViMeanings,
} from '../lib/authored.schema';
import { zodIssuesToContent, type YamlFile } from '../lib/yamlFile';

export interface BuildInputs {
  hskEntries: readonly HskEntry[];
  meanings: ViMeanings;
  overrides: TtsOverrides;
  path: YamlFile;
  lessons: readonly YamlFile[];
  /** Dữ liệu nét chữ (JSON hanzi-writer) của một chữ, `undefined` nếu không có. */
  strokeData: (char: string) => string | undefined;
}

export interface BuildResult {
  /** Đường dẫn trong `assets/content/` → nội dung file. */
  files: Map<string, string>;
  audioJobs: AudioJob[];
  /** Lỗi/cảnh báo của bài YAML và lộ trình (S2.3). */
  lessonIssues: ContentIssue[];
  /** Chữ có trong bài nhưng không có dữ liệu nét (S2.5 AC2). */
  missingStrokes: string[];
}

const HSK_LEVEL = 1;
const HAN = /\p{Script=Han}/u;
const json = (value: unknown): string => `${JSON.stringify(value)}\n`;

function duplicateIssues(
  items: readonly { id: string; file: string; line?: number }[],
  label: string,
): ContentIssue[] {
  const seen = new Set<string>();
  return items.flatMap((item) => {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      return [];
    }
    return [
      {
        level: 'error',
        file: item.file,
        line: item.line,
        message: `ID ${label} "${item.id}" bị trùng`,
      },
    ];
  });
}

function buildStages(
  path: YamlFile,
  lessonIds: ReadonlySet<string>,
): { stages: Stage[]; issues: ContentIssue[] } {
  if (path.syntaxIssues.length > 0) {
    return { stages: [], issues: path.syntaxIssues };
  }
  const parsed = authoredPathSchema.safeParse(path.value);
  if (!parsed.success) {
    return {
      stages: [],
      issues: zodIssuesToContent(path, parsed.error.issues),
    };
  }
  const missing = parsed.data.stages.flatMap((stage, s) =>
    stage.units.flatMap((unit, u) =>
      unit.lessons.flatMap((lessonId, l): ContentIssue[] =>
        lessonIds.has(lessonId)
          ? []
          : [
              {
                level: 'error',
                file: path.file,
                line: path.lineOf(['stages', s, 'units', u, 'lessons', l]),
                message: `Bài "${lessonId}" không có file trong content/authored/lessons`,
              },
            ],
      ),
    ),
  );
  const stages = parsed.data.stages.map((stage) => ({
    id: stage.id,
    title: stage.title,
    units: stage.units.map((unit) => ({
      id: unit.id,
      title: unit.title,
      lessonIds: unit.lessons,
    })),
  }));
  return { stages, issues: missing };
}

/**
 * Ghép toàn bộ nội dung từ đầu vào đã đọc: không đụng đĩa, nên `content:build` (ghi file) và
 * `content:check` (so với file đang có) dùng chung một kết quả.
 */
export function assembleContent(inputs: BuildInputs): BuildResult {
  const { words, audioJobs: wordAudio } = buildWords(
    inputs.hskEntries,
    inputs.meanings,
    inputs.overrides,
    HSK_LEVEL,
  );
  const parsedLessons = inputs.lessons.map(parseLesson);

  const sentenceEntries = parsedLessons.flatMap((parsed) =>
    parsed.sentences.map((sentence, index) => ({
      sentence,
      file: parsed.source.file,
      line: parsed.source.lineOf(['sentences', index, 'id']),
    })),
  );
  const sentenceAudio = sentenceEntries.map(({ sentence }) =>
    audioJob(sentence.hanzi, sentence.voice),
  );
  const sentences: Sentence[] = sentenceEntries.map(({ sentence }, index) => ({
    ...sentence,
    audio: sentenceAudio[index]?.path ?? '',
  }));

  const lessons: Lesson[] = parsedLessons.flatMap((parsed) =>
    parsed.lesson === undefined ? [] : [parsed.lesson],
  );
  const wordIds = new Set(words.map((word) => word.id));
  const sentenceIds = new Set(sentences.map((sentence) => sentence.id));
  const lessonIds = new Set(
    parsedLessons.flatMap((parsed) => rawLessonId(parsed) ?? []),
  );
  const { stages, issues: pathIssues } = buildStages(inputs.path, lessonIds);

  const inPath = new Set(
    stages.flatMap((stage) => stage.units.flatMap((unit) => unit.lessonIds)),
  );
  const orphanLessons = parsedLessons.flatMap((parsed): ContentIssue[] =>
    parsed.lesson === undefined || inPath.has(parsed.lesson.id)
      ? []
      : [
          {
            level: 'warning',
            file: parsed.source.file,
            line: parsed.source.lineOf(['id']),
            message: `Bài "${parsed.lesson.id}" chưa có trong content/authored/path.yaml`,
          },
        ],
  );

  const lessonIssues = [
    ...parsedLessons.flatMap((parsed) => parsed.issues),
    ...parsedLessons.flatMap((parsed) =>
      lessonRefIssues(parsed, wordIds, sentenceIds),
    ),
    ...duplicateIssues(
      sentenceEntries.map(({ sentence, file, line }) => ({
        id: sentence.id,
        file,
        line,
      })),
      'câu',
    ),
    ...duplicateIssues(
      parsedLessons.flatMap((parsed) =>
        parsed.lesson === undefined
          ? []
          : [
              {
                id: parsed.lesson.id,
                file: parsed.source.file,
                line: parsed.source.lineOf(['id']),
              },
            ],
      ),
      'bài',
    ),
    ...pathIssues,
    ...orphanLessons,
  ];

  // S2.5 AC1: chỉ lấy nét chữ cho chữ thực sự xuất hiện trong bài (từ được tham chiếu + câu).
  const wordById = new Map(words.map((word) => [word.id, word]));
  const sentenceById = new Map(sentences.map((s) => [s.id, s]));
  const usedText = lessons.flatMap((lesson) => {
    const refs = referencedIds(lesson);
    return [
      ...refs.wordIds.map((id) => wordById.get(id)?.hanzi ?? ''),
      ...refs.sentenceIds.map((id) => sentenceById.get(id)?.hanzi ?? ''),
    ];
  });
  const usedChars = [...new Set(usedText.flatMap((text) => [...text]))]
    .filter((char) => HAN.test(char))
    .toSorted();
  const strokes = usedChars.map((char) => ({
    char,
    data: inputs.strokeData(char),
  }));

  const contentFiles = new Map<string, string>([
    ['words.json', json(words)],
    ['sentences.json', json(sentences)],
    ...lessons.map((lesson): [string, string] => [
      `lessons/${lesson.id}.json`,
      json(lesson),
    ]),
  ]);
  const contentVersion = createHash('sha1')
    .update([...contentFiles.values()].join(''))
    .digest('hex')
    .slice(0, 12);
  const root: ContentRoot = { contentVersion, stages };

  const files = new Map<string, string>([
    ['content.json', json(root)],
    ...contentFiles,
    ...strokes.flatMap(({ char, data }): [string, string][] =>
      data === undefined ? [] : [[`strokes/${char}.json`, data]],
    ),
  ]);

  const audioJobs = [...wordAudio, ...sentenceAudio];
  return {
    files,
    audioJobs: [...new Map(audioJobs.map((job) => [job.path, job])).values()],
    lessonIssues,
    missingStrokes: strokes
      .filter(({ data }) => data === undefined)
      .map(({ char }) => char),
  };
}
