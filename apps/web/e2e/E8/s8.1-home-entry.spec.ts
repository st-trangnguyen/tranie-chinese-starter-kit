import { expect, test } from '@playwright/test';

import { LEARNING_PATH_URL } from '../E7/intro-lessons.helpers';
import {
  completeOnboarding,
  expectHomeScreen,
  homeHeading,
  learningPathLink,
  lessonProgress,
  lessonTitle,
  nextLessonCard,
  seedProgress,
  startLessonLink,
  TIMEZONE,
  todayStudyText,
} from './home.helpers';

test.use({ timezoneId: TIMEZONE });

test.describe('S8.1 Trang chủ', () => {
  test.describe('S8.1-AC1 vào app', () => {
    test('TC-S8.1-AC1-1: S8.1-AC1 Mở lại app sau onboarding thì vào Trang chủ', async ({
      page,
      context,
    }) => {
      await completeOnboarding(page, 15);
      await expect(page).toHaveURL(/\/lessons\/intro-01$/);
      await page.close();

      const reopened = await context.newPage();
      await reopened.goto('/');

      await expectHomeScreen(reopened);
      await expect(nextLessonCard(reopened)).toContainText(lessonTitle(0));
      await expect(startLessonLink(reopened)).toBeVisible();
      await expect(todayStudyText(reopened)).toBeVisible();
      await expect(reopened).not.toHaveURL(/\/lessons\//);
    });

    test('TC-S8.1-AC1-4: S8.1-AC1 Mở màn onboarding khi đã xong', async ({
      page,
    }) => {
      await completeOnboarding(page, 15);
      await expect(page).toHaveURL(/\/lessons\/intro-01$/);

      await page.goto('/onboarding');

      await expectHomeScreen(page);
      await expect(page.getByRole('button', { name: 'Bắt đầu' })).toHaveCount(
        0,
      );
    });

    test('TC-S8.1-AC1-21: S8.1-AC1 Tải lại ở màn khác thì vẫn ở màn đó', async ({
      page,
    }) => {
      await seedProgress(page);
      await page.goto('/');
      await expectHomeScreen(page);

      await learningPathLink(page).click();
      await expect(page).toHaveURL(/\/learning-paths$/);
      await page.reload();

      await expect(page).toHaveURL(/\/learning-paths$/);
      await expect(
        page.getByRole('heading', { level: 2, name: 'Nhập môn' }),
      ).toBeVisible();
      await expect(homeHeading(page)).toHaveCount(0);
    });

    test('TC-S8.1-AC1-2: S8.1-AC1 Vừa xong onboarding vẫn vào bài 1', async ({
      page,
    }) => {
      await completeOnboarding(page, 15);

      await expect(page).toHaveURL(/\/lessons\/intro-01$/);
      await expect(lessonProgress(page)).toBeVisible();
      await expect(homeHeading(page)).toHaveCount(0);
    });

    test('TC-S8.1-AC1-3: S8.1-AC1 Chưa xong onboarding thì vẫn vào onboarding', async ({
      page,
    }) => {
      await page.goto('/');

      await expect(page).toHaveURL(/\/onboarding$/);
      await expect(page.getByRole('button', { name: 'Bắt đầu' })).toBeVisible();
      await expect(homeHeading(page)).toHaveCount(0);
    });
  });

  test.describe('S8.1-AC1 điều hướng Trang chủ ↔ lộ trình', () => {
    test('TC-S8.1-AC1-15: S8.1-AC1 Mở bản đồ lộ trình từ Trang chủ', async ({
      page,
    }) => {
      await seedProgress(page);
      await page.goto('/');

      await learningPathLink(page).click();

      await expect(page).toHaveURL(new RegExp(`${LEARNING_PATH_URL}$`));
      await expect(
        page.getByRole('heading', { level: 2, name: 'Nhập môn' }),
      ).toBeVisible();
    });

    test('TC-S8.1-AC1-24: S8.1-AC1 Từ bản đồ lộ trình về Trang chủ', async ({
      page,
    }) => {
      await seedProgress(page);
      await page.goto('/');
      await learningPathLink(page).click();
      await expect(page).toHaveURL(new RegExp(`${LEARNING_PATH_URL}$`));

      await page.getByRole('link', { name: 'Trang chủ' }).click();

      await expectHomeScreen(page);
    });
  });
});
