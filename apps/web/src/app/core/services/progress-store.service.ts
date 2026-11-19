import {
  dailyStatSchema,
  lessonProgressSchema,
  parseSettings,
  type DailyGoalMinutes,
  type DailyStat,
  type LessonProgress,
  type Settings,
} from '@csk/shared';

import { createDatabase, type AppDatabase } from '@core/helpers/db.helper';

/**
 * Cổng duy nhất đọc/ghi dữ liệu người dùng (03-architecture §6.3).
 * Các method khác (lessonProgress, cards, dailyStats…) thêm vào khi tới epic cần.
 */
export interface ProgressStore {
  getSettings(): Promise<Settings>;
  /** Chỉ ghi các khóa có trong `patch` với giá trị khác `undefined`; khóa khác giữ nguyên. */
  saveSettings(patch: Partial<Settings>): Promise<void>;
  /** Mọi tiến độ bài hợp lệ; dòng hỏng bị bỏ qua (S3.1 AC2). */
  getAllLessonProgress(): Promise<LessonProgress[]>;
  /** Tiến độ một bài; không có dòng hoặc dòng hỏng thì `undefined` (S3.3). */
  getLessonProgress(lessonId: string): Promise<LessonProgress | undefined>;
  /** Ghi đè dòng cùng `lessonId`, không đụng bài khác. */
  saveLessonProgress(progress: LessonProgress): Promise<void>;
  /** Ghi mọi dòng trong một transaction: một dòng lỗi thì không dòng nào được ghi (S3.6). */
  saveLessonProgressBatch(rows: LessonProgress[]): Promise<void>;
  /** Thống kê học của một ngày (`YYYY-MM-DD`); chưa có thì `undefined` (S8.1). */
  getDailyStat(date: string): Promise<DailyStat | undefined>;
  /**
   * Cộng dồn số giây đã học vào ngày `date` (S8.1) và chụp mục tiêu đang chọn
   * (`settings.dailyGoalMinutes`) vào `goalMinutes` của dòng (S8.3, design D2).
   * Store chỉ chụp giá trị mục tiêu đang chọn vào dòng: không rẽ nhánh theo mục tiêu, không so
   * phút với mục tiêu, không quy tắc nghiệp vụ (quy tắc nằm ở `StudyTimeService` Phần 2).
   */
  addStudySeconds(date: string, seconds: number): Promise<void>;
  /** Mọi thống kê ngày hợp lệ; dòng hỏng bị bỏ qua (S8.3). */
  getAllDailyStats(): Promise<DailyStat[]>;
  /**
   * Đổi mục tiêu của ngày `date` rồi mục tiêu đang chọn (qua `saveSettings`) (S8.3).
   * Ghi dòng ngày lỗi thì settings không đổi. Ghi settings lỗi thì settings giữ giá trị cũ
   * (dòng ngày có thể đã mang mục tiêu mới; lần ghi phút kế tiếp chụp lại mục tiêu đang chọn).
   */
  saveDailyGoal(date: string, goalMinutes: DailyGoalMinutes): Promise<void>;
}

export class DexieProgressStore implements ProgressStore {
  /**
   * Chuỗi các lần ghi thời gian học trong tab này (design D2): `getDailyStat` và
   * `getAllDailyStats` chờ nó để đọc thấy cả lần ghi chưa xong
   * (màn bài unmount ghi phần cuối, Trang chủ mount đọc ngay).
   * Luôn resolve: lỗi một lần ghi không gãy chuỗi.
   */
  private studyTimeWrites: Promise<void> = Promise.resolve();

  constructor(private readonly db: AppDatabase) {}

  async getSettings(): Promise<Settings> {
    const rows = await this.db.settings.toArray();
    const record = Object.fromEntries(rows.map((row) => [row.key, row.value]));
    return parseSettings(record);
  }

  async saveSettings(patch: Partial<Settings>): Promise<void> {
    const rows = Object.entries(patch)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => ({ key, value }));
    if (rows.length === 0) {
      return;
    }
    await this.db.settings.bulkPut(rows);
  }

  async getAllLessonProgress(): Promise<LessonProgress[]> {
    const rows = await this.db.lessonProgress.toArray();
    return rows.flatMap((row) => {
      const result = lessonProgressSchema.safeParse(row);
      return result.success ? [result.data] : [];
    });
  }

  async getLessonProgress(
    lessonId: string,
  ): Promise<LessonProgress | undefined> {
    const row = await this.db.lessonProgress.get(lessonId);
    const result = lessonProgressSchema.safeParse(row);
    return result.success ? result.data : undefined;
  }

  async saveLessonProgress(progress: LessonProgress): Promise<void> {
    await this.db.lessonProgress.put(progress);
  }

  async saveLessonProgressBatch(rows: LessonProgress[]): Promise<void> {
    await this.db.transaction('rw', this.db.lessonProgress, async () => {
      await this.db.lessonProgress.bulkPut(rows);
    });
  }

  async getDailyStat(date: string): Promise<DailyStat | undefined> {
    await this.studyTimeWrites;
    const row = await this.db.dailyStats.get(date);
    const result = dailyStatSchema.safeParse(row);
    return result.success ? result.data : undefined;
  }

  async getAllDailyStats(): Promise<DailyStat[]> {
    await this.studyTimeWrites;
    const rows = await this.db.dailyStats.toArray();
    return rows.flatMap((row) => {
      const result = dailyStatSchema.safeParse(row);
      return result.success ? [result.data] : [];
    });
  }

  saveDailyGoal(date: string, goalMinutes: DailyGoalMinutes): Promise<void> {
    return this.enqueueStudyTimeWrite(() =>
      this.writeDailyGoal(date, goalMinutes),
    );
  }

  addStudySeconds(date: string, seconds: number): Promise<void> {
    return this.enqueueStudyTimeWrite(() =>
      this.writeStudySeconds(date, seconds),
    );
  }

  private enqueueStudyTimeWrite(task: () => Promise<void>): Promise<void> {
    // Nối vào chuỗi đồng bộ (trước mọi `await`) để lần đọc gọi ngay sau đó chờ được lần ghi này.
    const write = this.studyTimeWrites.then(task);
    // Lỗi vẫn reject cho người gọi qua `write`; bản trong chuỗi chỉ bỏ lỗi để lần sau chạy tiếp.
    this.studyTimeWrites = write.catch(() => undefined);
    return write;
  }

  private async writeDailyGoal(
    date: string,
    goalMinutes: DailyGoalMinutes,
  ): Promise<void> {
    // Dòng ngày ghi trước: lỗi thì settings không đổi.
    // Không có dòng hoặc dòng hỏng thì không tạo/không sửa: lần ghi phút sau sẽ chụp mục tiêu mới.
    await this.db.transaction('rw', this.db.dailyStats, async () => {
      const result = dailyStatSchema.safeParse(
        await this.db.dailyStats.get(date),
      );
      if (result.success) {
        await this.db.dailyStats.put({ ...result.data, goalMinutes });
      }
    });
    // Settings ghi sau qua `saveSettings` (một cửa ghi settings, S8.2); lỗi thì settings giữ cũ,
    // dòng ngày có thể đã mang mục tiêu mới và lần ghi phút kế tiếp chụp lại mục tiêu đang chọn.
    await this.saveSettings({ dailyGoalMinutes: goalMinutes });
  }

  private async writeStudySeconds(
    date: string,
    seconds: number,
  ): Promise<void> {
    // Đọc + cộng + ghi trong một transaction `rw`: IndexedDB tuần tự hoá cả giữa hai tab.
    // Mục tiêu đọc cùng transaction nên đổi mục tiêu ở tab khác không xen giữa đọc và ghi.
    await this.db.transaction(
      'rw',
      this.db.dailyStats,
      this.db.settings,
      async () => {
        const row = await this.db.dailyStats.get(date);
        const result = dailyStatSchema.safeParse(row);
        const current = result.success ? result.data.studySeconds : 0;
        const settings = await this.getSettings();
        await this.db.dailyStats.put({
          date,
          studySeconds: current + seconds,
          goalMinutes: settings.dailyGoalMinutes,
        });
      },
    );
  }
}

export const progressStore: ProgressStore = new DexieProgressStore(
  createDatabase(),
);
