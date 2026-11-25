import {
  dailyStatSchema,
  lessonProgressSchema,
  parseSettings,
  reviewCardId,
  reviewCardSchema,
  writtenCharacterSchema,
  type DailyGoalMinutes,
  type DailyStat,
  type LessonProgress,
  type ProgressSnapshot,
  type ReviewCard,
  type Settings,
} from '@csk/shared';

import { createDatabase, type AppDatabase } from '@core/helpers/db.helper';
import type { ProgressStore } from './progress-store.interface';

export type { ProgressStore } from './progress-store.interface';

/** Schema tối thiểu cho `parseRows`: chỉ cần `safeParse` (Zod schema thỏa). */
interface RowSchema<T> {
  safeParse(row: unknown): { success: true; data: T } | { success: false };
}

/** Validate từng dòng thô của bảng; dòng hỏng bị bỏ. */
const parseRows = <T>(rows: readonly unknown[], schema: RowSchema<T>): T[] =>
  rows.flatMap((row) => {
    const result = schema.safeParse(row);
    return result.success ? [result.data] : [];
  });

export class DexieProgressStore implements ProgressStore {
  /**
   * Chuỗi các lần ghi cần đọc thấy ngay trong tab này (thời gian học, mục tiêu, import,
   * thẻ ôn tập, chữ đã viết): các method đọc chờ nó để thấy cả lần ghi chưa xong
   * (vd. màn bài unmount ghi phần cuối, Trang chủ mount đọc ngay).
   * Luôn resolve: lỗi một lần ghi không gãy chuỗi.
   */
  private pendingWrites: Promise<void> = Promise.resolve();

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
    return parseRows(rows, lessonProgressSchema);
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
    await this.pendingWrites;
    const row = await this.db.dailyStats.get(date);
    const result = dailyStatSchema.safeParse(row);
    return result.success ? result.data : undefined;
  }

  async getAllDailyStats(): Promise<DailyStat[]> {
    await this.pendingWrites;
    const rows = await this.db.dailyStats.toArray();
    return parseRows(rows, dailyStatSchema);
  }

  saveDailyGoal(date: string, goalMinutes: DailyGoalMinutes): Promise<void> {
    return this.enqueueWrite(() => this.writeDailyGoal(date, goalMinutes));
  }

  async exportAll(): Promise<ProgressSnapshot> {
    await this.pendingWrites;
    // Đọc ba bảng trong một transaction `r`: ảnh chụp nhất quán, không ghi gì.
    return this.db.transaction(
      'r',
      this.db.settings,
      this.db.lessonProgress,
      this.db.dailyStats,
      async () => {
        const settings = await this.getSettings();
        const lessonRows = await this.db.lessonProgress.toArray();
        const dailyRows = await this.db.dailyStats.toArray();
        return {
          settings,
          lessonProgress: parseRows(lessonRows, lessonProgressSchema),
          dailyStats: parseRows(dailyRows, dailyStatSchema),
        };
      },
    );
  }

  importAll(snapshot: ProgressSnapshot): Promise<void> {
    return this.enqueueWrite(() => this.writeSnapshot(snapshot));
  }

  addStudySeconds(date: string, seconds: number): Promise<void> {
    return this.enqueueWrite(() => this.writeStudySeconds(date, seconds));
  }

  async getAllCards(): Promise<ReviewCard[]> {
    await this.pendingWrites;
    const rows = await this.db.cards.toArray();
    return parseRows(rows, reviewCardSchema);
  }

  addNewCards(cards: readonly ReviewCard[]): Promise<void> {
    return this.enqueueWrite(() => this.writeNewCards(cards));
  }

  async getWrittenCharacters(): Promise<string[]> {
    await this.pendingWrites;
    const rows = await this.db.writtenCharacters.toArray();
    return parseRows(rows, writtenCharacterSchema).map((row) => row.character);
  }

  addWrittenCharacter(character: string): Promise<void> {
    // `put` theo khóa chữ: viết lại cùng chữ không tạo dòng mới.
    return this.enqueueWrite(async () => {
      await this.db.writtenCharacters.put({ character });
    });
  }

  private enqueueWrite(task: () => Promise<void>): Promise<void> {
    // Nối vào chuỗi đồng bộ (trước mọi `await`) để lần đọc gọi ngay sau đó chờ được lần ghi này.
    const write = this.pendingWrites.then(task);
    // Lỗi vẫn reject cho người gọi qua `write`; bản trong chuỗi chỉ bỏ lỗi để lần sau chạy tiếp.
    this.pendingWrites = write.catch(() => undefined);
    return write;
  }

  private async writeNewCards(cards: readonly ReviewCard[]): Promise<void> {
    if (cards.length === 0) {
      return;
    }
    const rows = cards.map((card) => ({
      ...card,
      id: reviewCardId(card.wordId, card.facet),
    }));
    // Đọc khóa đã có và thêm trong cùng transaction `rw`: thẻ đã có (kể cả do tab khác vừa tạo)
    // giữ nguyên trạng thái và lịch ôn, chỉ thẻ chưa có được thêm.
    await this.db.transaction('rw', this.db.cards, async () => {
      const existing = await this.db.cards.bulkGet(rows.map((row) => row.id));
      const newRows = rows.filter((_, index) => existing[index] === undefined);
      if (newRows.length > 0) {
        await this.db.cards.bulkAdd(newRows);
      }
    });
  }

  private async writeSnapshot(snapshot: ProgressSnapshot): Promise<void> {
    // Xóa + ghi cả ba bảng trong một transaction: bước nào lỗi thì Dexie abort,
    // dữ liệu cũ còn nguyên.
    await this.db.transaction(
      'rw',
      this.db.settings,
      this.db.lessonProgress,
      this.db.dailyStats,
      async () => {
        await this.db.settings.clear();
        await this.db.lessonProgress.clear();
        await this.db.dailyStats.clear();
        const settingsRows = Object.entries(snapshot.settings).map(
          ([key, value]) => ({ key, value }),
        );
        await this.db.settings.bulkPut(settingsRows);
        await this.db.lessonProgress.bulkPut(snapshot.lessonProgress);
        // Giữ nguyên `goalMinutes` của từng ngày như trong snapshot.
        await this.db.dailyStats.bulkPut(snapshot.dailyStats);
      },
    );
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
