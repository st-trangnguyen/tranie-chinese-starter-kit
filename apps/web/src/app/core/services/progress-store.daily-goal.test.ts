import { createDatabase } from '@core/helpers/db.helper';
import { DexieProgressStore } from './progress-store.service';

const YESTERDAY = '2026-11-17';
const TODAY = '2026-11-18';

const openStore = () => {
  const db = createDatabase(`test-${crypto.randomUUID()}`);
  return { db, store: new DexieProgressStore(db) };
};

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

  it('S8.3-AC1 Tăng mục tiêu không đổi các ngày đã qua: ghi phút chụp mục tiêu đang chọn vào dòng của ngày', async () => {
    const { db, store } = openStore();
    await store.saveSettings({
      dailyGoalMinutes: 15,
      hasCompletedOnboarding: true,
    });

    await store.addStudySeconds(YESTERDAY, 1200);

    await expect(db.dailyStats.get(YESTERDAY)).resolves.toEqual({
      date: YESTERDAY,
      studySeconds: 1200,
      goalMinutes: 15,
    });
  });

  it('S8.3-AC1 Tăng mục tiêu không đổi các ngày đã qua: đổi mục tiêu sang 30 chỉ ảnh hưởng ngày ghi sau đó', async () => {
    const { db, store } = openStore();
    await store.saveSettings({
      dailyGoalMinutes: 15,
      hasCompletedOnboarding: true,
    });
    await store.addStudySeconds(YESTERDAY, 1200);

    await store.saveSettings({
      dailyGoalMinutes: 30,
      hasCompletedOnboarding: true,
    });
    await store.addStudySeconds(TODAY, 60);

    await expect(db.dailyStats.get(TODAY)).resolves.toEqual({
      date: TODAY,
      studySeconds: 60,
      goalMinutes: 30,
    });
    await expect(db.dailyStats.get(YESTERDAY)).resolves.toEqual({
      date: YESTERDAY,
      studySeconds: 1200,
      goalMinutes: 15,
    });
  });

  it('S8.3-AC1 Tăng mục tiêu không đổi các ngày đã qua: dòng hỏng được ghi lại kèm mục tiêu đang chọn', async () => {
    const { db, store } = openStore();
    await store.saveSettings({
      dailyGoalMinutes: 30,
      hasCompletedOnboarding: true,
    });
    await db.dailyStats.put({ date: TODAY, studySeconds: 'abc' });

    await store.addStudySeconds(TODAY, 130);

    await expect(db.dailyStats.get(TODAY)).resolves.toEqual({
      date: TODAY,
      studySeconds: 130,
      goalMinutes: 30,
    });
  });

  it('S8.3-AC1 Tăng mục tiêu không đổi các ngày đã qua: mục tiêu đang chọn hỏng thì chụp 15', async () => {
    const { db, store } = openStore();
    await db.settings.put({ key: 'dailyGoalMinutes', value: 'abc' });

    await store.addStudySeconds(TODAY, 60);

    await expect(db.dailyStats.get(TODAY)).resolves.toEqual({
      date: TODAY,
      studySeconds: 60,
      goalMinutes: 15,
    });
  });
});
