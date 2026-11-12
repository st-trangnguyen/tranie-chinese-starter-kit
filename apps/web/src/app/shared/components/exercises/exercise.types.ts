import type { Exercise, ExerciseKind } from '@csk/shared';

import type {
  ExerciseContent,
  ExerciseResult,
} from '@shared/models/exercise.model';

export type { ExerciseContent, ExerciseResult };

/** Hợp đồng chung của mọi dạng bài tập (docs/03-architecture.md §6.3): chỉ nhận props. */
export interface ExerciseProps<K extends ExerciseKind> {
  exercise: Extract<Exercise, { kind: K }>;
  /** Từ/câu đã nạp của câu này, để dạng bài phát audio (S4.4). */
  content: ExerciseContent;
  onResult: (result: ExerciseResult) => void;
  /** true sau khi câu đã được chấm: dạng bài phải khóa đáp án, không nhận trả lời thêm. */
  isLocked: boolean;
}
