import {
  DEFAULT_SETTINGS,
  type DailyGoalMinutes,
  type DailyStat,
  type Settings,
} from '@csk/shared';

import {
  progressStore,
  type ProgressStore,
} from '@core/services/progress-store.service';
import {
  previousLocalDateKey,
  startOfNextLocalDay,
  toLocalDateKey,
} from '@shared/utils/date.utils';
import type { StudyTimeShare, TodayStudy } from '@shared/models/home.model';

/**
 * Thời gian học mỗi ngày (S8.1) và streak (S8.3). `ProgressService` ủy quyền sang đây
 * (cùng `ProgressStore`), như `WritingPracticeService` ủy quyền cho `StrokeOrderService`.
 */
export class StudyTimeService {
  constructor(private readonly store: ProgressStore = progressStore) {}

  // ── PHẦN 1 — TRUY CẬP DỮ LIỆU ─────────────────────────

  private readSettings(): Promise<Settings> {
    return this.store.getSettings();
  }

  private readDailyStat(date: string): Promise<DailyStat | undefined> {
    return this.store.getDailyStat(date);
  }

  private readAllDailyStats(): Promise<DailyStat[]> {
    return this.store.getAllDailyStats();
  }

  private addStudySeconds(date: string, seconds: number): Promise<void> {
    return this.store.addStudySeconds(date, seconds);
  }

  // ── PHẦN 2 — QUY TẮC NGHIỆP VỤ ───────────────────────

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
    const minutes = this.toStudyMinutes(stat.studySeconds);
    return this.isDailyGoalReached(minutes, goalMinutes);
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
    const isReached = (date: string): boolean => {
      const stat = statsByDate.get(date);
      return this.isStreakDayReached(stat, date === today, todayGoalMinutes);
    };
    let cursor = isReached(today) ? today : previousLocalDateKey(today);
    let streak = 0;
    while (isReached(cursor)) {
      streak += 1;
      cursor = previousLocalDateKey(cursor);
    }
    return streak;
  }

  // ── PHẦN 3 — USE CASES ───────────────────────────────

  /** Ghi một đoạn thời gian học, chia theo ngày; xếp hàng mọi lần ghi đồng bộ (S8.1 D2, D4). */
  async recordStudyTime(startMs: number, endMs: number): Promise<void> {
    const writes = this.splitStudyTimeByDay(startMs, endMs).map((share) =>
      this.addStudySeconds(share.date, share.seconds),
    );
    await Promise.all(writes);
  }

  /** Không throw: đọc settings lỗi → mục tiêu mặc định; đọc dòng ngày lỗi → 0 giây (S8.1 D4). */
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

  /** Không throw: đọc settings lỗi → mục tiêu mặc định; đọc các ngày lỗi → streak 0 (S8.3 D4). */
  async getStudyStreak(now: number = Date.now()): Promise<number> {
    const [settings, stats] = await Promise.all([
      this.readSettings().catch((): Settings => DEFAULT_SETTINGS),
      this.readAllDailyStats().catch((): DailyStat[] => []),
    ]);
    const today = toLocalDateKey(now);
    return this.countStudyStreak(stats, today, settings.dailyGoalMinutes);
  }
}
