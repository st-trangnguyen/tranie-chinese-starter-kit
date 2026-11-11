import {
  lessonProgressSchema,
  parseSettings,
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
  saveSettings(settings: Settings): Promise<void>;
  /** Mọi tiến độ bài hợp lệ; dòng hỏng bị bỏ qua (S3.1 AC2). */
  getAllLessonProgress(): Promise<LessonProgress[]>;
}

export class DexieProgressStore implements ProgressStore {
  constructor(private readonly db: AppDatabase) {}

  async getSettings(): Promise<Settings> {
    const rows = await this.db.settings.toArray();
    const record = Object.fromEntries(rows.map((row) => [row.key, row.value]));
    return parseSettings(record);
  }

  async saveSettings(settings: Settings): Promise<void> {
    const rows = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
    }));
    await this.db.settings.bulkPut(rows);
  }

  async getAllLessonProgress(): Promise<LessonProgress[]> {
    const rows = await this.db.lessonProgress.toArray();
    return rows.flatMap((row) => {
      const result = lessonProgressSchema.safeParse(row);
      return result.success ? [result.data] : [];
    });
  }
}

export const progressStore: ProgressStore = new DexieProgressStore(
  createDatabase(),
);
