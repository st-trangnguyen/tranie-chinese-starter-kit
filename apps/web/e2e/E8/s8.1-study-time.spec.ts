import { expect, test } from '@playwright/test';

import {
  answerQuestions,
  completedLessons,
  expectHomeScreen,
  expectTodayMinutes,
  finishLesson,
  GOAL_15,
  GOAL_REACHED_TEXT,
  HOUR,
  learningPathLink,
  leaveLessonToHome,
  lessonId,
  lessonProgress,
  lessonTitle,
  MINUTE,
  NOW,
  openHomeThenStartLesson,
  SECOND,
  seedProgress,
  startLesson,
  stayInLessonThenLeave,
  TIMEZONE,
} from './home.helpers';
import { serveMultiUnitPath } from './multi-unit-path.helpers';

test.use({ timezoneId: TIMEZONE });

test.describe('S8.1-AC2 thời gian học hôm nay', () => {
  test.describe('ở màn bài được tính', () => {
    test.beforeEach(async ({ page }) => {
      await page.clock.install({ time: NOW });
    });

    test('TC-S8.1-AC2-2: S8.1-AC2 Đã học một phần mục tiêu', async ({
      page,
    }) => {
      await openHomeThenStartLesson(page);
      await stayInLessonThenLeave(page, 7 * MINUTE + 10 * SECOND);

      await expectTodayMinutes(page, 7);
      await expect(page.getByText(GOAL_REACHED_TEXT)).toHaveCount(0);
    });

    test('TC-S8.1-AC2-4: S8.1-AC2 Học xong quay lại Trang chủ thấy số phút tăng', async ({
      page,
    }) => {
      await seedProgress(page, GOAL_15);
      await page.goto('/');
      await expectTodayMinutes(page, 0);
      await startLesson(page);

      await page.clock.runFor(1 * MINUTE);
      await finishLesson(page);
      await page.clock.runFor(1 * MINUTE + 10 * SECOND);
      await page.getByRole('link', { name: 'Trang chủ' }).click();

      await expectHomeScreen(page);
      await expectTodayMinutes(page, 2);
    });

    test('TC-S8.1-AC2-8: S8.1-AC2 Ở màn bài được tính', async ({ page }) => {
      await openHomeThenStartLesson(page);
      await stayInLessonThenLeave(page, 3 * MINUTE + 10 * SECOND);

      await expectTodayMinutes(page, 3);
    });

    test('TC-S8.1-AC2-10: S8.1-AC2 Thoát giữa bài vẫn được tính', async ({
      page,
    }) => {
      await openHomeThenStartLesson(page);
      await answerQuestions(page, 1);
      await stayInLessonThenLeave(page, 2 * MINUTE + 10 * SECOND);

      await expectTodayMinutes(page, 2);
    });

    test('TC-S8.1-AC2-11: S8.1-AC2 Học lại bài đã xong vẫn được tính', async ({
      page,
    }) => {
      await seedProgress(page, {
        ...GOAL_15,
        lessonProgress: completedLessons([lessonId(0)]),
      });
      await page.goto('/');
      await learningPathLink(page).click();
      await page
        .getByRole('link', { name: new RegExp(lessonTitle(0)) })
        .click();
      await expect(page).toHaveURL(new RegExp(`/lessons/${lessonId(0)}$`));
      await expect(lessonProgress(page)).toBeVisible();

      await page.clock.runFor(4 * MINUTE + 10 * SECOND);
      await page.goBack();
      await expect(page).toHaveURL(/\/learning-paths$/);
      await page.getByRole('link', { name: 'Trang chủ' }).click();

      await expectHomeScreen(page);
      await expectTodayMinutes(page, 4);
    });

    test('TC-S8.1-AC2-28: S8.1-AC2 Để app mở ở màn bài không thao tác vẫn tính', async ({
      page,
    }) => {
      await openHomeThenStartLesson(page);
      await stayInLessonThenLeave(page, 2 * HOUR + 10 * SECOND);

      await expectTodayMinutes(page, 120);
    });

    test('TC-S8.1-AC2-29: S8.1-AC2 Hai tab cùng mở màn bài', async ({
      page,
      context,
    }) => {
      await seedProgress(page, GOAL_15);
      const otherPage = await context.newPage();
      for (const tab of [page, otherPage]) {
        await tab.goto('/');
        await expectHomeScreen(tab);
        await startLesson(tab);
      }

      await page.clock.runFor(3 * MINUTE + 10 * SECOND);
      await leaveLessonToHome(page);
      await leaveLessonToHome(otherPage);
      await page.reload();

      await expectTodayMinutes(page, 6);
    });
  });

  test.describe('bài kiểm tra (nội dung thay qua page.route)', () => {
    test.use({ serviceWorkers: 'block' });

    test.beforeEach(async ({ page }) => {
      await page.clock.install({ time: NOW });
    });

    // App còn nạp bài sau bước cuối của test: bỏ route trước khi test kết thúc để handler đang chạy
    // không lỗi "Test ended".
    test.afterEach(async ({ page }) => {
      await page.unrouteAll({ behavior: 'ignoreErrors' });
    });

    test('TC-S8.1-AC2-9: S8.1-AC2 Bài kiểm tra cuối chủ đề được tính', async ({
      page,
    }) => {
      await serveMultiUnitPath(page, [lessonId(2)]);
      await seedProgress(page, {
        ...GOAL_15,
        lessonProgress: completedLessons([lessonId(0), lessonId(1)]),
      });
      await page.goto('/');
      await startLesson(page);
      await expect(page).toHaveURL(new RegExp(`/lessons/${lessonId(2)}$`));

      await page.clock.runFor(3 * MINUTE + 10 * SECOND);
      await finishLesson(page);
      await page.clock.runFor(1 * MINUTE + 10 * SECOND);
      await page.getByRole('link', { name: 'Trang chủ' }).click();

      await expectHomeScreen(page);
      await expectTodayMinutes(page, 4);
    });

    test('TC-S8.1-AC2-27: S8.1-AC2 Bài kiểm tra vượt cấp được tính', async ({
      page,
    }) => {
      await seedProgress(page, GOAL_15);
      await serveMultiUnitPath(page, [lessonId(4)]);
      await page.goto('/');
      await learningPathLink(page).click();
      await page.getByRole('link', { name: 'Kiểm tra vượt cấp' }).click();
      await expect(page).toHaveURL(/\/units\/unit-b\/placement-test$/);
      await expect(lessonProgress(page)).toBeVisible();

      await page.clock.runFor(3 * MINUTE + 10 * SECOND);
      await finishLesson(page);
      await page.clock.runFor(1 * MINUTE + 10 * SECOND);
      await page.getByRole('link', { name: 'Trang chủ' }).click();

      await expectHomeScreen(page);
      await expectTodayMinutes(page, 4);
    });
  });
});
