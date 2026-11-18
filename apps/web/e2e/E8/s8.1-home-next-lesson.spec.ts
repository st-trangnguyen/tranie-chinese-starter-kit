import { expect, test } from '@playwright/test';

import { INTRO_LESSON_IDS } from '../E7/intro-lessons.helpers';
import {
  ALL_COMPLETED_TEXT,
  answerQuestions,
  completedLessons,
  expectHomeScreen,
  finishLesson,
  learningPathLink,
  lessonId,
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
  test.describe('S8.1-AC1 vào học', () => {
    test('TC-S8.1-AC1-5: S8.1-AC1 Bấm "Vào học" thì vào bài', async ({
      page,
    }) => {
      await seedProgress(page, {
        lessonProgress: completedLessons([lessonId(0), lessonId(1)]),
      });
      await page.goto('/');
      await expect(nextLessonCard(page)).toContainText(lessonTitle(2));

      await startLessonLink(page).click();

      await expect(page).toHaveURL(new RegExp(`/lessons/${lessonId(2)}$`));
      await expect(page.getByText(lessonTitle(2))).toBeVisible();
      await expect(lessonProgress(page)).toBeVisible();
    });

    test('TC-S8.1-AC1-6: S8.1-AC1 Bài tiếp theo đang làm dở', async ({
      page,
    }) => {
      await seedProgress(page);
      await page.goto('/');
      await startLessonLink(page).click();
      await expect(page).toHaveURL(/\/lessons\/intro-01$/);
      await answerQuestions(page, 2);

      await page.goBack();
      await expectHomeScreen(page);
      await startLessonLink(page).click();

      await expect(page).toHaveURL(/\/lessons\/intro-01$/);
      await expect(lessonProgress(page)).toHaveAccessibleName(/^Câu 3 \//);
    });

    test('TC-S8.1-AC1-7: S8.1-AC1 Dùng được bằng bàn phím', async ({
      page,
    }) => {
      await seedProgress(page);
      await page.goto('/');
      const startLink = startLessonLink(page);
      await expect(startLink).toBeVisible();

      let isFocused = false;
      for (let presses = 0; presses < 10 && !isFocused; presses += 1) {
        await page.keyboard.press('Tab');
        isFocused = await startLink.evaluate(
          (element) => element === document.activeElement,
        );
      }
      expect(isFocused).toBe(true);
      const outlineStyle = await startLink.evaluate(
        (element) => getComputedStyle(element).outlineStyle,
      );
      expect(outlineStyle).not.toBe('none');

      await page.keyboard.press('Enter');

      await expect(page).toHaveURL(/\/lessons\/intro-01$/);
      await expect(lessonProgress(page)).toBeVisible();
    });

    test('TC-S8.1-AC1-26: S8.1-AC1 Từ màn tổng kết về Trang chủ', async ({
      page,
    }) => {
      await seedProgress(page);
      await page.goto('/');
      await startLessonLink(page).click();
      await expect(page).toHaveURL(/\/lessons\/intro-01$/);

      await finishLesson(page);
      await page.getByRole('link', { name: 'Trang chủ' }).click();

      await expectHomeScreen(page);
    });
  });

  test.describe('S8.1-AC1 bài tiếp theo', () => {
    test('TC-S8.1-AC1-9: S8.1-AC1 Chưa học bài nào', async ({ page }) => {
      await seedProgress(page);
      await page.goto('/');

      await expect(nextLessonCard(page)).toContainText(lessonTitle(0));
      await expect(startLessonLink(page)).toBeVisible();

      await learningPathLink(page).click();
      await expect(
        page.getByRole('link', { name: new RegExp(lessonTitle(0)) }),
      ).toContainText('Đang mở');
    });

    test('TC-S8.1-AC1-10: S8.1-AC1 Đã xong vài bài thì hiện bài kế tiếp', async ({
      page,
    }) => {
      await seedProgress(page, {
        lessonProgress: completedLessons([lessonId(0), lessonId(1)]),
      });
      await page.goto('/');

      await expect(nextLessonCard(page)).toContainText(lessonTitle(2));
      await expect(startLessonLink(page)).toBeVisible();

      await learningPathLink(page).click();
      await expect(
        page.getByRole('link', { name: new RegExp(lessonTitle(2)) }),
      ).toContainText('Đang mở');
    });

    test('TC-S8.1-AC1-13: S8.1-AC1 Đã học xong mọi bài', async ({ page }) => {
      await seedProgress(page, {
        lessonProgress: completedLessons(INTRO_LESSON_IDS),
      });
      await page.goto('/');

      await expect(page.getByText(ALL_COMPLETED_TEXT)).toBeVisible();
      await expect(startLessonLink(page)).toHaveCount(0);
      await expect(todayStudyText(page)).toHaveText('Hôm nay: 0 / 15 phút');
      await expect(learningPathLink(page)).toBeVisible();
    });

    test('TC-S8.1-AC1-14: S8.1-AC1 Tiến độ lưu bị hỏng', async ({ page }) => {
      await seedProgress(page, {
        lessonProgress: [
          { lessonId: lessonId(0), status: 'xyz' },
          ...completedLessons([lessonId(1)]),
        ],
      });
      await page.goto('/');

      await expectHomeScreen(page);
      await expect(nextLessonCard(page)).toContainText(lessonTitle(0));
      await expect(startLessonLink(page)).toBeVisible();
      await expect(page.getByRole('alert')).toHaveCount(0);
    });
  });
});
