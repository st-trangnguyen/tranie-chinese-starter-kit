/** Helper e2e S9.1 cho các spec viết chữ (`s9.1-review-cards-writing*.spec.ts`). */
import type { CardFacet } from '@csk/shared';
import { expect, type Locator, type Page } from '@playwright/test';

import {
  drawMedian,
  openWritingPractice,
  readBuiltMedians,
} from '../E6/writing-practice.helpers';
import { readyPad, writeCharacter } from '../E7/intro-writing.helpers';

import {
  openReviewPath,
  type CardSummary,
} from './review-cards-lesson.helpers';
import { readWrittenCharacters } from './review-cards.helpers';

/**
 * Chờ cho kết luận "không có gì được ghi": không có tín hiệu nào trên màn báo lượt ghi đã chạy xong,
 * nên chờ một khoảng dư so với một lượt ghi IndexedDB rồi mới đọc.
 */
export const NO_WRITE_SETTLE_MS = 1_000;

export const completeMessage = (page: Page, character: string): Locator =>
  page.getByText(`Đã viết xong chữ ${character}.`, { exact: true });

/** Thẻ "mới" của các cặp (từ, chiều), sắp theo `id` như `readReviewCards`. */
const newCards = (
  ...pairs: readonly (readonly [string, CardFacet])[]
): CardSummary[] =>
  pairs
    .map(([wordId, facet]) => ({ wordId, facet, state: 'new' }))
    .toSorted((left, right) =>
      `${left.wordId}:${left.facet}`.localeCompare(
        `${right.wordId}:${right.facet}`,
      ),
    );

/** Ba chiều "mới" của mỗi từ. */
export const newAllFacets = (...wordIds: string[]): CardSummary[] =>
  newCards(
    ...wordIds.flatMap((wordId) =>
      (['listening', 'meaning', 'writing'] as const).map(
        (facet) => [wordId, facet] as const,
      ),
    ),
  );

/** Chờ app ghi nhận chữ `character` đã viết xong (ghi chạy sau khi màn báo xong). */
export const expectCharacterSaved = async (
  page: Page,
  character: string,
): Promise<void> => {
  await expect
    .poll(() => readWrittenCharacters(page))
    .toEqual(expect.arrayContaining([character]));
};

/** Mở luyện viết chữ `character`, viết đúng hết các nét, chờ màn báo xong và chữ được ghi nhận. */
export const practiceCharacter = async (
  page: Page,
  character: string,
): Promise<void> => {
  await openWritingPractice(page, character);
  await writeCharacter(page, character);
  await expect(completeMessage(page, character)).toBeVisible();
  await expectCharacterSaved(page, character);
};

/** Ở khung viết chữ `character` đang hiện, viết đúng nét đầu (chưa xong chữ). */
export const writeFirstStroke = async (
  page: Page,
  character: string,
): Promise<void> => {
  const pad = await readyPad(page, character);
  const [first] = await readBuiltMedians(page, character);
  if (!first) {
    throw new Error(`File nét của ${character} không có nét nào.`);
  }
  await drawMedian(page, pad, first);
  await expect(pad).toHaveAttribute('data-completed-stroke-count', '1');
  await expect(completeMessage(page, character)).toHaveCount(0);
};

/** Mở luyện viết chữ `character`, viết đúng nét đầu rồi thoát sang màn Lộ trình. */
export const practiceFirstStrokeThenLeave = async (
  page: Page,
  character: string,
): Promise<void> => {
  await openWritingPractice(page, character);
  await writeFirstStroke(page, character);
  await openReviewPath(page);
};
