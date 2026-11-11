import type { Stage } from '@csk/shared';

/** Dữ liệu bản đồ lộ trình (S3.1): thứ tự Stage → Unit → lessonIds kèm tiêu đề từng bài. */
export interface PathMap {
  stages: readonly Stage[];
  lessonTitles: ReadonlyMap<string, string>;
}
