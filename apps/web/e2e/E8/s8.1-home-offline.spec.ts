import { expect, test, type Page } from '@playwright/test';

import {
  completeOnboarding,
  expectTodayMinutes,
  homeHeading,
  lessonTitle,
  nextLessonCard,
  startLessonLink,
  TIMEZONE,
} from './home.helpers';

test.use({ timezoneId: TIMEZONE });

/** Lần tải đầu chưa được service worker điều khiển: tải lại để SW nắm trang (mẫu S1.2). */
const openOnceWithServiceWorker = async (page: Page): Promise<void> => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
};

test.describe('S8.1 Trang chủ', () => {
  test('TC-S8.1-AC1-17: S8.1-AC1 Mở Trang chủ khi offline', async ({
    page,
    context,
  }) => {
    await openOnceWithServiceWorker(page);
    await completeOnboarding(page, 15);
    await expect(page).toHaveURL(/\/lessons\/intro-01$/);
    await page.close();

    await context.setOffline(true);
    const reopened = await context.newPage();
    await reopened.goto('/');

    await expect(reopened).toHaveURL(/\/home$/);
    await expect(homeHeading(reopened)).toBeVisible();
    await expect(nextLessonCard(reopened)).toContainText(lessonTitle(0));
    await expect(startLessonLink(reopened)).toBeVisible();
    await expectTodayMinutes(reopened, 0, 15);
  });
});
