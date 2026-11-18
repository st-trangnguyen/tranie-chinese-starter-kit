import type { AudioIndex, Lesson, Sentence, Stage, Word } from '@csk/shared';

/** Dung lượng (byte) của một file audio trong `assets/`, `undefined` nếu file chưa có. */
export type AudioBytes = (path: string) => number | undefined;

/**
 * Rule (S8.4 AC1): audio mà một bài phát, theo thứ tự bài tập.
 * Skeleton (RED 2.1): chưa có hành vi.
 */
export const lessonAudioPaths: (
  lesson: Lesson,
  wordById: ReadonlyMap<string, Word>,
  sentenceById: ReadonlyMap<string, Sentence>,
) => string[] = () => [];

/**
 * Danh sách audio theo chủ đề (design D1, D2) cho `audio-index.json`.
 * Skeleton (RED 2.1): trả index rỗng.
 */
export const buildAudioIndex: (
  stages: readonly Stage[],
  lessons: readonly Lesson[],
  wordById: ReadonlyMap<string, Word>,
  sentenceById: ReadonlyMap<string, Sentence>,
  audioBytes: AudioBytes,
) => AudioIndex = () => ({ units: {}, bytes: {}, precached: [] });
