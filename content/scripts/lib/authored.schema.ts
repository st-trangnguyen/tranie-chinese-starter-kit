import { isToneMarkedPinyin, voiceSchema } from '@csk/shared';
import { z } from 'zod';

/*
 * Schema của phần người soạn viết tay trong `content/authored/` (đầu vào pipeline). Schema
 * output mà app đọc nằm ở `@csk/shared` (`content.schema.ts`).
 */

const text = z.string().trim().min(1);

/** `vi-meanings.yaml`: wordId → nghĩa tiếng Việt + đã review chưa (S2.2). */
export const viMeaningsSchema = z.record(
  z.object({
    vi: z.array(text),
    reviewed: z.boolean(),
  }),
);
export type ViMeanings = z.infer<typeof viMeaningsSchema>;

/**
 * `tts-overrides.yaml`: wordId → chữ đọc thay cho TTS. Dùng cho chữ đa âm mà edge-tts đọc
 * sai khi đứng một mình (edge-tts không nhận SSML phoneme), ví dụ `还:huán: 环`.
 */
export const ttsOverridesSchema = z.record(text);
export type TtsOverrides = z.infer<typeof ttsOverridesSchema>;

/** `path.yaml`: lộ trình Stage → Unit → thứ tự ID bài. */
export const authoredPathSchema = z.object({
  stages: z.array(
    z.object({
      id: text,
      title: text,
      units: z.array(
        z.object({ id: text, title: text, lessons: z.array(text).min(1) }),
      ),
    }),
  ),
});
export type AuthoredPath = z.infer<typeof authoredPathSchema>;

/** Câu soạn trong file bài; pipeline thêm `audio` khi build. */
export const authoredSentenceSchema = z.object({
  id: text,
  hanzi: text.regex(/\p{Script=Han}/u, 'Câu phải có chữ Hán'),
  pinyin: text.refine(
    isToneMarkedPinyin,
    'Pinyin phải viết bằng dấu thanh, không số, ký tự hợp lệ',
  ),
  vi: text,
  voice: voiceSchema.default('female'),
});
export type AuthoredSentence = z.infer<typeof authoredSentenceSchema>;

/** Phần riêng của file bài YAML; phần còn lại kiểm bằng `lessonSchema` của `@csk/shared`. */
export const authoredLessonExtrasSchema = z.object({
  sentences: z.array(authoredSentenceSchema).default([]),
});

export const AUTHORED_LESSON_KEYS = [
  'id',
  'type',
  'title',
  'exercises',
  'sentences',
] as const;
