/**
 * e2e S9.1 Tạo thẻ ôn tập: làm bài (test-cases.md, AC1: TC-S9.1-AC1-1, AC1-4, AC1-5, AC1-6, AC1-7,
 * AC1-8). Làm lại bài, từ có thẻ từ bài khác, tiến độ cũ: `s9.1-review-cards-lesson-repeat.spec.ts`.
 */
import { expect, test } from '@playwright/test';

import {
  answerCurrentQuestion,
  completeOnboarding,
  skipButton,
} from '../E7/intro-lessons.helpers';
import { HOME_URL, lessonProgress } from '../E8/home.helpers';
import { alertsOutsideBackup } from '../E8/settings.helpers';

import {
  expectCards,
  finishReviewLesson,
  newMeaningAndListening,
  openReviewLesson,
  openReviewPath,
  pathLessonStatus,
  summarize,
} from './review-cards-lesson.helpers';
import {
  REVIEW_LESSON_IDS,
  REVIEW_LESSON_TITLES,
} from './review-cards.content';
import { readReviewCards, serveReviewCardsPath } from './review-cards.helpers';

const SKIPPED_ONE_MESSAGE = 'Bạn đã bỏ qua 1 câu, bài chưa hoàn thành.';
const SUMMARY_HOME_LABEL = 'Trang chủ';

test.use({ serviceWorkers: 'block' });

test.beforeEach(async ({ page }) => {
  await serveReviewCardsPath(page);
  await completeOnboarding(page);
});

test('S9.1 nội dung mẫu: mở bài mẫu A, người học mới chưa có thẻ nào', async ({
  page,
}) => {
  await page.goto(`/lessons/${REVIEW_LESSON_IDS.a}`);

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    REVIEW_LESSON_TITLES.a,
  );
  expect(await readReviewCards(page)).toEqual([]);
});

test.describe('S9.1-AC1 Học xong một từ thì tạo thẻ chiều nghĩa và chiều nghe', () => {
  test('TC-S9.1-AC1-1: S9.1-AC1 Xong bài học thì tạo thẻ nghĩa và nghe — bài mẫu A có đúng 4 thẻ "mới"', async ({
    page,
  }) => {
    await finishReviewLesson(page, 'a');

    await expectCards(page, newMeaningAndListening('你好', '谢谢'));
  });

  test('TC-S9.1-AC1-4: S9.1-AC1 Học xong bài chưa có thẻ chiều viết — bài mẫu B có "人" nghĩa và nghe, không có chiều viết', async ({
    page,
  }) => {
    await finishReviewLesson(page, 'b');

    await expectCards(page, newMeaningAndListening('人'));
    const facets = (await readReviewCards(page)).map((card) => card.facet);
    expect(facets).not.toContain('writing');
  });

  test('TC-S9.1-AC1-5: S9.1-AC1 Câu cặp âm tạo thẻ cho cả hai từ — bài mẫu D có thẻ "妈" và "马"', async ({
    page,
  }) => {
    await finishReviewLesson(page, 'd');

    await expectCards(page, newMeaningAndListening('妈', '马'));
  });

  test('TC-S9.1-AC1-6: S9.1-AC1 Câu nói theo câu không tạo thẻ — bài mẫu E xong, danh sách thẻ rỗng', async ({
    page,
  }) => {
    await finishReviewLesson(page, 'e');

    // Chờ bài được ghi "Đã xong" (cùng lượt với tạo thẻ) rồi mới đọc danh sách thẻ.
    await openReviewPath(page);
    await expect(pathLessonStatus(page, 'e')).toHaveText('Đã xong');
    expect(await readReviewCards(page)).toEqual([]);
  });

  test('TC-S9.1-AC1-7: S9.1-AC1 Bài chưa xong không tạo thẻ — làm 1 câu bài mẫu A rồi thoát, danh sách thẻ rỗng', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page).toHaveURL(HOME_URL);
    await openReviewLesson(page, 'a');
    await answerCurrentQuestion(page);
    await expect(lessonProgress(page)).toHaveAccessibleName('Câu 2 / 2');

    await page.goBack();
    await expect(page).toHaveURL(HOME_URL);

    await openReviewPath(page);
    await expect(pathLessonStatus(page, 'a')).toHaveText('Đang mở');
    expect(await readReviewCards(page)).toEqual([]);
  });

  test("TC-S9.1-AC1-8: S9.1-AC1 Bài chưa xong không tạo thẻ — bài mẫu A' bỏ qua câu viết, không có thẻ nào", async ({
    page,
  }) => {
    await openReviewLesson(page, 'aSkip');
    await answerCurrentQuestion(page);
    await answerCurrentQuestion(page);
    await expect(lessonProgress(page)).toHaveAccessibleName('Câu 3 / 3');
    await skipButton(page).click();

    await expect(
      page.getByRole('heading', { name: SKIPPED_ONE_MESSAGE }),
    ).toBeVisible();
    await expect(alertsOutsideBackup(page)).toHaveCount(0);
    await page.getByRole('link', { name: SUMMARY_HOME_LABEL }).click();
    await expect(page).toHaveURL(HOME_URL);

    await openReviewPath(page);
    await expect(pathLessonStatus(page, 'aSkip')).not.toHaveText('Đã xong');
    expect(summarize(await readReviewCards(page))).toEqual([]);
  });
});
