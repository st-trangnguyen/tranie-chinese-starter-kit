import { expect, test, type Page } from '@playwright/test';

import { INTRO_LESSON_IDS } from '../E7/intro-lessons.helpers';
import {
  answerQuestions,
  completedLessons,
  expectHomeScreen,
  learningPathLink,
  lessonId,
  lessonProgress,
  lessonTitle,
  nextLessonCard,
  seedProgress,
  startLessonLink,
  TIMEZONE,
} from './home.helpers';
import { serveMultiUnitPath } from './multi-unit-path.helpers';

test.use({ timezoneId: TIMEZONE });

test.describe('S8.1 Trang chủ', () => {
  test.describe('S8.1-AC1 lộ trình nhiều nhóm, giai đoạn (nội dung thay qua page.route)', () => {
    // page.route không chặn được request do service worker phục vụ (design "Test").
    test.use({ serviceWorkers: 'block' });

    const UNIT_TEST_ID = lessonId(2);
    const serveMultiUnit = (page: Page): Promise<void> =>
      serveMultiUnitPath(page, [UNIT_TEST_ID]);

    test('TC-S8.1-AC1-11: S8.1-AC1 Bài kế tiếp ở nhóm hoặc giai đoạn sau — nhóm sau', async ({
      page,
    }) => {
      await serveMultiUnit(page);
      await seedProgress(page, {
        lessonProgress: completedLessons([
          lessonId(0),
          lessonId(1),
          lessonId(2),
        ]),
      });
      await page.goto('/');

      await expect(nextLessonCard(page)).toContainText(lessonTitle(3));

      await learningPathLink(page).click();
      await expect(
        page.getByRole('link', { name: new RegExp(lessonTitle(3)) }),
      ).toContainText('Đang mở');
    });

    test('TC-S8.1-AC1-11: S8.1-AC1 Bài kế tiếp ở nhóm hoặc giai đoạn sau — giai đoạn sau', async ({
      page,
    }) => {
      await serveMultiUnit(page);
      await seedProgress(page, {
        lessonProgress: completedLessons(INTRO_LESSON_IDS.slice(0, 5)),
      });
      await page.goto('/');

      await expect(nextLessonCard(page)).toContainText(lessonTitle(5));

      await learningPathLink(page).click();
      await expect(
        page.getByRole('link', { name: new RegExp(lessonTitle(5)) }),
      ).toContainText('Đang mở');
    });

    test('TC-S8.1-AC1-12: S8.1-AC1 Còn bài đang mở ở trước một bài đã xong', async ({
      page,
    }) => {
      await serveMultiUnit(page);
      await seedProgress(page, {
        lessonProgress: completedLessons([lessonId(3)]),
      });
      await page.goto('/');

      await expect(nextLessonCard(page)).toContainText(lessonTitle(0));
      await expect(nextLessonCard(page)).not.toContainText(lessonTitle(4));
    });

    test('TC-S8.1-AC1-23: S8.1-AC1 Bài tiếp theo là bài kiểm tra cuối chủ đề đang làm dở', async ({
      page,
    }) => {
      await serveMultiUnit(page);
      await seedProgress(page, {
        lessonProgress: completedLessons([lessonId(0), lessonId(1)]),
      });
      await page.goto('/');
      await expect(nextLessonCard(page)).toContainText(lessonTitle(2));
      await startLessonLink(page).click();
      await expect(page).toHaveURL(new RegExp(`/lessons/${UNIT_TEST_ID}$`));
      await answerQuestions(page, 2);

      await page.goBack();
      await expectHomeScreen(page);
      await startLessonLink(page).click();

      await expect(page).toHaveURL(new RegExp(`/lessons/${UNIT_TEST_ID}$`));
      await expect(lessonProgress(page)).toHaveAccessibleName(/^Câu 1 \//);
    });
  });
});
