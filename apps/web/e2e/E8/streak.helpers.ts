/** Helper e2e của streak S8.3 (design mục Test). */
import { expect, type Locator, type Page } from '@playwright/test';

import {
  type DailyStatSeed,
  MINUTE,
  NOW,
  SECOND,
  TIMEZONE,
} from './home.helpers';

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
