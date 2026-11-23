import { expect, test } from '@playwright/test';

import {
  expectHomeScreen,
  expectTodayMinutes,
  GOAL_15,
  learningPathLink,
  NOW,
  seedProgress,
  TIMEZONE,
} from './home.helpers';
import {
  dayKey,
  expectStreak,
  reachedDay,
  streakText,
  studiedDay,
} from './streak.helpers';

test.use({ timezoneId: TIMEZONE });

const MINUTES = 60;

test.describe('S8.3 Streak', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: NOW });
  });

  test.describe('S8.3-AC1 đếm streak', () => {
    test('TC-S8.3-AC1-1: S8.3-AC1 Đạt mục tiêu hôm nay thì streak tăng 1', async ({
      page,
    }) => {
      const pastDays = [reachedDay(-2), reachedDay(-1)];
      await seedProgress(page, {
        ...GOAL_15,
        dailyStats: [...pastDays, studiedDay(0, 14 * MINUTES, 15)],
      });
      await page.goto('/');

      await expectHomeScreen(page);
      await expectTodayMinutes(page, 14);
      await expectStreak(page, 2);

      await seedProgress(page, {
        ...GOAL_15,
        dailyStats: [studiedDay(0, 15 * MINUTES, 15)],
      });
      await page.goto('/');

      await expectHomeScreen(page);
      await expectTodayMinutes(page, 15);
      await expectStreak(page, 3);
    });

    test('TC-S8.3-AC1-2: S8.3-AC1 Hôm nay chưa đạt thì vẫn giữ chuỗi đến hôm qua', async ({
      page,
    }) => {
      await seedProgress(page, {
        settings: { dailyGoalMinutes: 30 },
        dailyStats: [
          ...[-4, -3, -2, -1].map((offset) =>
            studiedDay(offset, 35 * MINUTES, 30),
          ),
          studiedDay(0, 10 * MINUTES, 30),
        ],
      });
      await page.goto('/');

      await expectTodayMinutes(page, 10, 30);
      await expectStreak(page, 4);
    });

    test('TC-S8.3-AC1-3: S8.3-AC1 Bỏ một ngày thì chuỗi đứt', async ({
      page,
    }) => {
      await seedProgress(page, {
        ...GOAL_15,
        dailyStats: [
          ...[-6, -5, -4, -3, -2].map((offset) => reachedDay(offset)),
          studiedDay(-1, 5 * MINUTES, 15),
          studiedDay(0, 0, 15),
        ],
      });
      await page.goto('/');

      await expectStreak(page, 0);
    });

    test('TC-S8.3-AC1-5: S8.3-AC1 Đếm lại sau khi chuỗi đứt', async ({
      page,
    }) => {
      await seedProgress(page, {
        ...GOAL_15,
        dailyStats: [
          ...[-7, -6, -5, -4, -3].map((offset) => reachedDay(offset)),
          studiedDay(-2, 5 * MINUTES, 15),
          reachedDay(-1),
          reachedDay(0),
        ],
      });
      await page.goto('/');

      await expectStreak(page, 2);
    });

    test('TC-S8.3-AC1-7: S8.3-AC1 Chưa đủ trọn phút mục tiêu thì chưa tính là đạt', async ({
      page,
    }) => {
      await seedProgress(page, {
        ...GOAL_15,
        dailyStats: [studiedDay(0, 14 * MINUTES + 59, 15)],
      });
      await page.goto('/');

      await expectTodayMinutes(page, 14);
      await expectStreak(page, 0);
    });

    test('TC-S8.3-AC1-10: S8.3-AC1 Số phút của một ngày đã qua bị hỏng', async ({
      page,
    }) => {
      await seedProgress(page, {
        ...GOAL_15,
        dailyStats: [
          reachedDay(-2),
          { date: dayKey(-1), studySeconds: 'abc', goalMinutes: 15 },
          reachedDay(0),
        ],
      });
      await page.goto('/');

      await expectHomeScreen(page);
      await expectTodayMinutes(page, 20);
      await expectStreak(page, 1);
      await expect(learningPathLink(page)).toBeVisible();
      await expect(page.getByRole('alert')).toHaveCount(0);
    });

    test('TC-S8.3-AC1-11: S8.3-AC1 Ngày ghi sau hôm nay không được tính', async ({
      page,
    }) => {
      await seedProgress(page, {
        ...GOAL_15,
        dailyStats: [reachedDay(-1), reachedDay(0), reachedDay(1)],
      });
      await page.goto('/');

      await expectTodayMinutes(page, 20);
      await expectStreak(page, 2);
    });

    test('TC-S8.3-AC1-12: S8.3-AC1 Tăng mục tiêu không đổi các ngày đã qua', async ({
      page,
    }) => {
      await seedProgress(page, {
        settings: { dailyGoalMinutes: 30 },
        dailyStats: [
          reachedDay(-3, 15),
          reachedDay(-2, 15),
          reachedDay(-1, 15),
          studiedDay(0, 20 * MINUTES, 30),
        ],
      });
      await page.goto('/');

      await expectTodayMinutes(page, 20, 30);
      await expectStreak(page, 3);
    });

    test('TC-S8.3-AC1-13: S8.3-AC1 Hạ mục tiêu không biến ngày chưa đạt thành đạt', async ({
      page,
    }) => {
      await seedProgress(page, {
        ...GOAL_15,
        dailyStats: [
          reachedDay(-2, 30),
          reachedDay(-1, 30),
          studiedDay(0, 0, 15),
        ],
      });
      await page.goto('/');

      await expectTodayMinutes(page, 0);
      await expectStreak(page, 0);
    });

    test('TC-S8.3-AC1-15: S8.3-AC1 Mục tiêu đang chọn bị hỏng', async ({
      page,
    }) => {
      await seedProgress(page, {
        settings: { dailyGoalMinutes: 'abc' },
        dailyStats: [studiedDay(0, 15 * MINUTES)],
      });
      await page.goto('/');

      await expectHomeScreen(page);
      await expectTodayMinutes(page, 15);
      await expectStreak(page, 1);
      await expect(page.getByRole('alert')).toHaveCount(0);
    });

    test.describe('TC-S8.3-AC1-16: S8.3-AC1 Ngày đã qua không có mục tiêu đọc được', () => {
      test('TC-S8.3-AC1-16 (a): S8.3-AC1 mục tiêu của hôm qua không đọc được', async ({
        page,
      }) => {
        await seedProgress(page, {
          ...GOAL_15,
          dailyStats: [
            {
              date: dayKey(-1),
              studySeconds: 20 * MINUTES,
              goalMinutes: 'abc',
            },
            reachedDay(0),
          ],
        });
        await page.goto('/');

        await expectHomeScreen(page);
        await expectStreak(page, 2);
      });

      test('TC-S8.3-AC1-16 (b): S8.3-AC1 hôm qua không có mục tiêu', async ({
        page,
      }) => {
        await seedProgress(page, {
          ...GOAL_15,
          dailyStats: [studiedDay(-1, 20 * MINUTES), reachedDay(0)],
        });
        await page.goto('/');

        await expectHomeScreen(page);
        await expectStreak(page, 2);
      });
    });
  });

  test.describe('S8.3-AC2 streak trên Trang chủ', () => {
    test('TC-S8.3-AC2-1: S8.3-AC2 Trang chủ hiện streak', async ({ page }) => {
      await seedProgress(page, {
        ...GOAL_15,
        dailyStats: [reachedDay(-2), reachedDay(-1), reachedDay(0)],
      });
      await page.goto('/');

      await expectHomeScreen(page);
      await expect(streakText(page)).toBeVisible();
      await expectStreak(page, 3);
    });

    test('TC-S8.3-AC2-5: S8.3-AC2 Streak bằng 0 vẫn hiện', async ({ page }) => {
      await seedProgress(page, {
        ...GOAL_15,
        dailyStats: [
          studiedDay(-1, 5 * MINUTES, 15),
          studiedDay(0, 3 * MINUTES, 15),
        ],
      });
      await page.goto('/');

      await expectHomeScreen(page);
      await expect(streakText(page)).toBeVisible();
      await expectStreak(page, 0);
    });
  });
});
