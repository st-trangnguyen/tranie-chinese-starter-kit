import { createDatabase } from '@core/helpers/db.helper';
import {
  DexieProgressStore,
  type ProgressStore,
} from './progress-store.service';

const DAY_BEFORE_YESTERDAY = '2026-11-16';
const YESTERDAY = '2026-11-17';
const TODAY = '2026-11-18';

const openStore = () => {
  const db = createDatabase(`test-${crypto.randomUUID()}`);
  return { db, store: new DexieProgressStore(db) };
};

/** Store gọi qua interface `ProgressStore` (chữ ký `saveDailyGoal(date, goalMinutes)`). */
const openGoalStore = () => {
  const db = createDatabase(`test-${crypto.randomUUID()}`);
  const store: ProgressStore = new DexieProgressStore(db);
  return { db, store };
};

const SCENARIO_CHANGE_GOAL =
  'S8.3-AC1 Đổi mục tiêu sau khi đã học, qua 0:00 streak không đổi';

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

  it(`${SCENARIO_CHANGE_GOAL}: đổi mục tiêu đổi cả settings và mục tiêu của hôm nay, ngày đã qua giữ nguyên`, async () => {
    const { db, store } = openGoalStore();
    await store.saveSettings({
      dailyGoalMinutes: 15,
      hasCompletedOnboarding: true,
    });
    await db.dailyStats.put({
      date: YESTERDAY,
      studySeconds: 1200,
      goalMinutes: 15,
    });
    await db.dailyStats.put({
      date: TODAY,
      studySeconds: 1200,
      goalMinutes: 15,
    });

    await store.saveDailyGoal(TODAY, 30);

    await expect(store.getSettings()).resolves.toMatchObject({
      dailyGoalMinutes: 30,
    });
    await expect(db.dailyStats.get(TODAY)).resolves.toEqual({
      date: TODAY,
      studySeconds: 1200,
      goalMinutes: 30,
    });
    await expect(db.dailyStats.get(YESTERDAY)).resolves.toEqual({
      date: YESTERDAY,
      studySeconds: 1200,
      goalMinutes: 15,
    });
  });

  it(`${SCENARIO_CHANGE_GOAL}: ngày chưa có dòng thì chỉ đổi settings, không tạo dòng`, async () => {
    const { db, store } = openGoalStore();
    await store.saveSettings({
      dailyGoalMinutes: 15,
      hasCompletedOnboarding: true,
    });

    await store.saveDailyGoal(TODAY, 30);

    await expect(store.getSettings()).resolves.toMatchObject({
      dailyGoalMinutes: 30,
    });
    await expect(db.dailyStats.get(TODAY)).resolves.toBeUndefined();
  });

  it(`${SCENARIO_CHANGE_GOAL}: dòng hôm nay hỏng thì giữ nguyên dòng, settings vẫn đổi`, async () => {
    const { db, store } = openGoalStore();
    await store.saveSettings({
      dailyGoalMinutes: 15,
      hasCompletedOnboarding: true,
    });
    await db.dailyStats.put({
      date: TODAY,
      studySeconds: 'abc',
      goalMinutes: 15,
    });

    await store.saveDailyGoal(TODAY, 30);

    await expect(store.getSettings()).resolves.toMatchObject({
      dailyGoalMinutes: 30,
    });
    await expect(db.dailyStats.get(TODAY)).resolves.toEqual({
      date: TODAY,
      studySeconds: 'abc',
      goalMinutes: 15,
    });
  });

  it(`${SCENARIO_CHANGE_GOAL}: đổi mục tiêu ngay sau lần ghi phút chưa xong thì dòng cuối có cả phút và mục tiêu mới`, async () => {
    const { db, store } = openGoalStore();
    await store.saveSettings({
      dailyGoalMinutes: 15,
      hasCompletedOnboarding: true,
    });
    await db.dailyStats.put({
      date: TODAY,
      studySeconds: 1200,
      goalMinutes: 15,
    });

    const pendingWrite = store.addStudySeconds(TODAY, 60);
    await store.saveDailyGoal(TODAY, 60);
    await pendingWrite;

    await expect(db.dailyStats.get(TODAY)).resolves.toEqual({
      date: TODAY,
      studySeconds: 1260,
      goalMinutes: 60,
    });
  });

  it('S8.3-AC1 Số phút của một ngày đã qua bị hỏng: đọc mọi ngày bỏ dòng hỏng, giữ các dòng hợp lệ', async () => {
    const { db, store } = openStore();
    await db.dailyStats.put({
      date: DAY_BEFORE_YESTERDAY,
      studySeconds: 1200,
      goalMinutes: 15,
    });
    await db.dailyStats.put({
      date: YESTERDAY,
      studySeconds: 'abc',
      goalMinutes: 15,
    });
    await db.dailyStats.put({
      date: TODAY,
      studySeconds: 1200,
      goalMinutes: 15,
    });
    await db.dailyStats.put({
      date: 'xyz',
      studySeconds: 1200,
      goalMinutes: 15,
    });

    const stats = await store.getAllDailyStats();

    expect(stats).toHaveLength(2);
    expect(stats).toEqual(
      expect.arrayContaining([
        { date: DAY_BEFORE_YESTERDAY, studySeconds: 1200, goalMinutes: 15 },
        { date: TODAY, studySeconds: 1200, goalMinutes: 15 },
      ]),
    );
  });

  it('S8.3-AC2 Học đủ mục tiêu rồi quay lại trang chủ thì số tăng ngay: đọc mọi ngày ngay sau lần ghi chưa xong thấy phần vừa ghi', async () => {
    const { store } = openStore();

    // Màn bài unmount ghi phần cuối (không chờ), Trang chủ mount đọc mọi ngày ngay.
    const pendingWrite = store.addStudySeconds(TODAY, 120);

    const stats = await store.getAllDailyStats();

    expect(stats).toEqual([
      expect.objectContaining({ date: TODAY, studySeconds: 120 }),
    ]);
    await expect(pendingWrite).resolves.toBeUndefined();
  });
});
