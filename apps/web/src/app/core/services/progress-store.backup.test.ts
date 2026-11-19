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
});
