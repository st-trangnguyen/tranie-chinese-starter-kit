import { createDatabase } from '@core/helpers/db.helper';
import { DexieProgressStore } from './progress-store.service';

const YESTERDAY = '2026-11-17';

describe('DexieProgressStore — mục tiêu của ngày (S8.3)', () => {
  it('S8.3-AC1 Ngày đã qua không có mục tiêu đọc được: mục tiêu hỏng thành undefined, số giây vẫn đọc được', async () => {
    const db = createDatabase(`test-${crypto.randomUUID()}`);
    await db.dailyStats.put({
      date: YESTERDAY,
      studySeconds: 1200,
      goalMinutes: 'abc',
    });
    const store = new DexieProgressStore(db);

    // `toEqual` coi field `undefined` như không có: không có mục tiêu đọc được.
    await expect(store.getDailyStat(YESTERDAY)).resolves.toEqual({
      date: YESTERDAY,
      studySeconds: 1200,
    });
  });

  it('S8.3-AC1 Ngày đã qua không có mục tiêu đọc được: mục tiêu hợp lệ của ngày đọc ra đúng', async () => {
    const db = createDatabase(`test-${crypto.randomUUID()}`);
    await db.dailyStats.put({
      date: YESTERDAY,
      studySeconds: 1200,
      goalMinutes: 30,
    });
    const store = new DexieProgressStore(db);

    await expect(store.getDailyStat(YESTERDAY)).resolves.toEqual({
      date: YESTERDAY,
      studySeconds: 1200,
      goalMinutes: 30,
    });
  });
});
