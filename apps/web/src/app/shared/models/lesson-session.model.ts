import type { ExerciseResult } from './exercise.model';

export type LessonPhase = 'answering' | 'feedback' | 'finished';

/** Trạng thái một lượt làm bài (S3.2). Không lưu xuống IndexedDB (S3.3, S3.4 mở rộng). */
export interface LessonSession {
  exerciseIds: readonly string[];
  currentIndex: number;
  phase: LessonPhase;
  /** Có khi `phase` là 'feedback'. */
  lastResult: ExerciseResult | null;
}
