import type { ComponentType } from 'react';
import type { Exercise, ExerciseKind } from '@csk/shared';

import type {
  ExerciseContent,
  ExerciseProps,
  ExerciseResult,
} from './exercise.types';
import { PinyinTypeExercise } from './PinyinTypeExercise';
import { ToneChoiceExercise } from './ToneChoiceExercise';

/** Map `kind` → component dạng bài. Dạng nào chưa có thì chưa đăng ký. */
export type ExerciseRegistry = Partial<{
  [K in ExerciseKind]: ComponentType<ExerciseProps<K>>;
}>;

/** E4–E6 (rồi E10) đăng ký dần vào đây. */
export const exerciseRegistry: ExerciseRegistry = {
  'tone-choice': ToneChoiceExercise,
  'pinyin-type': PinyinTypeExercise,
};

type AnyExerciseComponent = ComponentType<{
  exercise: Exercise;
  content: ExerciseContent;
  onResult: (result: ExerciseResult) => void;
  isLocked: boolean;
}>;

/**
 * Tìm component theo `kind` của câu. TypeScript không tự ghép được `kind` với props tương ứng
 * khi tra bằng khóa động, nên chỗ ép kiểu duy nhất nằm ở đây; runner không cần biết.
 */
export const resolveExerciseComponent = (
  registry: ExerciseRegistry,
  exercise: Exercise,
): AnyExerciseComponent | undefined =>
  registry[exercise.kind] as AnyExerciseComponent | undefined;
