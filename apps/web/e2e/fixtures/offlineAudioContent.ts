/*
 * Gộp nội dung mẫu S8.4 vào `content.json`, `sentences.json`, `audio-index.json` thật của bản build
 * (design D12). Chỉ validate phần cần để gộp; app validate đầy đủ khi nạp (schema `@csk/shared`).
 * Dùng `zod` trực tiếp vì file chạy trong Node lúc `vite preview` (không nạp được mã TS của `@csk/shared`).
 */
import { readFile } from 'fs/promises';
import Path from 'path';
import { z } from 'zod';

import {
  E2E_AUDIO,
  INTRO_EMPTY_UNIT,
  INTRO_EMPTY_VARIANT,
  INTRO_SENTENCE_IDS,
  INTRO_STAGE_ID,
  OFFLINE_AUDIO_SENTENCES,
  OFFLINE_AUDIO_STAGE,
  OFFLINE_AUDIO_UNITS,
  type FixtureUnit,
  type OfflineAudioVariant,
} from './offlineAudioFixtures';

const stageSchema = z
  .object({ id: z.string(), units: z.array(z.unknown()) })
  .passthrough();
const contentRootSchema = z
  .object({ stages: z.array(stageSchema) })
  .passthrough();
const sentencesSchema = z.array(
  z.object({ id: z.string(), audio: z.string() }).passthrough(),
);
const audioIndexSchema = z.object({
  units: z.record(z.array(z.string())),
  bytes: z.record(z.number()),
  precached: z.array(z.string()),
});

export const MERGED_CONTENT_FILES = [
  'content.json',
  'sentences.json',
  'audio-index.json',
] as const;
export type MergedContentFile = (typeof MERGED_CONTENT_FILES)[number];

const toPathUnit = (unit: FixtureUnit) => ({
  id: unit.id,
  title: unit.title,
  lessonIds: unit.lessons.map((lesson) => lesson.id),
});

const fixtureUnitsOf = (variant: OfflineAudioVariant): FixtureUnit[] =>
  variant === INTRO_EMPTY_VARIANT
    ? [...OFFLINE_AUDIO_UNITS, INTRO_EMPTY_UNIT]
    : OFFLINE_AUDIO_UNITS;

const mergeContentRoot = (raw: unknown, variant: OfflineAudioVariant) => {
  const root = contentRootSchema.parse(raw);
  const stages = root.stages.map((stage) =>
    stage.id === INTRO_STAGE_ID && variant === INTRO_EMPTY_VARIANT
      ? { ...stage, units: [...stage.units, toPathUnit(INTRO_EMPTY_UNIT)] }
      : stage,
  );
  return {
    ...root,
    stages: [
      ...stages,
      { ...OFFLINE_AUDIO_STAGE, units: OFFLINE_AUDIO_UNITS.map(toPathUnit) },
    ],
  };
};

const mergeSentences = (raw: unknown) => [
  ...sentencesSchema.parse(raw),
  ...OFFLINE_AUDIO_SENTENCES,
];

/** Audio một chủ đề phát (rule pipeline D2: `speak` câu → audio câu), không trùng, theo thứ tự bài. */
const unitAudio = (
  unit: FixtureUnit,
  audioBySentence: ReadonlyMap<string, string>,
): string[] => {
  const paths = unit.lessons.flatMap((lesson) =>
    lesson.exercises.flatMap((exercise) => {
      if (exercise.kind !== 'speak' || exercise.sentenceId === undefined) {
        return [];
      }
      const audio = audioBySentence.get(exercise.sentenceId);
      if (audio === undefined) {
        throw new Error(`Câu mẫu "${exercise.sentenceId}" không có audio.`);
      }
      return [audio];
    }),
  );
  return [...new Set(paths)];
};

const mergeAudioIndex = (
  rawIndex: unknown,
  rawSentences: unknown,
  variant: OfflineAudioVariant,
) => {
  const index = audioIndexSchema.parse(rawIndex);
  const audioBySentence = new Map(
    mergeSentences(rawSentences).map((item) => [item.id, item.audio]),
  );
  const introAudio = [
    INTRO_SENTENCE_IDS.c,
    INTRO_SENTENCE_IDS.shared,
    ...INTRO_SENTENCE_IDS.only,
  ].map((id) => audioBySentence.get(id));
  if (introAudio.some((path) => !path || !index.precached.includes(path))) {
    throw new Error(
      'Câu Nhập môn dùng trong nội dung mẫu không có audio precache.',
    );
  }
  const units = Object.fromEntries(
    fixtureUnitsOf(variant).map((unit) => [
      unit.id,
      unitAudio(unit, audioBySentence),
    ]),
  );
  const bytes = Object.fromEntries(
    Object.values(E2E_AUDIO).map((audio) => [audio.path, audio.bytes]),
  );
  return {
    units: { ...index.units, ...units },
    bytes: { ...index.bytes, ...bytes },
    // Audio mẫu không vào precache: chủ đề HSK mẫu phải tải hoặc phát mới có trên máy.
    precached: index.precached,
  };
};

const readJson = async (contentDir: string, file: string): Promise<unknown> =>
  JSON.parse(await readFile(Path.join(contentDir, file), 'utf8'));

/** Bản gộp mẫu của một file nội dung, đọc file thật trong `<outDir>/content/`. */
export const readMergedContent = async (
  contentDir: string,
  file: MergedContentFile,
  variant: OfflineAudioVariant,
): Promise<unknown> => {
  if (file === 'content.json') {
    return mergeContentRoot(await readJson(contentDir, file), variant);
  }
  if (file === 'sentences.json') {
    return mergeSentences(await readJson(contentDir, file));
  }
  return mergeAudioIndex(
    await readJson(contentDir, file),
    await readJson(contentDir, 'sentences.json'),
    variant,
  );
};
