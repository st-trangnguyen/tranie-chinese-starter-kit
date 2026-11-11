import type { Exercise, ExerciseKind } from '@csk/shared';

import type { ExerciseResult } from '@shared/models/exercise.model';

export type { ExerciseResult };

/** Hợp đồng chung của mọi dạng bài tập (docs/03-architecture.md §6.3): chỉ nhận props. */
export interface ExerciseProps<K extends ExerciseKind> {
  exercise: Extract<Exercise, { kind: K }>;
  onResult: (result: ExerciseResult) => void;
}
