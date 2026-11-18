import { createDatabase } from '@core/helpers/db.helper';
import { DexieProgressStore } from './progress-store.service';

const TODAY = '2026-11-18';
const OTHER_DAY = '2026-11-17';

describe('DexieProgressStore — daily stats', () => {
  it('S8.1-AC2 Số phút còn sau khi mở lại app: số giây đã học còn sau khi mở lại DB', async () => {
    const dbName = `test-${crypto.randomUUID()}`;
    const dbBeforeClose = createDatabase(dbName);
    const storeBeforeClose = new DexieProgressStore(dbBeforeClose);

    await storeBeforeClose.addStudySeconds(TODAY, 540);
    dbBeforeClose.close();

    const storeAfterReopen = new DexieProgressStore(createDatabase(dbName));

    await expect(storeAfterReopen.getDailyStat(TODAY)).resolves.toEqual({
      date: TODAY,
      studySeconds: 540,
    });
    await expect(
      storeAfterReopen.getDailyStat(OTHER_DAY),
    ).resolves.toBeUndefined();
  });

  it('S8.1-AC2 Thời gian học đã lưu bị hỏng: dòng hỏng đọc ra undefined', async () => {
    const db = createDatabase(`test-${crypto.randomUUID()}`);
    await db.dailyStats.put({ date: TODAY, studySeconds: 'abc' });
    const store = new DexieProgressStore(db);

    await expect(store.getDailyStat(TODAY)).resolves.toBeUndefined();
  });

  it('S8.1-AC2 Thời gian học đã lưu bị hỏng: cộng vào dòng hỏng thì coi như 0 và thay dòng', async () => {
    const db = createDatabase(`test-${crypto.randomUUID()}`);
    await db.dailyStats.put({ date: TODAY, studySeconds: 'abc' });
    const store = new DexieProgressStore(db);

    await store.addStudySeconds(TODAY, 130);

    await expect(store.getDailyStat(TODAY)).resolves.toEqual({
      date: TODAY,
      studySeconds: 130,
    });
    await expect(db.dailyStats.get(TODAY)).resolves.toEqual({
      date: TODAY,
      studySeconds: 130,
    });
  });

  it('S8.1-AC2 Hai tab cùng mở màn bài: hai store cùng DB cộng xen kẽ không mất lượt nào', async () => {
    const dbName = `test-${crypto.randomUUID()}`;
    const storeTabA = new DexieProgressStore(createDatabase(dbName));
    const storeTabB = new DexieProgressStore(createDatabase(dbName));

    // Mỗi tab 3 phút = 10 lần ghi 18 giây; hai tab ghi xen kẽ → 6 phút = 360 giây.
    await Promise.all(
      Array.from({ length: 20 }, (_, index) =>
        (index % 2 === 0 ? storeTabA : storeTabB).addStudySeconds(TODAY, 18),
      ),
    );

    await expect(storeTabA.getDailyStat(TODAY)).resolves.toEqual({
      date: TODAY,
      studySeconds: 360,
    });
  });
  it('S8.1-AC2 Học xong quay lại Trang chủ thấy số phút tăng: đọc ngay sau lần ghi chưa xong thấy phần vừa ghi', async () => {
    const store = new DexieProgressStore(
      createDatabase(`test-${crypto.randomUUID()}`),
    );

    // Màn bài unmount ghi phần cuối (không chờ), Trang chủ mount đọc ngay.
    const pendingWrite = store.addStudySeconds(TODAY, 120);

    await expect(store.getDailyStat(TODAY)).resolves.toEqual({
      date: TODAY,
      studySeconds: 120,
    });
    await expect(pendingWrite).resolves.toBeUndefined();
  });

  it('S8.1-AC2 Học xong quay lại Trang chủ thấy số phút tăng: một lần ghi lỗi không chặn lần ghi và lần đọc sau', async () => {
    const db = createDatabase(`test-${crypto.randomUUID()}`);
    const store = new DexieProgressStore(db);
    const writeFailure = new Error('ghi IndexedDB lỗi');
    vi.spyOn(db, 'transaction').mockRejectedValueOnce(writeFailure);

    // Bắt kết quả ngay để lỗi không thành unhandled rejection; vẫn kiểm nó reject cho người gọi.
    const failedWriteOutcome = store.addStudySeconds(TODAY, 60).then(
      () => 'resolved',
      (error: unknown) => error,
    );
    const nextWrite = store.addStudySeconds(TODAY, 120);

    await expect(store.getDailyStat(TODAY)).resolves.toEqual({
      date: TODAY,
      studySeconds: 120,
    });
    await expect(failedWriteOutcome).resolves.toBe(writeFailure);
    await expect(nextWrite).resolves.toBeUndefined();
  });
});
