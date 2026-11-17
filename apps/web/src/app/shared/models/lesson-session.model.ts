import type { Exercise } from '@csk/shared';

import type { ExerciseContent, ExerciseResult } from './exercise.model';
import type { StrokeOrderView } from './stroke-order.model';
import type {
  StrokeAttemptResult,
  WritingPracticeState,
} from './writing-practice.model';

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
  /** Số câu đã trả lời đúng (S3.4). */
  correctCount: number;
  /** Số câu đã trả lời sai (S3.4). */
  wrongCount: number;
  /** ID các câu đã trả lời sai, theo thứ tự làm bài; không gồm câu bỏ qua (S3.5). */
  wrongExerciseIds: readonly string[];
  /** Mốc bắt đầu (ms epoch). */
  startedAt: number;
  /** Mốc kết thúc (ms epoch); null khi chưa xong bài. */
  finishedAt: number | null;
}

/** Tổng kết một lượt làm bài (S3.4). */
export interface LessonSummary {
  /** Phần trăm làm tròn nguyên; 0 khi chưa trả lời câu nào. */
  scorePercent: number;
  correctCount: number;
  answeredCount: number;
  wrongCount: number;
  skippedCount: number;
  elapsedSeconds: number;
  /** null với bài thường; với bài kiểm tra: đạt ngưỡng hay chưa (S3.5). */
  isPassed: boolean | null;
  isComplete: boolean;
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
  /** Từ/câu đã nạp của câu hiện tại (S4.4). */
  content: ExerciseContent;
  /** Câu đang làm, tính từ 1. */
  current: number;
  total: number;
  /** null khi chưa trả lời. */
  feedback: LessonFeedbackView | null;
  /** Dữ liệu câu viết (S7.1); vắng mặt thì câu viết hiện như đang tải. */
  strokeWrite?: LessonStrokeWriteView | null;
}

/** Những gì câu viết (`stroke-write`) trong màn bài cần để vẽ khung viết (S7.1). */
export interface LessonStrokeWriteView {
  exerciseId: string;
  character: string;
  view: StrokeOrderView;
  /** Lượt viết hiện tại; `null` khi chưa có dữ liệu nét. */
  practice: WritingPracticeState | null;
  retry: () => void;
  recordStrokeAttempt: (result: StrokeAttemptResult) => void;
}
