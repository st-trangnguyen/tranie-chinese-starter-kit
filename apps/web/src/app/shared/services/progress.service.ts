import {
  AUDIO_SPEED_OPTIONS,
  DAILY_GOAL_OPTIONS,
  DEFAULT_SETTINGS,
  type LESSON_TYPES,
  type AudioSpeed,
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
import { toLocalDateKey } from '@shared/utils/date.utils';
import type { StudyTimeShare, TodayStudy } from '@shared/models/home.model';
import type {
  LearningPreferences,
  LessonPreferences,
} from '@shared/models/settings.model';

import { StudyTimeService } from './study-time.service';

type LessonType = (typeof LESSON_TYPES)[number];

const INVALID_DAILY_GOAL_MESSAGE =
  'Mục tiêu mỗi ngày phải là 15, 30 hoặc 60 phút.';

export class ProgressService {
  private readonly studyTime: StudyTimeService;

  constructor(private readonly store: ProgressStore = progressStore) {
    this.studyTime = new StudyTimeService(store);
  }

  // ── PHẦN 1 — TRUY CẬP DỮ LIỆU ─────────────────────────

  private readSettings(): Promise<Settings> {
    return this.store.getSettings();
  }

  private writeSettings(patch: Partial<Settings>): Promise<void> {
    return this.store.saveSettings(patch);
  }

  private readAllLessonProgress(): Promise<LessonProgress[]> {
    return this.store.getAllLessonProgress();
  }

  private writeDailyGoal(
    date: string,
    goalMinutes: DailyGoalMinutes,
  ): Promise<void> {
    return this.store.saveDailyGoal(date, goalMinutes);
  }

  // ── PHẦN 2 — QUY TẮC NGHIỆP VỤ ───────────────────────

  /** Rule: mục tiêu mỗi ngày chỉ được là 15, 30 hoặc 60 phút (S1.3 AC1). */
  isValidDailyGoal(minutes: number): minutes is DailyGoalMinutes {
    return DAILY_GOAL_OPTIONS.some((option) => option === minutes);
  }

  /** Rule: tốc độ audio mặc định chỉ là "Bình thường (1x)" hoặc "Chậm (0.75x)" (S8.2 AC2). */
  isValidAudioSpeed(value: string): value is AudioSpeed {
    return AUDIO_SPEED_OPTIONS.some((option) => option === value);
  }

  /**
   * Rule: mỗi lần vào màn học, "Nghe chậm" bật khi tốc độ mặc định là chậm, tắt khi bình thường;
   * pinyin ở câu "nói" hiện theo tùy chọn hiện pinyin (S8.2 AC2, AC3).
   */
  toLessonPreferences(settings: Settings): LessonPreferences {
    return {
      isSlowAudio: settings.defaultAudioSpeed === 'slow',
      isPinyinVisible: settings.isPinyinVisible,
    };
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

  // Rule thời gian học (S8.1) và streak (S8.3) ở StudyTimeService; ủy quyền để giữ API hiện có.

  splitStudyTimeByDay(startMs: number, endMs: number): StudyTimeShare[] {
    return this.studyTime.splitStudyTimeByDay(startMs, endMs);
  }

  toStudyMinutes(seconds: number): number {
    return this.studyTime.toStudyMinutes(seconds);
  }

  isDailyGoalReached(minutes: number, goalMinutes: number): boolean {
    return this.studyTime.isDailyGoalReached(minutes, goalMinutes);
  }

  countStudyStreak(
    stats: readonly DailyStat[],
    today: string,
    todayGoalMinutes: DailyGoalMinutes,
  ): number {
    return this.studyTime.countStudyStreak(stats, today, todayGoalMinutes);
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
      throw new Error(INVALID_DAILY_GOAL_MESSAGE);
    }
    const settings = await this.readSettings();
    await this.writeSettings({
      ...settings,
      dailyGoalMinutes: minutes,
      hasCompletedOnboarding: true,
    });
  }

  /** Không throw: đọc settings lỗi → tùy chọn mặc định (design D3). */
  async getLearningPreferences(): Promise<LearningPreferences> {
    const settings = await this.readSettings().catch(
      (): Settings => DEFAULT_SETTINGS,
    );
    return {
      dailyGoalMinutes: settings.dailyGoalMinutes,
      defaultAudioSpeed: settings.defaultAudioSpeed,
      isPinyinVisible: settings.isPinyinVisible,
    };
  }

  /** Không throw: đọc settings lỗi → tốc độ thường + hiện pinyin (design D3). */
  async getLessonPreferences(): Promise<LessonPreferences> {
    const settings = await this.readSettings().catch(
      (): Settings => DEFAULT_SETTINGS,
    );
    return this.toLessonPreferences(settings);
  }

  /**
   * Màn Cài đặt (S8.2) đổi mục tiêu: chỉ ghi khóa mục tiêu (không đọc–gộp–ghi) và chụp vào dòng
   * hôm nay, ngày đã qua giữ nguyên (S8.3 D4); lỗi ghi đi thẳng lên hook.
   */
  async changeDailyGoal(minutes: number, now = Date.now()): Promise<void> {
    if (!this.isValidDailyGoal(minutes)) {
      throw new Error(INVALID_DAILY_GOAL_MESSAGE);
    }
    await this.writeDailyGoal(toLocalDateKey(now), minutes);
  }

  /** Chỉ ghi khóa tốc độ; lỗi ghi đi thẳng lên hook (design D2, D3). */
  async changeDefaultAudioSpeed(speed: string): Promise<void> {
    if (!this.isValidAudioSpeed(speed)) {
      throw new Error('Tốc độ audio mặc định phải là bình thường hoặc chậm.');
    }
    await this.writeSettings({ defaultAudioSpeed: speed });
  }

  /** Chỉ ghi khóa pinyin; lỗi ghi đi thẳng lên hook (design D2, D3). */
  async changePinyinVisibility(isVisible: boolean): Promise<void> {
    await this.writeSettings({ isPinyinVisible: isVisible });
  }

  async getCompletedLessonIds(): Promise<Set<string>> {
    const progress = await this.readAllLessonProgress();
    return new Set(
      progress
        .filter((lesson) => lesson.status === 'completed')
        .map((lesson) => lesson.lessonId),
    );
  }

  recordStudyTime(startMs: number, endMs: number): Promise<void> {
    return this.studyTime.recordStudyTime(startMs, endMs);
  }

  getTodayStudy(now: number = Date.now()): Promise<TodayStudy> {
    return this.studyTime.getTodayStudy(now);
  }

  getStudyStreak(now: number = Date.now()): Promise<number> {
    return this.studyTime.getStudyStreak(now);
  }
}
