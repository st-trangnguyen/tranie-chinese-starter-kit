import type { Sentence, Word } from '@csk/shared';

/** Kết quả một câu do component dạng bài tập báo về cho khung chạy bài (S3.2). */
export interface ExerciseResult {
  isCorrect: boolean;
  /** Giải thích hiện khi trả lời sai; do component dạng bài soạn từ từ/câu của nó. */
  explanation?: string;
}

/** Từ/câu đã nạp của một câu bài tập, theo đúng thứ tự ID trong bài (S4.4). */
export interface ExerciseContent {
  readonly words: readonly Word[];
  readonly sentences: readonly Sentence[];
}
