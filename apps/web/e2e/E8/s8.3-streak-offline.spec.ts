import { expect, test, type Page } from '@playwright/test';

import {
  expectTodayMinutes,
  GOAL_15,
  NOW,
  reopenApp,
  seedProgress,
  TIMEZONE,
} from './home.helpers';
import { expectStreak, reachedDay, studiedDay } from './streak.helpers';

test.use({ timezoneId: TIMEZONE });

/** Lần tải đầu chưa được service worker điều khiển: tải lại để SW nắm trang (mẫu S8.1 offline). */
const waitForServiceWorkerControl = async (page: Page): Promise<void> => {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
};

test.describe('S8.3 Streak', () => {
  test('TC-S8.3-AC2-6: S8.3-AC2 Streak hiện khi không có mạng', async ({
    page,
    context,
  }) => {
    await page.clock.install({ time: NOW });
    await seedProgress(page, {
      ...GOAL_15,
      dailyStats: [
        studiedDay(-3, 0, 15),
        reachedDay(-2),
        reachedDay(-1),
        studiedDay(0, 0, 15),
      ],
    });
    await waitForServiceWorkerControl(page);
    await page.close();

    await context.setOffline(true);
    const reopened = await reopenApp(context);

    await expectTodayMinutes(reopened, 0);
    await expectStreak(reopened, 2);
  });
});
