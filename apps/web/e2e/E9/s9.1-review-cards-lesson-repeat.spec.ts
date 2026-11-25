/**
 * e2e S9.1 Tạo thẻ ôn tập: làm lại bài, từ đã có thẻ, tiến độ có từ trước S9.1 (test-cases.md, AC1:
 * TC-S9.1-AC1-14, AC1-15, AC1-30).
 */
import { expect, test } from '@playwright/test';

import { completeOnboarding } from '../E7/intro-lessons.helpers';

import {
  expectCards,
  finishOpenedLesson,
  finishReviewLesson,
  newMeaningAndListening,
  openReviewPath,
  pathLessonItem,
  pathLessonStatus,
} from './review-cards-lesson.helpers';
import { REVIEW_LESSON_IDS } from './review-cards.content';
import {
  newCard,
  readReviewCards,
  reviewedOnceCard,
  seedReviewProgress,
  serveReviewCardsPath,
  type ReviewCardRow,
} from './review-cards.helpers';

test.use({ serviceWorkers: 'block' });

test.beforeEach(async ({ page }) => {
  await serveReviewCardsPath(page);
});

const COMPLETED_LABEL = 'Đã xong';

const cardById = (
  cards: readonly ReviewCardRow[],
  id: string,
): ReviewCardRow | undefined => cards.find((card) => card.id === id);

test.describe('S9.1-AC1 Học xong một từ thì tạo thẻ chiều nghĩa và chiều nghe — làm lại bài', () => {
  test('TC-S9.1-AC1-14: S9.1-AC1 Làm lại bài đã xong không tạo trùng thẻ — thẻ "你好" giữ nguyên sau khi làm lại bài mẫu H', async ({
    page,
  }) => {
    const meaning = reviewedOnceCard('你好', 'meaning');
    const listening = newCard('你好', 'listening');
    const seededRows: ReviewCardRow[] = [
      { ...listening, id: '你好:listening' },
      { ...meaning, id: '你好:meaning' },
    ];
    await seedReviewProgress(page, {
      lessonProgress: [{ lessonId: REVIEW_LESSON_IDS.h, status: 'completed' }],
      cards: [meaning, listening],
    });
    expect(await readReviewCards(page)).toEqual(seededRows);

    await finishReviewLesson(page, 'h');

    // Chờ lượt ghi của lần xong bài này (tiến độ + thẻ) rồi mới so thẻ.
    await openReviewPath(page);
    await expect(pathLessonStatus(page, 'h')).toHaveText(COMPLETED_LABEL);
    await expect.poll(() => readReviewCards(page)).toEqual(seededRows);
  });

  test('TC-S9.1-AC1-15: S9.1-AC1 Từ đã có thẻ từ bài khác — xong bài mẫu F rồi G, tổng 4 thẻ, thẻ "你" không bị tạo lại', async ({
    page,
  }) => {
    await completeOnboarding(page);
    await finishReviewLesson(page, 'f');
    await expectCards(page, newMeaningAndListening('你'));
    const cardsAfterF = await readReviewCards(page);

    await finishReviewLesson(page, 'g');

    await expectCards(page, newMeaningAndListening('你', '好'));
    const cardsAfterG = await readReviewCards(page);
    expect(cardById(cardsAfterG, '你:meaning')).toEqual(
      cardById(cardsAfterF, '你:meaning'),
    );
    expect(cardById(cardsAfterG, '你:listening')).toEqual(
      cardById(cardsAfterF, '你:listening'),
    );
  });

  test('TC-S9.1-AC1-30: S9.1-AC1 Bài đã xong từ trước không được tạo bù thẻ — bài mẫu A "Đã xong" không có thẻ, làm lại thì có 4 thẻ', async ({
    page,
  }) => {
    await seedReviewProgress(page, {
      lessonProgress: [{ lessonId: REVIEW_LESSON_IDS.a, status: 'completed' }],
    });

    await openReviewPath(page);
    await expect(pathLessonStatus(page, 'a')).toHaveText(COMPLETED_LABEL);
    expect(await readReviewCards(page)).toEqual([]);

    await pathLessonItem(page, 'a').getByRole('link').click();
    await expect(page).toHaveURL(
      new RegExp(`/lessons/${REVIEW_LESSON_IDS.a}$`),
    );
    await finishOpenedLesson(page);

    await expectCards(page, newMeaningAndListening('你好', '谢谢'));
  });
});
