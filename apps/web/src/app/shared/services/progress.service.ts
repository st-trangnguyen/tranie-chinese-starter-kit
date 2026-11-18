import {
  DAILY_GOAL_OPTIONS,
  DEFAULT_SETTINGS,
  type LESSON_TYPES,
  type DailyGoalMinutes,
  type DailyStat,
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
import {
  findConfirmedPlacementTestLessonId,
  listLessonIdsInOrder,
} from '@shared/utils/learning-path.utils';
import {
  previousLocalDateKey,
  startOfNextLocalDay,
  toLocalDateKey,
} from '@shared/utils/date.utils';
import type { StudyTimeShare, TodayStudy } from '@shared/models/home.model';

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

  private readDailyStat(date: string): Promise<DailyStat | undefined> {
    return this.store.getDailyStat(date);
  }

  private addStudySeconds(date: string, seconds: number): Promise<void> {
    return this.store.addStudySeconds(date, seconds);
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
    // Có bài chưa biết loại (nạp lỗi) thì không có nút (rule trong findConfirmedPlacementTestLessonId).
    return findConfirmedPlacementTestLessonId(unit.lessonIds, lessonTypes);
  }

  /**
   * Rule: mỗi phần thời gian học tính vào ngày (giờ máy) nó diễn ra; qua 0 giờ thì cắt tại 0 giờ.
   * Đồng hồ lùi hoặc đoạn rỗng thì không tính (S8.1 AC2).
   */
  splitStudyTimeByDay(startMs: number, endMs: number): StudyTimeShare[] {
    const shares: StudyTimeShare[] = [];
    let cursor = startMs;
    while (cursor < endMs) {
      const segmentEnd = Math.min(startOfNextLocalDay(cursor), endMs);
      shares.push({
        date: toLocalDateKey(cursor),
        seconds: (segmentEnd - cursor) / 1000,
      });
      cursor = segmentEnd;
    }
    return shares;
  }

  /** Rule: thời gian học hiển thị theo phút, làm tròn xuống (S8.1 AC2). */
  toStudyMinutes(seconds: number): number {
    return Math.floor(seconds / 60);
  }

  /** Rule: đạt mục tiêu ngày khi số phút đã học ≥ mục tiêu; vừa đúng mục tiêu là đạt (S8.1 AC2). */
  isDailyGoalReached(minutes: number, goalMinutes: number): boolean {
    return minutes >= goalMinutes;
  }

  /** Rule: ngày đã qua dùng mục tiêu đã lưu của ngày đó; thiếu thì dùng mục tiêu hôm nay (S8.3 AC1). */
  resolveDayGoal(
    dayGoalMinutes: DailyGoalMinutes | undefined,
    todayGoalMinutes: DailyGoalMinutes,
  ): DailyGoalMinutes {
    return dayGoalMinutes ?? todayGoalMinutes;
  }

  /**
   * Rule: ngày không có dòng là chưa đạt; hôm nay so với mục tiêu đang chọn; ngày đã qua chỉ so với
   * mục tiêu của ngày đó, đổi mục tiêu sau không đổi kết quả ngày đã qua (S8.3 AC1).
   */
  isStreakDayReached(
    stat: DailyStat | undefined,
    isToday: boolean,
    todayGoalMinutes: DailyGoalMinutes,
  ): boolean {
    if (stat === undefined) {
      return false;
    }
    const goalMinutes = isToday
      ? todayGoalMinutes
      : this.resolveDayGoal(stat.goalMinutes, todayGoalMinutes);
    return this.isDailyGoalReached(
      this.toStudyMinutes(stat.studySeconds),
      goalMinutes,
    );
  }

  /**
   * Rule: streak là số ngày đạt mục tiêu liên tiếp, tính từ hôm nay nếu hôm nay đã đạt, ngược lại từ
   * hôm qua; dừng ở ngày đầu tiên chưa đạt (S8.3 AC1).
   */
  countStudyStreak(
    stats: readonly DailyStat[],
    today: string,
    todayGoalMinutes: DailyGoalMinutes,
  ): number {
    const statsByDate = new Map(stats.map((stat) => [stat.date, stat]));
    const isReached = (date: string): boolean =>
      this.isStreakDayReached(
        statsByDate.get(date),
        date === today,
        todayGoalMinutes,
      );
    let cursor = isReached(today) ? today : previousLocalDateKey(today);
    let streak = 0;
    while (isReached(cursor)) {
      streak += 1;
      cursor = previousLocalDateKey(cursor);
    }
    return streak;
  }

  /**
   * Rule: bài tiếp theo là bài "Đang mở" đầu tiên theo thứ tự lộ trình; đã xong mọi bài thì không
   * còn bài tiếp theo (S8.1 AC1).
   */
  findNextLessonId(
    stages: readonly Stage[],
    statuses: ReadonlyMap<string, LessonStatus>,
  ): string | undefined {
    return listLessonIdsInOrder(stages).find(
      (lessonId) => statuses.get(lessonId) === 'open',
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

  /** Ghi một đoạn thời gian học, chia theo ngày; xếp hàng mọi lần ghi đồng bộ (design D2, D4). */
  async recordStudyTime(startMs: number, endMs: number): Promise<void> {
    const writes = this.splitStudyTimeByDay(startMs, endMs).map((share) =>
      this.addStudySeconds(share.date, share.seconds),
    );
    await Promise.all(writes);
  }

  /** Không throw: đọc settings lỗi → mục tiêu mặc định; đọc dòng ngày lỗi → 0 giây (D4). */
  async getTodayStudy(now: number = Date.now()): Promise<TodayStudy> {
    const [settings, dailyStat] = await Promise.all([
      this.readSettings().catch((): Settings => DEFAULT_SETTINGS),
      this.readDailyStat(toLocalDateKey(now)).catch(() => undefined),
    ]);
    const minutes = this.toStudyMinutes(dailyStat?.studySeconds ?? 0);
    const goalMinutes = settings.dailyGoalMinutes;
    return {
      minutes,
      goalMinutes,
      isGoalReached: this.isDailyGoalReached(minutes, goalMinutes),
    };
  }

  // Skeleton S8.3 (tasks 3.1): hành vi thêm ở 3.2.
  getStudyStreak(now?: number): Promise<number>;
  getStudyStreak(): Promise<number> {
    return Promise.reject(new Error('Chưa cài'));
  }
}
