import {
  DAILY_GOAL_OPTIONS,
  type DailyGoalMinutes,
  type LessonStatus,
  type Settings,
  type Stage,
} from '@csk/shared';

import {
  progressStore,
  type ProgressStore,
} from '@core/services/progress-store.service';

export class ProgressService {
  constructor(private readonly store: ProgressStore = progressStore) {}

  // ── PHẦN 1 — TRUY CẬP DỮ LIỆU ─────────────────────────

  private readSettings(): Promise<Settings> {
    return this.store.getSettings();
  }

  private writeSettings(settings: Settings): Promise<void> {
    return this.store.saveSettings(settings);
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
    const lessonIds = stages.flatMap((stage) =>
      stage.units.flatMap((unit) => unit.lessonIds),
    );
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
}
