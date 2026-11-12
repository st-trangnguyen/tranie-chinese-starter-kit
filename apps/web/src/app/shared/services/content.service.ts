import type { ContentRoot, Lesson } from '@csk/shared';

import {
  contentSource,
  type ContentSource,
} from '@core/services/content-source.service';
import type { PathMap } from '@shared/models/learning-path.model';
import {
  findPlacementTestLessonId,
  listLessonIdsInOrder,
} from '@shared/utils/learning-path.utils';

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

  /**
   * Như getPathMap nhưng chịu lỗi từng bài: bài nạp lỗi chỉ thiếu tiêu đề (UI dùng id thay thế),
   * bản đồ vẫn hiện. Chỉ lỗi đọc lộ trình mới làm hỏng cả bản đồ.
   */
  async getPartialPathMap(): Promise<PathMap> {
    try {
      const root = await this.readContentRoot();
      const results = await Promise.allSettled(
        listLessonIdsInOrder(root.stages).map((lessonId) =>
          this.readLesson(lessonId),
        ),
      );
      return {
        stages: root.stages,
        lessonTitles: new Map(
          results.flatMap((result) =>
            result.status === 'fulfilled'
              ? [[result.value.id, result.value.title] as const]
              : [],
          ),
        ),
      };
    } catch (error) {
      throw new Error('Không tải được lộ trình học.', { cause: error });
    }
  }

  /** Bài nạp lỗi bị bỏ khỏi kết quả (không làm hỏng cả lô); người gọi tự xử lý bài thiếu. */
  async getLessonTypes(
    lessonIds: readonly string[],
  ): Promise<Map<string, Lesson['type']>> {
    const results = await Promise.allSettled(
      lessonIds.map((lessonId) => this.readLesson(lessonId)),
    );
    return new Map(
      results.flatMap((result) =>
        result.status === 'fulfilled'
          ? [[result.value.id, result.value.type] as const]
          : [],
      ),
    );
  }

  /**
   * Rule: bài kiểm tra vượt cấp của chủ đề là bài cuối có type `test` (S3.6); không có chủ đề
   * hoặc không có bài kiểm tra thì lỗi, không rơi sang bài khác.
   */
  async getPlacementTest(
    unitId: string,
  ): Promise<{ lessonId: string; lessonIds: readonly string[] }> {
    const lessonIds = await this.getUnitLessonIds(unitId);
    const types = new Map<string, Lesson['type']>();
    // Duyệt từ bài cuối, nạp dần và dừng khi đã thấy bài `test`: không nạp thừa các bài phía trước.
    for (let index = lessonIds.length - 1; index >= 0; index -= 1) {
      const candidate = lessonIds[index];
      if (candidate === undefined) {
        continue;
      }
      types.set(candidate, (await this.getLesson(candidate)).type);
      const lessonId = findPlacementTestLessonId(lessonIds, types);
      if (lessonId !== undefined) {
        return { lessonId, lessonIds };
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
