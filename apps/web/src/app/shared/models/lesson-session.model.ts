import type { Exercise } from '@csk/shared';

import type { ExerciseResult } from './exercise.model';

export type LessonPhase = 'answering' | 'feedback' | 'finished';

/** Trạng thái một lượt làm bài (S3.2). Không lưu xuống IndexedDB (S3.3, S3.4 mở rộng). */
export interface LessonSession {
  exerciseIds: readonly string[];
  currentIndex: number;
  phase: LessonPhase;
  /** Có khi `phase` là 'feedback'. */
  lastResult: ExerciseResult | null;
  /** Số câu đã bỏ qua vì dạng bài chưa được hỗ trợ. */
  skippedCount: number;
}

/** Kết quả hiện sau khi trả lời. */
export interface LessonFeedbackView {
  isCorrect: boolean;
  /** Đã lọc theo quy tắc: chỉ có khi trả lời sai. */
  explanation?: string;
}

/** Những gì khung chạy bài cần để vẽ một câu (S3.2). */
export interface LessonRunnerView {
  exercise: Exercise;
  /** Câu đang làm, tính từ 1. */
  current: number;
  total: number;
  /** null khi chưa trả lời. */
  feedback: LessonFeedbackView | null;
}
