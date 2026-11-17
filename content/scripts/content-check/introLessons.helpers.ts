import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  contentRootSchema,
  lessonSchema,
  parsePinyin,
  sentenceSchema,
  strokeIndexSchema,
  wordSchema,
  type ContentRoot,
  type Exercise,
  type ExerciseKind,
  type Lesson,
  type Sentence,
  type StrokeIndex,
  type Word,
} from '@csk/shared';

import { PATHS } from '../lib/paths';

/*
 * Helper cho test đọc nội dung đã build (design D3): đọc output trong `apps/web/src/assets/`
 * qua `PATHS`, parse bằng schema Zod của `@csk/shared` (CLAUDE.md §0.4).
 */

/** 12 tiêu đề bài Nhập môn, nguyên văn danh sách AC2 (spec intro-lessons "Danh sách bài"). */
export const INTRO_LESSON_TITLES = [
  'Thanh 1–4',
  'Thanh nhẹ và biến điệu (3-3, 不, 一)',
  'Vận mẫu đơn',
  'Thanh mẫu b p m f d t n l',
  'Thanh mẫu g k h j q x',
  'Thanh mẫu zh ch sh r z c s',
  'Vận mẫu kép',
  'Vận mẫu mũi',
  'Quy tắc viết pinyin',
  'Nét cơ bản và thứ tự nét',
  '30 bộ thủ phổ biến',
  'Ôn tổng hợp + câu chào đầu tiên',
] as const;

/** ID bài theo design D1: `intro-01` … `intro-12`. */
export const INTRO_LESSON_IDS = INTRO_LESSON_TITLES.map(
  (_, index) => `intro-${String(index + 1).padStart(2, '0')}`,
);

export const INTRO_STAGE_TITLE = 'Nhập môn';
export const INTRO_UNIT_ID = 'intro-basics';
export const INTRO_UNIT_TITLE = 'Pinyin và chữ Hán cơ bản';
export const OLD_SAMPLE_LESSON_TITLE = 'Bốn thanh điệu';

/** 5 dạng màn bài đã hỗ trợ (bảng trong spec, cột cuối "Có"). */
export const SUPPORTED_KINDS: readonly ExerciseKind[] = [
  'tone-choice',
  'sound-pair',
  'pinyin-type',
  'speak',
  'stroke-write',
];
/** Dạng có nút "Nghe". */
export const LISTEN_KINDS: readonly ExerciseKind[] = [
  'tone-choice',
  'sound-pair',
  'pinyin-type',
];
/** Dạng có nút "Nghe" hoặc "Nghe mẫu". */
export const AUDIO_KINDS: readonly ExerciseKind[] = [...LISTEN_KINDS, 'speak'];

const readJson = (file: string): unknown =>
  JSON.parse(readFileSync(file, 'utf8'));

export const lessonFile = (lessonId: string): string =>
  join(PATHS.contentOut, 'lessons', `${lessonId}.json`);

export const readContentRoot = (): ContentRoot =>
  contentRootSchema.parse(readJson(join(PATHS.contentOut, 'content.json')));

export const readLesson = (lessonId: string): Lesson =>
  lessonSchema.parse(readJson(lessonFile(lessonId)));

export const readWords = (): Word[] =>
  wordSchema.array().parse(readJson(join(PATHS.contentOut, 'words.json')));

export const readSentences = (): Sentence[] =>
  sentenceSchema
    .array()
    .parse(readJson(join(PATHS.contentOut, 'sentences.json')));

export const readStrokeIndex = (): StrokeIndex =>
  strokeIndexSchema.parse(readJson(join(PATHS.strokesOut, 'index.json')));

/** lessonIds của mọi unit trong stage đầu "Nhập môn", theo thứ tự lộ trình. */
export const introLessonIdsInPath = (): string[] => {
  const [firstStage] = readContentRoot().stages;
  return firstStage?.title === INTRO_STAGE_TITLE
    ? firstStage.units.flatMap((unit) => unit.lessonIds)
    : [];
};

/** Mọi bài có file đã build, chỉ đọc file tồn tại (bài thiếu do assertion khác báo). */
export const readExistingLessons = (lessonIds: readonly string[]): Lesson[] =>
  lessonIds
    .filter((lessonId) => existsSync(lessonFile(lessonId)))
    .map(readLesson);

/** ID từ mà câu bài tập dùng tới. */
export const wordIdsOf = (exercise: Exercise): string[] => {
  switch (exercise.kind) {
    case 'sound-pair':
      return [...exercise.wordIds];
    case 'speak':
      return exercise.wordId === undefined ? [] : [exercise.wordId];
    default:
      return [exercise.wordId];
  }
};

export const sentenceIdsOf = (exercise: Exercise): string[] =>
  exercise.kind === 'speak' && exercise.sentenceId !== undefined
    ? [exercise.sentenceId]
    : [];

const PUNCTUATION_PATTERN = /[^\p{L}\s'’-]/gu;

/**
 * Có biến điệu (spec "Bài 2 chỉ luyện biến điệu bằng nói theo mẫu"): chữ "不", chữ "一", hoặc
 * hai âm tiết thanh 3 liền nhau theo `parsePinyin`.
 */
export const hasToneSandhi = (text: {
  hanzi: string;
  pinyin: string;
}): boolean => {
  if (text.hanzi.includes('不') || text.hanzi.includes('一')) {
    return true;
  }
  const tones = parsePinyin(text.pinyin.replace(PUNCTUATION_PATTERN, ' ')).map(
    (syllable) => syllable.tone,
  );
  return tones.some((tone, index) => tone === 3 && tones[index + 1] === 3);
};
