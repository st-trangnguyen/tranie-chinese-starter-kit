import { expect, test } from '@playwright/test';

import {
  expectHomeScreen,
  expectTodayMinutes,
  GOAL_15,
  GOAL_REACHED_TEXT,
  HOUR,
  learningPathLink,
  MINUTE,
  NOW,
  openHomeThenStartLesson,
  runClockUntil,
  SECOND,
  seedProgress,
  setPageVisibility,
  startLesson,
  stayInLessonThenLeave,
  TIMEZONE,
  TODAY,
  YESTERDAY,
} from './home.helpers';

const TWENTY_MINUTES_IN_SECONDS = 20 * 60;

test.use({ timezoneId: TIMEZONE });

test.describe('S8.1-AC2 thời gian học hôm nay', () => {
  test.describe('chỉ tính lúc màn bài hiện', () => {
    test.beforeEach(async ({ page }) => {
      await page.clock.install({ time: NOW });
    });

    test('TC-S8.1-AC2-12: S8.1-AC2 Thời gian app chạy nền không tính', async ({
      page,
    }) => {
      await openHomeThenStartLesson(page);
      await page.clock.runFor(1 * MINUTE + 10 * SECOND);
      await setPageVisibility(page, true);
      await page.clock.runFor(10 * MINUTE);
      await setPageVisibility(page, false);
      await stayInLessonThenLeave(page, 1 * MINUTE);

      await expectTodayMinutes(page, 2);
    });

    test('TC-S8.1-AC2-14: S8.1-AC2 Màn khác không tính', async ({ page }) => {
      await seedProgress(page, GOAL_15);
      await page.goto('/');
      await page.clock.runFor(2 * MINUTE + 30 * SECOND);
      await learningPathLink(page).click();
      await page.clock.runFor(2 * MINUTE + 30 * SECOND);
      await page.getByRole('link', { name: 'Trang chủ' }).click();

      await expectHomeScreen(page);
      await expectTodayMinutes(page, 0);
    });
  });

  test.describe('làm tròn và cộng dồn', () => {
    test.beforeEach(async ({ page }) => {
      await page.clock.install({ time: NOW });
    });

    test('TC-S8.1-AC2-16: S8.1-AC2 Làm tròn xuống phút', async ({ page }) => {
      await openHomeThenStartLesson(page);
      await stayInLessonThenLeave(page, 7 * MINUTE + 50 * SECOND);

      await expectTodayMinutes(page, 7);
    });

    test('TC-S8.1-AC2-17: S8.1-AC2 Giây lẻ được cộng dồn', async ({ page }) => {
      await openHomeThenStartLesson(page);
      await stayInLessonThenLeave(page, 40 * SECOND);
      await expectTodayMinutes(page, 0);

      await startLesson(page);
      await stayInLessonThenLeave(page, 40 * SECOND);

      await expectTodayMinutes(page, 1);
    });

    test('TC-S8.1-AC2-20: S8.1-AC2 Nhiều lần học trong cùng ngày được cộng', async ({
      page,
      context,
    }) => {
      await openHomeThenStartLesson(page);
      await stayInLessonThenLeave(page, 5 * MINUTE + 10 * SECOND);
      await page.close();

      const reopened = await context.newPage();
      await reopened.goto('/');
      await expectHomeScreen(reopened);
      await reopened.clock.runFor(3 * HOUR);
      await startLesson(reopened);
      await stayInLessonThenLeave(reopened, 6 * MINUTE + 10 * SECOND);

      await expectTodayMinutes(reopened, 11);
    });
  });

  test.describe('qua nửa đêm (giờ máy Asia/Ho_Chi_Minh)', () => {
    test('TC-S8.1-AC2-19: S8.1-AC2 Học qua nửa đêm chia cho hai ngày', async ({
      page,
    }) => {
      await page.clock.install({ time: new Date(`${TODAY}T23:55:00+07:00`) });
      await seedProgress(page, GOAL_15);
      await page.goto('/');
      await expectHomeScreen(page);
      await runClockUntil(page, new Date(`${TODAY}T23:57:50+07:00`));

      await startLesson(page);
      await stayInLessonThenLeave(page, 4 * MINUTE + 20 * SECOND);

      await expectTodayMinutes(page, 2);
    });

    test('TC-S8.1-AC2-31: S8.1-AC2 Để Trang chủ mở qua nửa đêm', async ({
      page,
    }) => {
      await page.clock.install({
        time: new Date(`${YESTERDAY}T23:58:00+07:00`),
      });
      await seedProgress(page, {
        ...GOAL_15,
        dailyStats: [
          { date: YESTERDAY, studySeconds: TWENTY_MINUTES_IN_SECONDS },
        ],
      });
      await runClockUntil(page, new Date(`${YESTERDAY}T23:59:00+07:00`));
      await page.goto('/');
      await expectTodayMinutes(page, 20);

      await runClockUntil(page, new Date(`${TODAY}T00:01:00+07:00`));

      await expectTodayMinutes(page, 20);
      await expect(page.getByText(GOAL_REACHED_TEXT)).toBeVisible();

      await learningPathLink(page).click();
      await page.getByRole('link', { name: 'Trang chủ' }).click();

      await expectHomeScreen(page);
      await expectTodayMinutes(page, 0);
      await expect(page.getByText(GOAL_REACHED_TEXT)).toHaveCount(0);
    });

    test('TC-S8.1-AC2-33: S8.1-AC2 Trang chủ hiện lại sau khi app bị ẩn qua nửa đêm', async ({
      page,
    }) => {
      await page.clock.install({
        time: new Date(`${YESTERDAY}T23:58:00+07:00`),
      });
      await seedProgress(page, {
        ...GOAL_15,
        dailyStats: [
          { date: YESTERDAY, studySeconds: TWENTY_MINUTES_IN_SECONDS },
        ],
      });
      await runClockUntil(page, new Date(`${YESTERDAY}T23:59:00+07:00`));
      await page.goto('/');
      await expectTodayMinutes(page, 20);
      await expect(page.getByText(GOAL_REACHED_TEXT)).toBeVisible();

      await setPageVisibility(page, true);
      await runClockUntil(page, new Date(`${TODAY}T00:01:00+07:00`));
      await setPageVisibility(page, false);

      await expectTodayMinutes(page, 0);
      await expect(page.getByText(GOAL_REACHED_TEXT)).toHaveCount(0);
    });
  });
});
