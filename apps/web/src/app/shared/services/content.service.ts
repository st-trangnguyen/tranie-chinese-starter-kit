import type { ContentRoot, Lesson, Stage } from '@csk/shared';

import {
  contentSource,
  type ContentSource,
} from '@core/services/content-source.service';
import type { PathMap } from '@shared/models/learning-path.model';

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

  /** Rule: thứ tự học là thứ tự khai báo Stage → Unit → lessonIds trong lộ trình (S3.1 AC1). */
  listLessonIdsInOrder(stages: readonly Stage[]): string[] {
    return stages.flatMap((stage) =>
      stage.units.flatMap((unit) => unit.lessonIds),
    );
  }

  // ── PHẦN 3 — USE CASES ───────────────────────────────

  async getPathMap(): Promise<PathMap> {
    try {
      const root = await this.readContentRoot();
      const lessons = await Promise.all(
        this.listLessonIdsInOrder(root.stages).map((lessonId) =>
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
}
