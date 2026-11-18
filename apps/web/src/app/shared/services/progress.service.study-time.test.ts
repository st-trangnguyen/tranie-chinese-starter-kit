import { describe, expect, it } from 'vitest';

import { createDatabase } from '@core/helpers/db.helper';
import {
  DexieProgressStore,
  type ProgressStore,
} from '@core/services/progress-store.service';

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
};

const at = (day: number, hours: number, minutes: number, seconds = 0) =>
  new Date(2026, 10, day, hours, minutes, seconds).getTime();

describe('ProgressService — splitStudyTimeByDay', () => {
  const service = new ProgressService();

  it('S8.1-AC2 Học qua nửa đêm chia cho hai ngày: cắt tại 0 giờ', () => {
    expect(service.splitStudyTimeByDay(at(17, 23, 50), at(18, 0, 10))).toEqual([
      { date: '2026-11-17', seconds: 600 },
      { date: '2026-11-18', seconds: 600 },
    ]);
  });

  it('S8.1-AC2 Học qua nửa đêm chia cho hai ngày: cùng ngày thì một phần', () => {
    expect(service.splitStudyTimeByDay(at(18, 8, 0), at(18, 8, 5, 30))).toEqual(
      [{ date: '2026-11-18', seconds: 330 }],
    );
  });

  it('S8.1-AC2 Học qua nửa đêm chia cho hai ngày: đồng hồ lùi hoặc đoạn rỗng thì không tính', () => {
    expect(service.splitStudyTimeByDay(at(18, 8, 0), at(18, 8, 0))).toEqual([]);
    expect(service.splitStudyTimeByDay(at(18, 8, 5), at(18, 8, 0))).toEqual([]);
  });
});

describe('ProgressService — toStudyMinutes', () => {
  const service = new ProgressService();

  it('S8.1-AC2 Làm tròn xuống phút: 470 giây là 7 phút', () => {
    expect(service.toStudyMinutes(470)).toBe(7);
  });

  it('S8.1-AC2 Làm tròn xuống phút: 479.9 giây vẫn là 7 phút', () => {
    expect(service.toStudyMinutes(479.9)).toBe(7);
  });

  it('S8.1-AC2 Làm tròn xuống phút: đủ 480 giây là 8 phút', () => {
    expect(service.toStudyMinutes(480)).toBe(8);
  });

  it('S8.1-AC2 Làm tròn xuống phút: 0 giây là 0 phút', () => {
    expect(service.toStudyMinutes(0)).toBe(0);
  });
});

describe('ProgressService — isDailyGoalReached', () => {
  const service = new ProgressService();

  it('S8.1-AC2 Vừa đúng mục tiêu: 15 / 15 phút là đạt', () => {
    expect(service.isDailyGoalReached(15, 15)).toBe(true);
  });

  it('S8.1-AC2 Vừa đúng mục tiêu: 14 / 15 phút là chưa đạt', () => {
    expect(service.isDailyGoalReached(14, 15)).toBe(false);
  });

  it('S8.1-AC2 Vừa đúng mục tiêu: vượt mục tiêu 45 / 30 phút vẫn là đạt', () => {
    expect(service.isDailyGoalReached(45, 30)).toBe(true);
  });

  it('S8.1-AC2 Vừa đúng mục tiêu: 0 / 30 phút là chưa đạt', () => {
    expect(service.isDailyGoalReached(0, 30)).toBe(false);
  });
});

describe('ProgressService — thời gian học hôm nay', () => {
  const createService = () =>
    new ProgressService(
      new DexieProgressStore(createDatabase(`test-${crypto.randomUUID()}`)),
    );

  it('S8.1-AC2 Giây lẻ được cộng dồn: hai đoạn 40 giây cùng ngày là 1 phút', async () => {
    const service = createService();

    await service.recordStudyTime(at(18, 8, 0, 0), at(18, 8, 0, 40));
    await service.recordStudyTime(at(18, 9, 0, 0), at(18, 9, 0, 40));

    const today = await service.getTodayStudy(at(18, 9, 5));
    expect(today.minutes).toBe(1);
  });

  it('S8.1-AC2 Nhiều lần học trong cùng ngày được cộng: 5 phút và 6 phút là 11 phút', async () => {
    const service = createService();

    await service.recordStudyTime(at(18, 8, 0), at(18, 8, 5));
    await service.recordStudyTime(at(18, 20, 0), at(18, 20, 6));

    const today = await service.getTodayStudy(at(18, 20, 10));
    expect(today.minutes).toBe(11);
  });

  it('S8.1-AC2 Sang ngày mới đếm lại: hôm qua 20 phút, hôm nay 09:00 là 0 phút', async () => {
    const store = new DexieProgressStore(
      createDatabase(`test-${crypto.randomUUID()}`),
    );
    const service = new ProgressService(store);

    await service.recordStudyTime(at(17, 20, 0), at(17, 20, 20));

    const today = await service.getTodayStudy(at(18, 9, 0));
    expect(today.minutes).toBe(0);
    expect((await store.getDailyStat('2026-11-17'))?.studySeconds).toBe(1200);
  });

  it('S8.1-AC2 Học qua nửa đêm chia cho hai ngày: 23:50 → 00:10 là 10 phút mỗi ngày', async () => {
    const service = createService();

    await service.recordStudyTime(at(17, 23, 50), at(18, 0, 10));

    expect((await service.getTodayStudy(at(17, 23, 59))).minutes).toBe(10);
    expect((await service.getTodayStudy(at(18, 0, 15))).minutes).toBe(10);
  });

  it('S8.1-AC2 Mục tiêu lưu bị hỏng: dailyGoalMinutes "abc" thì mục tiêu là 15', async () => {
    const db = createDatabase(`test-${crypto.randomUUID()}`);
    await db.settings.put({ key: 'dailyGoalMinutes', value: 'abc' });
    const service = new ProgressService(new DexieProgressStore(db));

    const today = await service.getTodayStudy(at(18, 9, 0));
    expect(today.goalMinutes).toBe(15);
  });

  it('S8.1-AC2 Mục tiêu lưu bị hỏng: IndexedDB không mở được thì 0 / 15 phút, không throw', async () => {
    const service = new ProgressService(unavailableStore);

    await expect(service.getTodayStudy(at(18, 9, 0))).resolves.toEqual({
      minutes: 0,
      goalMinutes: 15,
      isGoalReached: false,
    });
  });
});
