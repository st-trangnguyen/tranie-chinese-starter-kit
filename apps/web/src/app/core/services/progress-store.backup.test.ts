import type { LessonProgress, ProgressSnapshot } from '@csk/shared';

import { createDatabase } from '@core/helpers/db.helper';
import {
  DexieProgressStore,
  type ProgressStore,
} from './progress-store.service';

const TODAY = '2026-11-18';

const openStore = () => {
  const db = createDatabase(`test-${crypto.randomUUID()}`);
  const store: ProgressStore = new DexieProgressStore(db);
  return { db, store };
};

const completed = (lessonId: string): LessonProgress => ({
  lessonId,
  status: 'completed',
});

const SCENARIO_OVERWRITE_STUDY_TIME =
  'S8.5-AC3 Ghi đè xóa số phút học mà file không có';
const SCENARIO_WRITE_FAILS =
  'S8.5-AC3 Ghi lỗi giữa chừng thì giữ nguyên tiến độ cũ';
const SCENARIO_EXPORT_KEEPS_PROGRESS = 'S8.5-AC1 Xuất không làm đổi tiến độ';
const YESTERDAY = '2026-11-17';

describe('DexieProgressStore — sao lưu tiến độ (S8.5)', () => {
  it(`${SCENARIO_OVERWRITE_STUDY_TIME}: ghi đè thay toàn bộ ba bảng, ngày không có trong file bị xóa`, async () => {
    const { db, store } = openStore();
    await store.saveSettings({
      dailyGoalMinutes: 60,
      hasCompletedOnboarding: true,
      defaultAudioSpeed: 'normal',
      isPinyinVisible: true,
    });
    await store.saveLessonProgressBatch(
      [
        'intro-01',
        'intro-02',
        'intro-03',
        'intro-04',
        'intro-05',
        'intro-06',
      ].map(completed),
    );
    await db.dailyStats.put({
      date: TODAY,
      studySeconds: 1200,
      goalMinutes: 60,
    });

    const snapshot: ProgressSnapshot = {
      settings: {
        dailyGoalMinutes: 15,
        hasCompletedOnboarding: true,
        defaultAudioSpeed: 'slow',
        isPinyinVisible: false,
      },
      lessonProgress: ['intro-01', 'intro-02', 'intro-03'].map(completed),
      dailyStats: [],
      cards: [],
      writtenCharacters: [],
    };

    await store.importAll(snapshot);

    await expect(store.getDailyStat(TODAY)).resolves.toBeUndefined();
    await expect(store.getAllDailyStats()).resolves.toEqual([]);
    const lessonProgress = await store.getAllLessonProgress();
    expect(lessonProgress).toHaveLength(3);
    expect(lessonProgress).toEqual(
      expect.arrayContaining(
        ['intro-01', 'intro-02', 'intro-03'].map(completed),
      ),
    );
    await expect(store.getSettings()).resolves.toEqual(snapshot.settings);
  });
  it(`${SCENARIO_WRITE_FAILS}: một bước ghi lỗi thì cả ba bảng giữ nguyên dữ liệu cũ`, async () => {
    const { db, store } = openStore();
    const oldSettings = {
      dailyGoalMinutes: 30,
      hasCompletedOnboarding: true,
      defaultAudioSpeed: 'normal',
      isPinyinVisible: true,
    } as const;
    await store.saveSettings(oldSettings);
    await store.saveLessonProgressBatch([completed('intro-01')]);
    const oldDailyStat = { date: TODAY, studySeconds: 600, goalMinutes: 30 };
    await db.dailyStats.put(oldDailyStat);

    vi.spyOn(db.lessonProgress, 'bulkPut').mockRejectedValueOnce(
      new Error('ghi lỗi'),
    );

    const snapshot: ProgressSnapshot = {
      settings: {
        dailyGoalMinutes: 15,
        hasCompletedOnboarding: true,
        defaultAudioSpeed: 'slow',
        isPinyinVisible: false,
      },
      lessonProgress: [
        'intro-01',
        'intro-02',
        'intro-03',
        'intro-04',
        'intro-05',
      ].map(completed),
      dailyStats: [],
      cards: [],
      writtenCharacters: [],
    };

    await expect(store.importAll(snapshot)).rejects.toThrow();

    await expect(store.getSettings()).resolves.toEqual(oldSettings);
    await expect(store.getAllLessonProgress()).resolves.toEqual([
      completed('intro-01'),
    ]);
    await expect(store.getAllDailyStats()).resolves.toEqual([oldDailyStat]);
  });

  it(`${SCENARIO_EXPORT_KEEPS_PROGRESS}: trả đúng tiến độ hợp lệ và không đổi dữ liệu trong DB`, async () => {
    const { db, store } = openStore();
    const settings = {
      dailyGoalMinutes: 15,
      hasCompletedOnboarding: true,
      defaultAudioSpeed: 'slow',
      isPinyinVisible: false,
    } as const;
    await store.saveSettings(settings);
    const lesson1: LessonProgress = completed('intro-01');
    const lesson2: LessonProgress = {
      lessonId: 'intro-02',
      status: 'in-progress',
      cursor: 2,
    };
    await store.saveLessonProgressBatch([lesson1, lesson2]);
    await db.lessonProgress.put({ lessonId: 'intro-03', status: 'done' });
    const todayStat = { date: TODAY, studySeconds: 600, goalMinutes: 15 };
    const yesterdayStat = { date: YESTERDAY, studySeconds: 300 };
    await db.dailyStats.bulkPut([todayStat, yesterdayStat]);

    const readRaw = async () => ({
      settings: await db.settings.toArray(),
      lessonProgress: await db.lessonProgress.toArray(),
      dailyStats: await db.dailyStats.toArray(),
    });
    const rawBefore = await readRaw();

    const snapshot = await store.exportAll();

    expect(snapshot.settings).toEqual(settings);
    expect(snapshot.lessonProgress).toHaveLength(2);
    expect(snapshot.lessonProgress).toEqual(
      expect.arrayContaining([lesson1, lesson2]),
    );
    expect(snapshot.dailyStats).toHaveLength(2);
    expect(snapshot.dailyStats).toEqual(
      expect.arrayContaining([todayStat, yesterdayStat]),
    );
    const exportedYesterday = snapshot.dailyStats.find(
      (stat) => stat.date === YESTERDAY,
    );
    expect(exportedYesterday).toBeDefined();
    expect(exportedYesterday?.goalMinutes).toBeUndefined();

    const rawAfter = await readRaw();
    expect(rawAfter).toEqual(rawBefore);
    expect(rawAfter.lessonProgress).toHaveLength(3);
  });
});
