/**
 * e2e S9.1 Tạo thẻ ôn tập: viết chữ ở màn luyện viết (test-cases.md, AC2: TC-S9.1-AC2-1, AC2-3, AC2-4,
 * AC2-5, AC2-6, AC2-7, AC2-10; TC-S6.2-AC1-33). Câu viết trong bài:
 * `s9.1-review-cards-writing-lesson.spec.ts`.
 */
import { reviewCardId } from '@csk/shared';
import { expect, test } from '@playwright/test';

import {
  openWritingPractice,
  outlineStrokes,
  userStrokes,
  writingPad,
} from '../E6/writing-practice.helpers';
import { completeOnboarding } from '../E7/intro-lessons.helpers';
import { writeCharacter } from '../E7/intro-writing.helpers';

import {
  expectCards,
  finishReviewLesson,
  newMeaningAndListening,
} from './review-cards-lesson.helpers';
import { REVIEW_LESSON_IDS } from './review-cards.content';
import {
  newCard,
  readReviewCards,
  readWrittenCharacters,
  reviewedOnceCard,
  seedReviewProgress,
  serveReviewCardsPath,
} from './review-cards.helpers';
import {
  completeMessage,
  expectCharacterSaved,
  newAllFacets,
  NO_WRITE_SETTLE_MS,
  practiceCharacter,
  practiceFirstStrokeThenLeave,
} from './review-cards-writing.helpers';

test.use({ serviceWorkers: 'block' });

test.beforeEach(async ({ page }) => {
  await serveReviewCardsPath(page);
});

test.describe('S9.1-AC2 Viết xong chữ thì tạo thẻ chiều viết — màn luyện viết', () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
  });

  test('TC-S9.1-AC2-1: S9.1-AC2 Viết xong chữ của từ đã học thì tạo thẻ chiều viết — xong bài mẫu B rồi luyện viết "人"', async ({
    page,
  }) => {
    await finishReviewLesson(page, 'b');
    await expectCards(page, newMeaningAndListening('人'));

    await practiceCharacter(page, '人');

    await expectCards(page, newAllFacets('人'));
  });

  test('TC-S9.1-AC2-3: S9.1-AC2 Viết trước rồi học xong sau — viết "人" chưa có thẻ, xong bài mẫu B có đủ ba chiều', async ({
    page,
  }) => {
    await practiceCharacter(page, '人');
    await page.waitForTimeout(NO_WRITE_SETTLE_MS);
    expect(await readReviewCards(page)).toEqual([]);

    await finishReviewLesson(page, 'b');

    await expectCards(page, newAllFacets('人'));
  });

  test('TC-S9.1-AC2-4: S9.1-AC2 Từ nhiều chữ cần viết xong mọi chữ — "你" chưa đủ, "好" (lần mở app sau) có thẻ "你好" chiều viết', async ({
    page,
  }) => {
    await finishReviewLesson(page, 'h');
    await expectCards(page, newMeaningAndListening('你好'));

    await practiceCharacter(page, '你');
    await page.waitForTimeout(NO_WRITE_SETTLE_MS);
    await expectCards(page, newMeaningAndListening('你好'));

    await page.reload();
    await practiceCharacter(page, '好');

    await expectCards(page, newAllFacets('你好'));
  });

  test('TC-S9.1-AC2-5, TC-S9.1-AC2-6: S9.1-AC2 Chữ đã viết dùng chung cho các từ — viết "你", "好"; xong bài H rồi bài G', async ({
    page,
  }) => {
    await practiceCharacter(page, '你');
    await practiceCharacter(page, '好');

    await finishReviewLesson(page, 'h');
    // TC-S9.1-AC2-5
    await expectCards(page, newAllFacets('你好'));

    await finishReviewLesson(page, 'g');
    // TC-S9.1-AC2-6: không viết thêm chữ nào, lần viết trước dùng lại cho "你" và "好".
    await expectCards(page, newAllFacets('你', '你好', '好'));
  });

  test('TC-S9.1-AC2-7: S9.1-AC2 Viết dở không tính — xong bài mẫu B, viết nét đầu của "人" rồi thoát', async ({
    page,
  }) => {
    await finishReviewLesson(page, 'b');
    await expectCards(page, newMeaningAndListening('人'));

    await practiceFirstStrokeThenLeave(page, '人');
    await page.waitForTimeout(NO_WRITE_SETTLE_MS);

    expect(await readWrittenCharacters(page)).toEqual([]);
    await expectCards(page, newMeaningAndListening('人'));
  });
});

test('TC-S9.1-AC2-10: S9.1-AC2 Viết lại không tạo trùng thẻ chiều viết — thẻ "人" chiều viết đã ôn giữ nguyên', async ({
  page,
}) => {
  const seededCards = [
    newCard('人', 'meaning'),
    newCard('人', 'listening'),
    reviewedOnceCard('人', 'writing'),
  ];
  const seededRows = seededCards
    .map((card) => ({ ...card, id: reviewCardId(card.wordId, card.facet) }))
    .toSorted((left, right) => left.id.localeCompare(right.id));
  await seedReviewProgress(page, {
    lessonProgress: [{ lessonId: REVIEW_LESSON_IDS.b, status: 'completed' }],
    cards: seededCards,
    writtenCharacters: ['人'],
  });
  expect(await readReviewCards(page)).toEqual(seededRows);

  await practiceCharacter(page, '人');
  await page.waitForTimeout(NO_WRITE_SETTLE_MS);

  expect(await readReviewCards(page)).toEqual(seededRows);
  expect(await readWrittenCharacters(page)).toEqual(['人']);
});

test('TC-S6.2-AC1-33: S6.2-AC1 Viết đúng hết các nét thì hoàn thành chữ — "人": báo xong, ở lại màn, không điểm hay "đã lưu", "Viết lại" về nét mờ', async ({
  page,
}) => {
  await completeOnboarding(page);
  await openWritingPractice(page, '人');
  const url = page.url();

  await writeCharacter(page, '人');

  await expect(completeMessage(page, '人')).toBeVisible();
  await expectCharacterSaved(page, '人');
  expect(page.url()).toBe(url);
  const main = page.getByRole('main');
  await expect(main.getByText(/%|điểm|đã lưu/i)).toHaveCount(0);
  await expect(page.getByRole('alert')).toHaveCount(0);
  const restart = page.getByRole('button', { name: 'Viết lại' });
  await expect(restart).toBeVisible();

  await restart.click();

  const pad = writingPad(page, '人');
  await expect(completeMessage(page, '人')).toHaveCount(0);
  await expect(pad).toHaveAttribute('data-completed-stroke-count', '0');
  await expect(userStrokes(pad)).toHaveCount(0);
  await expect(outlineStrokes(pad)).toHaveCount(2);
});
