import { describe, expect, it } from 'vitest';

import { createDatabase } from '@core/helpers/db.helper';
import {
  DexieProgressStore,
  type ProgressStore,
} from '@core/services/progress-store.service';

import { toLocalDateKey } from '@shared/utils/date.utils';

import { ProgressService } from './progress.service';

const unavailable = (): Promise<never> =>
  Promise.reject(
    new DOMException('IndexedDB không mở được', 'InvalidStateError'),
  );

/** Store khi IndexedDB không mở được (chế độ riêng tư): mọi thao tác đều reject. */
const unavailableStore: ProgressStore = {
  getSettings: unavailable,
  saveSettings: unavailable,
  getAllLessonProgress: unavailable,
  getLessonProgress: unavailable,
  saveLessonProgress: unavailable,
  saveLessonProgressBatch: unavailable,
  getDailyStat: unavailable,
  addStudySeconds: unavailable,
  getAllDailyStats: unavailable,
  saveDailyGoal: unavailable,
};

const at = (day: number, hours: number, minutes: number, seconds = 0) =>
  new Date(2026, 10, day, hours, minutes, seconds).getTime();

const createService = () =>
  new ProgressService(
    new DexieProgressStore(createDatabase(`test-${crypto.randomUUID()}`)),
  );

describe('ProgressService — getStudyStreak', () => {
  it('S8.3-AC1 Người học mới chưa có ngày nào: xong onboarding, chưa học phút nào thì streak 0', async () => {
    const service = createService();
    await service.completeOnboarding(15);

    await expect(service.getStudyStreak(at(18, 9, 0))).resolves.toBe(0);
  });

  it('S8.3-AC1 Người học mới chưa có ngày nào: IndexedDB không mở được thì streak 0, không throw', async () => {
    const service = new ProgressService(unavailableStore);

    await expect(service.getStudyStreak(at(18, 9, 0))).resolves.toBe(0);
  });

  it('S8.3-AC1 Mục tiêu đang chọn bị hỏng: mục tiêu không đọc được, hôm nay học 15 phút, chưa đạt ngày nào trước đó thì streak 1', async () => {
    const db = createDatabase(`test-${crypto.randomUUID()}`);
    const service = new ProgressService(new DexieProgressStore(db));
    await db.settings.put({ key: 'dailyGoalMinutes', value: 'abc' });
    await db.settings.put({ key: 'hasCompletedOnboarding', value: true });
    await db.dailyStats.put({
      date: toLocalDateKey(at(18, 8, 0)),
      studySeconds: 900,
    });

    await expect(service.getStudyStreak(at(18, 9, 0))).resolves.toBe(1);
  });
});
