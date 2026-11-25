/** Helper e2e S9.1 cho các spec làm bài có mạng (`s9.1-review-cards-lesson*.spec.ts`). */
import { expect, type Locator, type Page } from '@playwright/test';

import {
  FINISHED_MESSAGE,
  LEARNING_PATH_URL,
} from '../E7/intro-lessons.helpers';
import { finishLesson, lessonProgress } from '../E8/home.helpers';
import { alertsOutsideBackup } from '../E8/settings.helpers';

import {
  REVIEW_LESSON_IDS,
  REVIEW_LESSON_TITLES,
  type ReviewLessonKey,
} from './review-cards.content';
import { readReviewCards, type ReviewCardRow } from './review-cards.helpers';

export interface CardSummary {
  wordId: string;
  facet: string;
  state: string;
}

/** Thẻ rút gọn để so: từ · chiều · trạng thái (đã sắp theo `id` như `readReviewCards`). */
export const summarize = (cards: readonly ReviewCardRow[]): CardSummary[] =>
  cards.map(({ wordId, facet, state }) => ({ wordId, facet, state }));

/** Hai thẻ "mới" chiều nghĩa và nghe của mỗi từ, theo thứ tự `id`. */
export const newMeaningAndListening = (...wordIds: string[]): CardSummary[] =>
  wordIds
    .toSorted((left, right) => left.localeCompare(right))
    .flatMap((wordId) => [
      { wordId, facet: 'listening', state: 'new' },
      { wordId, facet: 'meaning', state: 'new' },
    ]);

/** Chờ tới khi danh sách thẻ (rút gọn) đúng `expected`. */
export const expectCards = async (
  page: Page,
  expected: readonly CardSummary[],
): Promise<void> => {
  await expect
    .poll(async () => summarize(await readReviewCards(page)))
    .toEqual(expected);
};

/** Mở bài mẫu `key` bằng địa chỉ, chờ màn bài hiện tiêu đề bài. */
export const openReviewLesson = async (
  page: Page,
  key: ReviewLessonKey,
): Promise<void> => {
  await page.goto(`/lessons/${REVIEW_LESSON_IDS[key]}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    REVIEW_LESSON_TITLES[key],
  );
};

/**
 * Sau khi bấm vào bài (vd. từ Lộ trình), chờ màn bài hiện câu 1. Màn Lộ trình cũng có liên kết
 * "Trang chủ" mà `finishLesson` dùng để biết bài đã xong, nên phải chờ trước khi làm bài.
 */
export const waitForFirstQuestion = async (page: Page): Promise<void> => {
  await expect(lessonProgress(page)).toHaveAccessibleName(/^Câu 1 \/ \d+$/);
};

/** Ở màn bài đang mở, làm hết mọi câu tới màn tổng kết "đã xong", không có thông báo lỗi. */
export const finishOpenedLesson = async (page: Page): Promise<void> => {
  await finishLesson(page);
  await expect(page.getByText(FINISHED_MESSAGE)).toBeVisible();
  await expect(alertsOutsideBackup(page)).toHaveCount(0);
};

/** Làm hết bài mẫu `key` (không bỏ câu nào) tới màn tổng kết "đã xong", không có thông báo lỗi. */
export const finishReviewLesson = async (
  page: Page,
  key: ReviewLessonKey,
): Promise<void> => {
  await openReviewLesson(page, key);
  await finishOpenedLesson(page);
};

/** Mục bài mẫu `key` trên màn Lộ trình (khớp đúng tiêu đề, "Bài mẫu A" khác "Bài mẫu A'"). */
export const pathLessonItem = (page: Page, key: ReviewLessonKey): Locator =>
  page.getByRole('listitem').filter({
    has: page
      .locator('.learning-path-lesson-title')
      .getByText(REVIEW_LESSON_TITLES[key], { exact: true }),
  });

/** Nhãn trạng thái của bài mẫu `key` trên màn Lộ trình. */
export const pathLessonStatus = (page: Page, key: ReviewLessonKey): Locator =>
  pathLessonItem(page, key).locator('.learning-path-lesson-status');

/** Mở màn Lộ trình bằng địa chỉ, chờ bài mẫu A hiện. */
export const openReviewPath = async (page: Page): Promise<void> => {
  await page.goto(LEARNING_PATH_URL);
  await expect(pathLessonItem(page, 'a')).toBeVisible();
};
