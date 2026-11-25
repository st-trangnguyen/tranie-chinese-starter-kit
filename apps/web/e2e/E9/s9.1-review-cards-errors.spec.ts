/**
 * e2e S9.1 Tạo thẻ ôn tập: không lưu được thẻ / chữ đã viết (test-cases.md: TC-S9.1-AC1-16, AC1-17,
 * TC-S9.1-AC2-12, AC2-20, AC2-21, AC2-22). "Lỗi lưu thẻ" = `BREAK_CARD_WRITES`; "lỗi lưu" =
 * `BREAK_ALL_REVIEW_WRITES`. Case "Tiếp …" chạy lại phần đầu trong cùng test để độc lập.
 */
import { expect, test, type Page } from '@playwright/test';

import {
  outlineStrokes,
  openWritingPractice,
  userStrokes,
  writingPad,
} from '../E6/writing-practice.helpers';
import { completeOnboarding } from '../E7/intro-lessons.helpers';
import { writeCharacter } from '../E7/intro-writing.helpers';
import { alertsOutsideBackup } from '../E8/settings.helpers';

import {
  expectCards,
  finishReviewLesson,
  newMeaningAndListening,
  openReviewPath,
  pathLessonStatus,
} from './review-cards-lesson.helpers';
import {
  BREAK_ALL_REVIEW_WRITES,
  BREAK_CARD_WRITES,
  breakReviewWrites,
  readReviewCards,
  readWrittenCharacters,
  restoreReviewWrites,
  serveReviewCardsPath,
} from './review-cards.helpers';
import {
  completeMessage,
  newAllFacets,
  NO_WRITE_SETTLE_MS,
  practiceCharacter,
} from './review-cards-writing.helpers';

const COMPLETED_LABEL = 'Đã xong';

test.use({ serviceWorkers: 'block' });

test.beforeEach(async ({ page }) => {
  await serveReviewCardsPath(page);
  await completeOnboarding(page);
});

/** Danh sách thẻ hiện tại không có thẻ nào của từ `wordId` ở chiều `facet` (bỏ trống = mọi chiều). */
const expectNoCardOf = async (
  page: Page,
  wordId: string,
  facet?: string,
): Promise<void> => {
  const cards = await readReviewCards(page);
  expect(
    cards.filter(
      (card) =>
        card.wordId === wordId && (facet === undefined || card.facet === facet),
    ),
  ).toEqual([]);
};

/**
 * TC-S9.1-AC1-16: giả lập lỗi lưu thẻ, xong bài mẫu H: tổng kết bình thường không lỗi, bài "Đã xong",
 * không có thẻ "你好".
 */
const finishHWithCardWritesBroken = async (page: Page): Promise<void> => {
  await breakReviewWrites(page, BREAK_CARD_WRITES);

  await finishReviewLesson(page, 'h');

  await openReviewPath(page);
  await expect(pathLessonStatus(page, 'h')).toHaveText(COMPLETED_LABEL);
  await page.waitForTimeout(NO_WRITE_SETTLE_MS);
  await expectNoCardOf(page, '你好');
};

/**
 * TC-S9.1-AC2-12: xong bài mẫu B, giả lập lỗi lưu, viết xong "人": màn báo xong, "Viết lại" dùng được,
 * không lỗi, không có thẻ "人" chiều viết.
 */
const writeRenWithAllWritesBroken = async (page: Page): Promise<void> => {
  await finishReviewLesson(page, 'b');
  await expectCards(page, newMeaningAndListening('人'));
  await breakReviewWrites(page, BREAK_ALL_REVIEW_WRITES);

  await openWritingPractice(page, '人');
  await writeCharacter(page, '人');

  await expect(completeMessage(page, '人')).toBeVisible();
  await expect(alertsOutsideBackup(page)).toHaveCount(0);
  await page.waitForTimeout(NO_WRITE_SETTLE_MS);
  await expect(alertsOutsideBackup(page)).toHaveCount(0);
  expect(await readWrittenCharacters(page)).toEqual([]);
  await expectNoCardOf(page, '人', 'writing');

  const restart = page.getByRole('button', { name: 'Viết lại' });
  await expect(restart).toBeVisible();
  await restart.click();
  const pad = writingPad(page, '人');
  await expect(completeMessage(page, '人')).toHaveCount(0);
  await expect(pad).toHaveAttribute('data-completed-stroke-count', '0');
  await expect(userStrokes(pad)).toHaveCount(0);
  await expect(outlineStrokes(pad)).toHaveCount(2);
  await expect(alertsOutsideBackup(page)).toHaveCount(0);
};

test.describe('S9.1-AC1 Học xong một từ thì tạo thẻ chiều nghĩa và chiều nghe — lỗi lưu thẻ', () => {
  test('TC-S9.1-AC1-16: S9.1-AC1 Không lưu được thẻ thì bài vẫn xong — bài mẫu H "Đã xong", không lỗi, không có thẻ "你好"', async ({
    page,
  }) => {
    await finishHWithCardWritesBroken(page);

    expect(await readReviewCards(page)).toEqual([]);
  });

  test('TC-S9.1-AC1-17: S9.1-AC1 Thẻ còn thiếu được tạo ở lần xong bài sau — bỏ lỗi, làm lại bài mẫu H có thẻ "你好" "mới"', async ({
    page,
  }) => {
    await finishHWithCardWritesBroken(page);
    await restoreReviewWrites(page);

    await finishReviewLesson(page, 'h');

    await expectCards(page, newMeaningAndListening('你好'));
  });
});

test.describe('S9.1-AC2 Viết xong chữ thì tạo thẻ chiều viết — lỗi lưu', () => {
  test('TC-S9.1-AC2-12: S9.1-AC2 Viết xong chữ vẫn báo xong khi không lưu được — "人" báo xong, "Viết lại" dùng được, không lỗi, không có thẻ chiều viết', async ({
    page,
  }) => {
    await writeRenWithAllWritesBroken(page);

    await expectCards(page, newMeaningAndListening('人'));
  });

  test('TC-S9.1-AC2-20: S9.1-AC2 Thẻ chiều viết còn thiếu được tạo ở lần viết xong sau — bỏ lỗi, viết "人" thêm lần nữa', async ({
    page,
  }) => {
    await writeRenWithAllWritesBroken(page);
    await restoreReviewWrites(page);

    await practiceCharacter(page, '人');

    await expectCards(page, newAllFacets('人'));
  });

  test('TC-S9.1-AC2-21: S9.1-AC2 Thẻ chiều viết còn thiếu được tạo ở lần viết xong sau — bỏ lỗi, chỉ làm lại bài mẫu B: không có thẻ chiều viết', async ({
    page,
  }) => {
    await writeRenWithAllWritesBroken(page);
    await restoreReviewWrites(page);

    await finishReviewLesson(page, 'b');

    await openReviewPath(page);
    await expect(pathLessonStatus(page, 'b')).toHaveText(COMPLETED_LABEL);
    await page.waitForTimeout(NO_WRITE_SETTLE_MS);
    await expectCards(page, newMeaningAndListening('人'));
    expect(await readWrittenCharacters(page)).toEqual([]);
  });

  test('TC-S9.1-AC2-22: S9.1-AC2 Thẻ chiều viết còn thiếu được tạo ở lần xong bài sau — lỗi lưu thẻ khi viết "人", bỏ lỗi, làm lại bài mẫu B', async ({
    page,
  }) => {
    await finishReviewLesson(page, 'b');
    await expectCards(page, newMeaningAndListening('人'));
    await breakReviewWrites(page, BREAK_CARD_WRITES);

    // Chữ đã viết vẫn ghi nhận được (practiceCharacter chờ "人" có trong danh sách chữ đã viết).
    await practiceCharacter(page, '人');
    await page.waitForTimeout(NO_WRITE_SETTLE_MS);
    await expect(alertsOutsideBackup(page)).toHaveCount(0);
    await expectNoCardOf(page, '人', 'writing');

    await restoreReviewWrites(page);
    await finishReviewLesson(page, 'b');

    // Đủ ba chiều "mới", mỗi chiều đúng một thẻ (không trùng "人" nghĩa và nghe).
    await expectCards(page, newAllFacets('人'));
  });
});
