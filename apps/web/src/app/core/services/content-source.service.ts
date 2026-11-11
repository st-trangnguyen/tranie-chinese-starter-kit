import type { ContentRoot, Lesson } from '@csk/shared';

/**
 * Nguồn nội dung tĩnh (JSON do pipeline `@csk/content` sinh, precache bởi service worker).
 * Trả dữ liệu đã validate bằng schema của `@csk/shared` (CLAUDE.md §0.4).
 */
export interface ContentSource {
  getContentRoot(): Promise<ContentRoot>;
  getLesson(lessonId: string): Promise<Lesson>;
}
