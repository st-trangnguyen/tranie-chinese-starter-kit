import {
  DAILY_GOAL_OPTIONS,
  type LESSON_TYPES,
  type DailyGoalMinutes,
  type LessonProgress,
  type LessonStatus,
  type Settings,
  type Stage,
  type Unit,
} from '@csk/shared';

import {
  progressStore,
  type ProgressStore,
} from '@core/services/progress-store.service';
import { listLessonIdsInOrder } from '@shared/utils/learning-path.utils';

type LessonType = (typeof LESSON_TYPES)[number];

export class ProgressService {
  constructor(private readonly store: ProgressStore = progressStore) {}

  // ── PHẦN 1 — TRUY CẬP DỮ LIỆU ─────────────────────────

  private readSettings(): Promise<Settings> {
    return this.store.getSettings();
  }

  private writeSettings(settings: Settings): Promise<void> {
    return this.store.saveSettings(settings);
  }

  private readAllLessonProgress(): Promise<LessonProgress[]> {
    return this.store.getAllLessonProgress();
  }

  // ── PHẦN 2 — QUY TẮC NGHIỆP VỤ ───────────────────────

  /** Rule: mục tiêu mỗi ngày chỉ được là 15, 30 hoặc 60 phút (S1.3 AC1). */
  isValidDailyGoal(minutes: number): minutes is DailyGoalMinutes {
    return DAILY_GOAL_OPTIONS.some((option) => option === minutes);
  }

  /** Rule: onboarding chỉ hiện cho tới khi người học hoàn thành (S1.3 AC3). */
  shouldShowOnboarding(settings: Settings): boolean {
    return !settings.hasCompletedOnboarding;
  }

  /**
   * Rule: mở khóa Nhập môn (F5, S3.1 AC2) — duỗi lộ trình theo thứ tự; bài đầu luôn mở, bài sau mở
   * khi bài liền trước đã xong (kể cả qua ranh giới nhóm/giai đoạn), bài đã xong là đã xong.
   */
  deriveLessonStatuses(
    stages: readonly Stage[],
    completedLessonIds: ReadonlySet<string>,
  ): Map<string, LessonStatus> {
    const lessonIds = listLessonIdsInOrder(stages);
    return new Map(
      lessonIds.map((lessonId, index): [string, LessonStatus] => {
        if (completedLessonIds.has(lessonId)) {
          return [lessonId, 'completed'];
        }
        const previousId = lessonIds[index - 1];
        const isOpen =
          previousId === undefined || completedLessonIds.has(previousId);
        return [lessonId, isOpen ? 'open' : 'locked'];
      }),
    );
  }

  /** Rule: chủ đề chưa mở = mọi bài của chủ đề đều khóa. */
  isUnitLocked(
    unit: Unit,
    statuses: ReadonlyMap<string, LessonStatus>,
  ): boolean {
    return unit.lessonIds.every(
      (lessonId) => statuses.get(lessonId) === 'locked',
    );
  }

  /**
   * Rule: nút "Kiểm tra vượt cấp" (S3.6 AC1) chỉ có ở chủ đề chưa mở (mọi bài đều khóa); bài kiểm tra
   * của chủ đề là bài cuối có type `test`, không có thì không có nút.
   */
  getPlacementTestLessonId(
    unit: Unit,
    statuses: ReadonlyMap<string, LessonStatus>,
    lessonTypes: ReadonlyMap<string, LessonType>,
  ): string | undefined {
    if (!this.isUnitLocked(unit, statuses)) {
      return undefined;
    }
    return unit.lessonIds.findLast(
      (lessonId) => lessonTypes.get(lessonId) === 'test',
    );
  }

  // ── PHẦN 3 — USE CASES ───────────────────────────────

  async needsOnboarding(): Promise<boolean> {
    const settings = await this.readSettings();
    return this.shouldShowOnboarding(settings);
  }

  async completeOnboarding(minutes: number): Promise<void> {
    if (!this.isValidDailyGoal(minutes)) {
      throw new Error('Mục tiêu mỗi ngày phải là 15, 30 hoặc 60 phút.');
    }
    const settings = await this.readSettings();
    await this.writeSettings({
      ...settings,
      dailyGoalMinutes: minutes,
      hasCompletedOnboarding: true,
    });
  }

  async getCompletedLessonIds(): Promise<Set<string>> {
    const progress = await this.readAllLessonProgress();
    return new Set(
      progress
        .filter((lesson) => lesson.status === 'completed')
        .map((lesson) => lesson.lessonId),
    );
  }
}
