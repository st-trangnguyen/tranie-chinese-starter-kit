/** Helper e2e của streak S8.3 (design mục Test). */
import { expect, type Locator, type Page } from '@playwright/test';

import {
  type DailyStatSeed,
  MINUTE,
  NOW,
  SECOND,
  TIMEZONE,
} from './home.helpers';

const DB_NAME = 'tranie-chinese';
const DAY = 24 * 60 * MINUTE;
/** Một ngày "đạt" trong test-cases: học 20 phút. */
const REACHED_SECONDS = (20 * MINUTE) / SECOND;

/** Dòng "Chuỗi ngày học: N ngày" trên Trang chủ. */
export const streakText = (page: Page): Locator =>
  page.getByText(/^Chuỗi ngày học: \d+ ngày$/);

export const expectStreak = async (page: Page, days: number): Promise<void> => {
  await expect(streakText(page)).toHaveText(`Chuỗi ngày học: ${days} ngày`);
};

const DAY_KEY_FORMAT = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Khóa ngày `YYYY-MM-DD` cách `NOW` `offset` ngày, theo giờ `TIMEZONE` (0 = hôm nay, -1 = hôm qua). */
export const dayKey = (offset: number): string =>
  DAY_KEY_FORMAT.format(new Date(NOW.getTime() + offset * DAY));

/** Ngày học `seconds` giây; `goal` là mục tiêu chụp của ngày đó (bỏ trống = dòng không có mục tiêu). */
export const studiedDay = (
  offset: number,
  seconds: number,
  goal?: number,
): DailyStatSeed => ({
  date: dayKey(offset),
  studySeconds: seconds,
  ...(goal === undefined ? {} : { goalMinutes: goal }),
});

/** Ngày "đạt": học 20 phút, mục tiêu của ngày `goal` phút. */
export const reachedDay = (offset: number, goal = 15): DailyStatSeed =>
  studiedDay(offset, REACHED_SECONDS, goal);

/** Mốc giờ máy `time` (`HH:MM`) của ngày cách `NOW` `offset` ngày, theo `TIMEZONE` (Asia/Ho_Chi_Minh, +07:00). */
export const atDayTime = (offset: number, time: string): Date =>
  new Date(`${dayKey(offset)}T${time}:00+07:00`);

/**
 * Đổi mục tiêu đang chọn khi chưa có màn Cài đặt (S8.2): ghi thẳng `settings.dailyGoalMinutes` bằng API IndexedDB thô,
 * kiểu `seedProgress`. Ghi riêng settings KHÔNG cập nhật mục tiêu của dòng hôm nay như `changeDailyGoal` làm (design D2:
 * cùng transaction, dòng hôm nay có thì đổi `goalMinutes`, không có thì không tạo). Nên helper làm đủ cả hai việc đó cho
 * ngày `today`, để dữ liệu giống hệt khi người học đổi mục tiêu qua use case thật. Cần tải lại/mở lại Trang chủ sau đó.
 */
export const changeDailyGoalInStorage = async (
  page: Page,
  goalMinutes: number,
  today: string,
): Promise<void> => {
  await page.evaluate(
    ({ dbName, goal, date }) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open(dbName);
        request.onerror = () => reject(new Error('Không mở được IndexedDB.'));
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(
            ['settings', 'dailyStats'],
            'readwrite',
          );
          transaction
            .objectStore('settings')
            .put({ key: 'dailyGoalMinutes', value: goal });
          const statStore = transaction.objectStore('dailyStats');
          const readToday = statStore.get(date);
          readToday.onsuccess = () => {
            const row: unknown = readToday.result;
            if (typeof row === 'object' && row !== null) {
              statStore.put({ ...row, goalMinutes: goal });
            }
          };
          transaction.oncomplete = () => {
            db.close();
            resolve();
          };
          transaction.onerror = () => {
            db.close();
            reject(new Error('Không ghi được mục tiêu mới.'));
          };
        };
      }),
    { dbName: DB_NAME, goal: goalMinutes, date: today },
  );
};
