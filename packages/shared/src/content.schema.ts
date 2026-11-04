import { z } from 'zod';

import { isToneMarkedPinyin } from './pinyin.utils';

/*
 * Schema nội dung (docs/03-architecture.md §6.1): pipeline `@csk/content` sinh JSON theo các
 * schema này vào `apps/web/src/assets/content/`, app validate lại khi nạp.
 * Bài tập tham chiếu từ/câu bằng ID qua field `wordId`, `wordIds`, `sentenceId`.
 */

const idSchema = z.string().trim().min(1);
const hanziSchema = z
  .string()
  .regex(/\p{Script=Han}/u, 'Phải có ít nhất một chữ Hán');
const pinyinSchema = z
  .string()
  .refine(
    isToneMarkedPinyin,
    'Pinyin phải viết bằng dấu thanh, không số, ký tự hợp lệ',
  );
/** Đường dẫn tương đối tới mp3 trong `assets/`, ví dụ `audio/3f2a9c0d1b2e4f56.mp3`. */
const audioPathSchema = z.string().regex(/^audio\/[0-9a-f]{16}\.mp3$/);

export const VOICES = ['female', 'male'] as const;
export const voiceSchema = z.enum(VOICES);
export type Voice = z.infer<typeof voiceSchema>;

export const wordSchema = z.object({
  id: idSchema,
  hanzi: hanziSchema,
  pinyin: pinyinSchema,
  vi: z.array(z.string().trim().min(1)),
  /** Nghĩa đã được người soạn review (S2.2). */
  viReviewed: z.boolean(),
  hsk: z.number().int().min(1).max(9),
  audio: audioPathSchema,
});
export type Word = z.infer<typeof wordSchema>;

export const sentenceSchema = z.object({
  id: idSchema,
  hanzi: hanziSchema,
  pinyin: pinyinSchema,
  vi: z.string().trim().min(1),
  voice: voiceSchema,
  audio: audioPathSchema,
});
export type Sentence = z.infer<typeof sentenceSchema>;

const exerciseBase = { id: idSchema };

/** Dạng bài tập bản 0.1 (E4 nghe & pinyin, E5 nói, E6 viết). */
export const exerciseSchema = z.discriminatedUnion('kind', [
  z.object({
    ...exerciseBase,
    kind: z.literal('tone-choice'),
    wordId: idSchema,
  }),
  z.object({
    ...exerciseBase,
    kind: z.literal('sound-pair'),
    wordIds: z.tuple([idSchema, idSchema]),
    answerWordId: idSchema,
  }),
  z.object({
    ...exerciseBase,
    kind: z.literal('pinyin-type'),
    wordId: idSchema,
  }),
  z.object({
    ...exerciseBase,
    kind: z.literal('speak'),
    wordId: idSchema.optional(),
    sentenceId: idSchema.optional(),
  }),
  z.object({
    ...exerciseBase,
    kind: z.literal('stroke-write'),
    wordId: idSchema,
  }),
]);
export type Exercise = z.infer<typeof exerciseSchema>;
export type ExerciseKind = Exercise['kind'];

export const LESSON_TYPES = ['lesson', 'test'] as const;

export const lessonSchema = z
  .object({
    id: idSchema,
    type: z.enum(LESSON_TYPES),
    title: z.string().trim().min(1),
    exercises: z.array(exerciseSchema).min(1),
  })
  .superRefine((lesson, ctx) => {
    lesson.exercises.forEach((exercise, index) => {
      // Rule: bài nói nhắm đúng một đích — một từ hoặc một câu.
      if (
        exercise.kind === 'speak' &&
        (exercise.wordId === undefined) === (exercise.sentenceId === undefined)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['exercises', index],
          message:
            'Bài "speak" cần đúng một trong hai field wordId hoặc sentenceId',
        });
      }
      // Rule: cặp âm phải có đáp án nằm trong cặp.
      if (
        exercise.kind === 'sound-pair' &&
        !exercise.wordIds.includes(exercise.answerWordId)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['exercises', index, 'answerWordId'],
          message: 'answerWordId phải là một trong hai wordIds',
        });
      }
    });
    // Rule: ID bài tập không trùng trong một bài (dùng làm cursor học dở, S3.3).
    const seen = new Set<string>();
    lesson.exercises.forEach((exercise, index) => {
      if (seen.has(exercise.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['exercises', index, 'id'],
          message: `ID bài tập "${exercise.id}" bị trùng`,
        });
      }
      seen.add(exercise.id);
    });
  });
export type Lesson = z.infer<typeof lessonSchema>;

export const unitSchema = z.object({
  id: idSchema,
  title: z.string().trim().min(1),
  lessonIds: z.array(idSchema).min(1),
});
export type Unit = z.infer<typeof unitSchema>;

export const stageSchema = z.object({
  id: idSchema,
  title: z.string().trim().min(1),
  units: z.array(unitSchema).min(1),
});
export type Stage = z.infer<typeof stageSchema>;

/** File gốc `content.json`: lộ trình Stage → Unit → lessonIds, kèm phiên bản nội dung. */
export const contentRootSchema = z.object({
  contentVersion: z.string().regex(/^[0-9a-f]{12}$/),
  stages: z.array(stageSchema),
});
export type ContentRoot = z.infer<typeof contentRootSchema>;
