import type { ContentRoot, Lesson } from '@csk/shared';

import {
  contentSource,
  type ContentSource,
} from '@core/services/content-source.service';
import type { PathMap } from '@shared/models/learning-path.model';
import { listLessonIdsInOrder } from '@shared/utils/learning-path.utils';

export class ContentService {
  constructor(private readonly source: ContentSource = contentSource) {}

  // ── PHẦN 1 — TRUY CẬP DỮ LIỆU ─────────────────────────

  private readContentRoot(): Promise<ContentRoot> {
    return this.source.getContentRoot();
  }

  private readLesson(lessonId: string): Promise<Lesson> {
    return this.source.getLesson(lessonId);
  }

  // ── PHẦN 2 — QUY TẮC NGHIỆP VỤ ───────────────────────
  // Thứ tự bài dùng chung `listLessonIdsInOrder` (shared/utils); chưa có rule riêng.

  // ── PHẦN 3 — USE CASES ───────────────────────────────

  async getPathMap(): Promise<PathMap> {
    try {
      const root = await this.readContentRoot();
      const lessons = await Promise.all(
        listLessonIdsInOrder(root.stages).map((lessonId) =>
          this.readLesson(lessonId),
        ),
      );
      return {
        stages: root.stages,
        lessonTitles: new Map(
          lessons.map((lesson) => [lesson.id, lesson.title]),
        ),
      };
    } catch (error) {
      throw new Error('Không tải được lộ trình học.', { cause: error });
    }
  }

  async getLessonTypes(
    lessonIds: readonly string[],
  ): Promise<Map<string, Lesson['type']>> {
    try {
      const lessons = await Promise.all(
        lessonIds.map((lessonId) => this.readLesson(lessonId)),
      );
      return new Map(lessons.map((lesson) => [lesson.id, lesson.type]));
    } catch (error) {
      throw new Error('Không tải được loại bài học.', { cause: error });
    }
  }

  /**
   * Rule: bài kiểm tra vượt cấp của chủ đề là bài cuối có type `test` (S3.6); không có chủ đề
   * hoặc không có bài kiểm tra thì lỗi, không rơi sang bài khác.
   */
  async getPlacementTest(
    unitId: string,
  ): Promise<{ lessonId: string; lessonIds: readonly string[] }> {
    const lessonIds = await this.getUnitLessonIds(unitId);
    // Duyệt từ bài cuối và dừng ở bài `test` đầu tiên: không nạp thừa các bài phía trước.
    for (const candidate of [...lessonIds].reverse()) {
      const lesson = await this.getLesson(candidate);
      if (lesson.type === 'test') {
        return { lessonId: candidate, lessonIds };
      }
    }
    throw new Error('Chủ đề không có bài kiểm tra.');
  }

  async getUnitLessonIds(unitId: string): Promise<readonly string[]> {
    const root = await this.readContentRoot();
    const unit = root.stages
      .flatMap((stage) => stage.units)
      .find((candidate) => candidate.id === unitId);
    if (unit === undefined) {
      throw new Error('Không tìm thấy chủ đề.');
    }
    return unit.lessonIds;
  }

  async getLesson(lessonId: string): Promise<Lesson> {
    try {
      return await this.readLesson(lessonId);
    } catch (error) {
      throw new Error('Không mở được bài học.', { cause: error });
    }
  }
}
