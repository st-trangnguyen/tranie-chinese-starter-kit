import type { ReviewCard, Word } from '@csk/shared';

/** Đầu vào quy tắc tạo thẻ cho một bài vừa xong (`SrsService.planLessonCards`). */
export interface LessonCardPlanInput {
  /** Từ của bài, đã bỏ trùng, giữ thứ tự. */
  wordIds: readonly string[];
  wordsById: ReadonlyMap<string, Word>;
  /** Mọi thẻ đã có trên máy. */
  cards: readonly ReviewCard[];
  writtenCharacters: ReadonlySet<string>;
  /** Chữ có dữ liệu nét. */
  strokeCharacters: ReadonlySet<string>;
  /** Epoch ms. */
  now: number;
}
