/** Kết quả một câu do component dạng bài tập báo về cho khung chạy bài (S3.2). */
export interface ExerciseResult {
  isCorrect: boolean;
  /** Giải thích hiện khi trả lời sai; do component dạng bài soạn từ từ/câu của nó. */
  explanation?: string;
}
