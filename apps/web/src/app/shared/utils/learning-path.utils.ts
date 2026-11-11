import type { Stage } from '@csk/shared';

/** Thứ tự học = thứ tự khai báo Stage → Unit → lessonIds trong lộ trình (S3.1 AC1). */
export const listLessonIdsInOrder = (stages: readonly Stage[]): string[] =>
  stages.flatMap((stage) => stage.units.flatMap((unit) => unit.lessonIds));
