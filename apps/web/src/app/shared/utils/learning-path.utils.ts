import type { Lesson, Stage } from '@csk/shared';

/** Thứ tự học = thứ tự khai báo Stage → Unit → lessonIds trong lộ trình (S3.1 AC1). */
export const listLessonIdsInOrder = (stages: readonly Stage[]): string[] =>
  stages.flatMap((stage) => stage.units.flatMap((unit) => unit.lessonIds));

/** Rule: bài kiểm tra vượt cấp của chủ đề là bài cuối có type `test` (S3.6); không có thì undefined. */
export const findPlacementTestLessonId = (
  lessonIds: readonly string[],
  lessonTypes: ReadonlyMap<string, Lesson['type']>,
): string | undefined =>
  lessonIds.findLast((lessonId) => lessonTypes.get(lessonId) === 'test');

/**
 * Rule: chỉ chắc bài kiểm tra vượt cấp khi biết loại của MỌI bài trong chủ đề; có bài chưa biết loại
 * (nạp lỗi) thì không chắc bài nào là bài cuối nên trả undefined.
 */
export const findConfirmedPlacementTestLessonId = (
  lessonIds: readonly string[],
  lessonTypes: ReadonlyMap<string, Lesson['type']>,
): string | undefined =>
  lessonIds.some((lessonId) => !lessonTypes.has(lessonId))
    ? undefined
    : findPlacementTestLessonId(lessonIds, lessonTypes);
