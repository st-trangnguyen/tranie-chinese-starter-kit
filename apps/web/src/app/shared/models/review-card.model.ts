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

/** Đầu vào quy tắc tạo thẻ chiều viết sau một lần viết (`SrsService.planWritingCards`). */
export interface WritingCardPlanInput {
  /** Chữ vừa viết xong. */
  character: string;
  /** Mọi từ trong nội dung. */
  words: readonly Word[];
  /** Mọi thẻ đã có trên máy. */
  cards: readonly ReviewCard[];
  /** Chữ đã viết, gồm cả chữ vừa viết. */
  writtenCharacters: ReadonlySet<string>;
  /** Chữ có dữ liệu nét. */
  strokeCharacters: ReadonlySet<string>;
  /** Epoch ms. */
  now: number;
}
