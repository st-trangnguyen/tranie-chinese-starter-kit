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

  it('S8.3-AC1 Học qua nửa đêm thì mỗi ngày so với phần thời gian của ngày đó: hôm qua 10 phút, học 23:50 → 0:10 thì hôm qua đạt, hôm nay 10 phút, streak 1', async () => {
    const service = createService();
    await service.completeOnboarding(15);
    await service.recordStudyTime(at(17, 10, 0), at(17, 10, 10));

    await service.recordStudyTime(at(17, 23, 50), at(18, 0, 10));

    await expect(service.getStudyStreak(at(18, 0, 15))).resolves.toBe(1);
    const today = await service.getTodayStudy(at(18, 0, 15));
    expect(today.minutes).toBe(10);
  });

  it('S8.3-AC1 Số phút của một ngày đã qua bị hỏng: hôm kia, hôm nay 20 phút, số phút hôm qua không đọc được thì streak 1, Trang chủ vẫn 20 phút', async () => {
    const db = createDatabase(`test-${crypto.randomUUID()}`);
    const service = new ProgressService(new DexieProgressStore(db));
    await service.completeOnboarding(15);
    await db.dailyStats.bulkPut([
      {
        date: toLocalDateKey(at(16, 9, 0)),
        studySeconds: 1200,
        goalMinutes: 15,
      },
      {
        date: toLocalDateKey(at(17, 9, 0)),
        studySeconds: 'abc',
        goalMinutes: 15,
      },
      {
        date: toLocalDateKey(at(18, 8, 0)),
        studySeconds: 1200,
        goalMinutes: 15,
      },
    ]);

    await expect(service.getStudyStreak(at(18, 9, 0))).resolves.toBe(1);
    const today = await service.getTodayStudy(at(18, 9, 0));
    expect(today.minutes).toBe(20);
  });

  it('S8.3-AC1 Tăng mục tiêu không đổi các ngày đã qua: đạt 15 phút 3 ngày liền, hôm nay đổi sang 30 phút và học 20 phút thì streak 3', async () => {
    const service = createService();
    await service.completeOnboarding(15);
    for (const day of [15, 16, 17]) {
      await service.recordStudyTime(at(day, 9, 0), at(day, 9, 20));
    }

    await service.changeDailyGoal(30, at(18, 8, 0));
    await service.recordStudyTime(at(18, 9, 0), at(18, 9, 20));

    await expect(service.getStudyStreak(at(18, 10, 0))).resolves.toBe(3);
    const today = await service.getTodayStudy(at(18, 10, 0));
    expect(today.goalMinutes).toBe(30);
  });

  it('S8.3-AC1 Tăng mục tiêu không đổi các ngày đã qua: đổi sang mục tiêu không hợp lệ (45 phút) thì báo lỗi', async () => {
    const service = createService();
    await service.completeOnboarding(15);

    await expect(service.changeDailyGoal(45, at(18, 8, 0))).rejects.toThrow(
      'Mục tiêu mỗi ngày phải là 15, 30 hoặc 60 phút.',
    );
  });
});
