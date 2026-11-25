/** e2e S9.1 Tạo thẻ ôn tập: làm bài (test-cases.md, AC1). */
import { expect, test } from '@playwright/test';

import { completeOnboarding } from '../E7/intro-lessons.helpers';

import {
  REVIEW_LESSON_IDS,
  REVIEW_LESSON_TITLES,
} from './review-cards.content';
import { readReviewCards, serveReviewCardsPath } from './review-cards.helpers';

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
