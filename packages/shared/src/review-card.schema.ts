import { z } from 'zod';

import { idSchema } from './content.schema';
import { hanCharacterSchema } from './stroke.schema';

/** Chiều của thẻ ôn tập: nghĩa · nghe · viết. */
export const CARD_FACETS = ['meaning', 'listening', 'writing'] as const;
export type CardFacet = (typeof CARD_FACETS)[number];

/** Trạng thái FSRS của thẻ; `'new'` = thẻ "mới", chưa ôn lần nào. */
export const CARD_STATES = ['new', 'learning', 'review', 'relearning'] as const;
export type CardState = (typeof CARD_STATES)[number];

/**
 * Thẻ ôn tập, mirror `Card` của `ts-fsrs` (camelCase, thời điểm là epoch ms, trạng thái là chuỗi).
 * Dùng chung cho dòng DB và file sao lưu. `wordId` không đối chiếu nội dung: từ lạ vẫn hợp lệ.
 */
export const reviewCardSchema = z.object({
  wordId: idSchema,
  facet: z.enum(CARD_FACETS),
  state: z.enum(CARD_STATES),
  due: z.number().int().nonnegative(),
  stability: z.number().finite().nonnegative(),
  difficulty: z.number().finite().nonnegative(),
  elapsedDays: z.number().finite().nonnegative(),
  scheduledDays: z.number().finite().nonnegative(),
  learningSteps: z.number().int().nonnegative(),
  reps: z.number().int().nonnegative(),
  lapses: z.number().int().nonnegative(),
  lastReview: z.number().int().nonnegative().optional(),
});
export type ReviewCard = z.infer<typeof reviewCardSchema>;

/** Khóa thẻ trong DB và khóa so trùng trong file: `${wordId}:${facet}`. */
export const reviewCardId = (wordId: string, facet: CardFacet): string =>
  `${wordId}:${facet}`;

/** Dòng DB của một chữ Hán người học đã viết xong (có gợi ý). */
export const writtenCharacterSchema = z.object({
  character: hanCharacterSchema,
});
