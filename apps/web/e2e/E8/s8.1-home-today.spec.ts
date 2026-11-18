import { expect, test } from '@playwright/test';

import {
  completeOnboarding,
  expectHomeScreen,
  GOAL_REACHED_TEXT,
  NOW,
  seedProgress,
  TIMEZONE,
  TODAY,
  todayStudyText,
  YESTERDAY,
} from './home.helpers';

test.use({ timezoneId: TIMEZONE });

test.describe('S8.1 Trang chủ', () => {
  test.describe('S8.1-AC2 số phút hôm nay', () => {
    test.beforeEach(async ({ page }) => {
      await page.clock.install({ time: NOW });
    });

    test('TC-S8.1-AC2-1: S8.1-AC2 Chưa học hôm nay', async ({ page }) => {
      await completeOnboarding(page, 30);
      await expect(page).toHaveURL(/\/lessons\/intro-01$/);

      await page.goto('/');

      await expectHomeScreen(page);
      await expect(todayStudyText(page)).toHaveText('Hôm nay: 0 / 30 phút');
      await expect(page.getByText(GOAL_REACHED_TEXT)).toHaveCount(0);
    });

    test('TC-S8.1-AC2-3: S8.1-AC2 Mục tiêu lưu bị hỏng', async ({ page }) => {
      await seedProgress(page, { settings: { dailyGoalMinutes: 'abc' } });
      await page.goto('/');

      await expectHomeScreen(page);
      await expect(todayStudyText(page)).toHaveText('Hôm nay: 0 / 15 phút');
      await expect(page.getByRole('alert')).toHaveCount(0);
    });

    test('TC-S8.1-AC2-5: S8.1-AC2 Vượt mục tiêu', async ({ page }) => {
      await seedProgress(page, {
        settings: { dailyGoalMinutes: 30 },
        dailyStats: [{ date: TODAY, studySeconds: 45 * 60 }],
      });
      await page.goto('/');

      await expect(todayStudyText(page)).toHaveText('Hôm nay: 45 / 30 phút');
      await expect(page.getByText(GOAL_REACHED_TEXT)).toBeVisible();
    });

    test('TC-S8.1-AC2-6: S8.1-AC2 Vừa đúng mục tiêu — đúng 15 phút', async ({
      page,
    }) => {
      await seedProgress(page, {
        settings: { dailyGoalMinutes: 15 },
        dailyStats: [{ date: TODAY, studySeconds: 15 * 60 }],
      });
      await page.goto('/');

      await expect(todayStudyText(page)).toHaveText('Hôm nay: 15 / 15 phút');
      await expect(page.getByText(GOAL_REACHED_TEXT)).toBeVisible();
    });

    test('TC-S8.1-AC2-7: S8.1-AC2 Vừa đúng mục tiêu — 14 phút 50 giây', async ({
      page,
    }) => {
      await seedProgress(page, {
        settings: { dailyGoalMinutes: 15 },
        dailyStats: [{ date: TODAY, studySeconds: 14 * 60 + 50 }],
      });
      await page.goto('/');

      await expect(todayStudyText(page)).toHaveText('Hôm nay: 14 / 15 phút');
      await expect(page.getByText(GOAL_REACHED_TEXT)).toHaveCount(0);
    });

    test('TC-S8.1-AC2-18: S8.1-AC2 Sang ngày mới đếm lại', async ({ page }) => {
      await seedProgress(page, {
        settings: { dailyGoalMinutes: 15 },
        dailyStats: [{ date: YESTERDAY, studySeconds: 20 * 60 }],
      });
      await page.goto('/');

      await expect(todayStudyText(page)).toHaveText('Hôm nay: 0 / 15 phút');
      await expect(page.getByText(GOAL_REACHED_TEXT)).toHaveCount(0);
    });

    test('TC-S8.1-AC2-25: S8.1-AC2 Thời gian học đã lưu bị hỏng', async ({
      page,
    }) => {
      await seedProgress(page, {
        settings: { dailyGoalMinutes: 15 },
        dailyStats: [{ date: TODAY, studySeconds: 'abc' }],
      });
      await page.goto('/');

      await expectHomeScreen(page);
      await expect(todayStudyText(page)).toHaveText('Hôm nay: 0 / 15 phút');
      await expect(page.getByRole('alert')).toHaveCount(0);
    });
  });
});
