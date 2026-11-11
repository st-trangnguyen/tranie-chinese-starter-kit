import type { ComponentType } from 'react';
import type { ExerciseKind } from '@csk/shared';

import type { ExerciseProps } from './exercise.types';

/** Map `kind` → component dạng bài. Dạng nào chưa có thì chưa đăng ký. */
export type ExerciseRegistry = Partial<{
  [K in ExerciseKind]: ComponentType<ExerciseProps<K>>;
}>;

/** E4–E6 (rồi E10) đăng ký dần vào đây. */
export const exerciseRegistry: ExerciseRegistry = {};
