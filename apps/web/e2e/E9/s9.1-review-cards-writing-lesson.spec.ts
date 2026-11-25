/**
 * e2e S9.1 Tạo thẻ ôn tập: câu viết chữ trong bài (test-cases.md, AC2: TC-S9.1-AC2-2, AC2-8, AC2-11,
 * AC2-18). Màn luyện viết: `s9.1-review-cards-writing.spec.ts`.
 */
import { expect, test } from '@playwright/test';

import { completeOnboarding } from '../E7/intro-lessons.helpers';
import { verdict, writeCharacter } from '../E7/intro-writing.helpers';
import { lessonProgress } from '../E8/home.helpers';

import {
  expectCards,
  finishOpenedLesson,
  finishReviewLesson,
  newMeaningAndListening,
  openReviewLesson,
  openReviewPath,
  pathLessonStatus,
} from './review-cards-lesson.helpers';
import { NO_STROKE_CHARACTER } from './review-cards.content';
import {
  readReviewCards,
  readWrittenCharacters,
  serveReviewCardsPath,
} from './review-cards.helpers';
import {
  newAllFacets,
  NO_WRITE_SETTLE_MS,
  practiceFirstStrokeThenLeave,
  writeFirstStroke,
} from './review-cards-writing.helpers';

const COMPLETED_LABEL = 'Đã xong';

test.use({ serviceWorkers: 'block' });

test.beforeEach(async ({ page }) => {
  await serveReviewCardsPath(page);
  await completeOnboarding(page);
});

test.describe('S9.1-AC2 Viết xong chữ thì tạo thẻ chiều viết — câu viết trong bài', () => {
  test('TC-S9.1-AC2-2: S9.1-AC2 Viết xong ở câu viết trong bài cũng tính — câu 1 bài mẫu C rồi thoát, có thẻ "人" chiều viết', async ({
    page,
  }) => {
    await finishReviewLesson(page, 'b');
    await expectCards(page, newMeaningAndListening('人'));
    await openReviewLesson(page, 'c');
    await expect(lessonProgress(page)).toHaveAccessibleName('Câu 1 / 2');

    await writeCharacter(page, '人');
    await expect(verdict(page, 'Đúng')).toBeVisible();

    // Ngay sau câu viết, chưa rời bài.
    await expectCards(page, newAllFacets('人'));

    await openReviewPath(page);
    await expect(pathLessonStatus(page, 'c')).not.toHaveText(COMPLETED_LABEL);
    await expectCards(page, newAllFacets('人'));
  });

  test('TC-S9.1-AC2-8: S9.1-AC2 Viết dở không tính — nét đầu ở câu viết bài C và nét đầu ở luyện viết không cộng thành viết xong', async ({
    page,
  }) => {
    await finishReviewLesson(page, 'b');
    await expectCards(page, newMeaningAndListening('人'));

    await openReviewLesson(page, 'c');
    await writeFirstStroke(page, '人');
    await openReviewPath(page);
    await practiceFirstStrokeThenLeave(page, '人');
    await page.waitForTimeout(NO_WRITE_SETTLE_MS);

    expect(await readWrittenCharacters(page)).toEqual([]);
    await expectCards(page, newMeaningAndListening('人'));
  });

  test('TC-S9.1-AC2-11: S9.1-AC2 Từ có chữ không có dữ liệu nét — xong bài mẫu K có thẻ nghĩa và nghe, không có chiều viết', async ({
    page,
  }) => {
    await finishReviewLesson(page, 'k');

    await expectCards(page, newMeaningAndListening(NO_STROKE_CHARACTER));
    const facets = (await readReviewCards(page)).map((card) => card.facet);
    expect(facets).not.toContain('writing');
  });

  test('TC-S9.1-AC2-18: S9.1-AC2 Làm hết bài có câu viết chữ thì có đủ ba chiều — bài mẫu C có đúng 3 thẻ "人" "mới"', async ({
    page,
  }) => {
    await openReviewLesson(page, 'c');

    await finishOpenedLesson(page);

    await expectCards(page, newAllFacets('人'));
    await openReviewPath(page);
    await expect(pathLessonStatus(page, 'c')).toHaveText(COMPLETED_LABEL);
  });
});
