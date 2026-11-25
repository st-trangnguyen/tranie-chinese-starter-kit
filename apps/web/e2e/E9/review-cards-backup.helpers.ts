/**
 * Helper e2e S9.1 cho các spec sao lưu (`s9.1-review-cards-backup*.spec.ts`): "máy" là một
 * `browser.newContext()` riêng (IndexedDB tách biệt), chặn service worker để `page.route` phục vụ
 * lộ trình mẫu S9.1 (design D10).
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import {
  reviewCardId,
  reviewCardSchema,
  type CardFacet,
  type ReviewCard,
} from '@csk/shared';
import {
  expect,
  type Browser,
  type BrowserContext,
  type Page,
} from '@playwright/test';
import { z } from 'zod';

import { completeOnboarding } from '../E7/intro-lessons.helpers';
import {
  backupAlert,
  backupStatus,
  exportProgress,
  IMPORTED_MESSAGE,
  importFile,
  overwriteButton,
} from '../E8/backup.helpers';
import {
  alertsOutsideBackup,
  openSettingsFromPath,
} from '../E8/settings.helpers';

import type { CardSummary } from './review-cards-lesson.helpers';
import {
  readReviewCards,
  serveReviewCardsPath,
  type ReviewCardRow,
} from './review-cards.helpers';

/** File mẫu nằm ở `e2e/E9/fixtures/progress-backup/` (design D10). */
export type ReviewBackupFixture =
  | 'ban-truoc-s9-1.json'
  | 'chu-khong-net.json'
  | 'chu-la.json'
  | 'the-nihao.json'
  | 'the-tu-la.json';

/** Đường dẫn tuyệt đối của file mẫu `name`. */
export const reviewFixturePath = (name: ReviewBackupFixture): string =>
  fileURLToPath(new URL(`./fixtures/progress-backup/${name}`, import.meta.url));

/** Phần thẻ và chữ đã viết của file sao lưu bản mới; thẻ không được có field thừa. */
const backupReviewPartSchema = z.object({
  formatVersion: z.literal(2),
  cards: z.array(reviewCardSchema.strict()),
  writtenCharacters: z.array(z.string()),
});

export interface BackupReviewPart {
  cards: ReviewCard[];
  writtenCharacters: string[];
}

const byCardId = (left: ReviewCard, right: ReviewCard): number =>
  reviewCardId(left.wordId, left.facet).localeCompare(
    reviewCardId(right.wordId, right.facet),
  );

/** Thẻ (sắp theo khóa thẻ) và chữ đã viết (sắp theo chữ) của file sao lưu ở `path`. */
export const readBackupReviewPart = async (
  path: string,
): Promise<BackupReviewPart> => {
  const content: unknown = JSON.parse(await readFile(path, 'utf8'));
  const { cards, writtenCharacters } = backupReviewPartSchema.parse(content);
  return {
    cards: cards.toSorted(byCardId),
    writtenCharacters: writtenCharacters.toSorted((left, right) =>
      left.localeCompare(right),
    ),
  };
};

/** Thẻ như dòng DB (thêm `id`), sắp như `readReviewCards`. */
export const toCardRows = (cards: readonly ReviewCard[]): ReviewCardRow[] =>
  cards
    .map((card) => ({ ...card, id: reviewCardId(card.wordId, card.facet) }))
    .toSorted((left, right) => left.id.localeCompare(right.id));

/** Chờ tới khi danh sách thẻ trên máy đúng bằng `cards` (mọi field). */
export const expectCardRows = async (
  page: Page,
  cards: readonly ReviewCard[],
): Promise<void> => {
  await expect.poll(() => readReviewCards(page)).toEqual(toCardRows(cards));
};

/** Thẻ "mới" rút gọn của các cặp (từ, chiều), sắp theo khóa thẻ như `readReviewCards`. */
export const newCardSummaries = (
  ...pairs: readonly (readonly [string, CardFacet])[]
): CardSummary[] =>
  pairs
    .map(([wordId, facet]) => ({ wordId, facet, state: 'new' }))
    .toSorted((left, right) =>
      `${left.wordId}:${left.facet}`.localeCompare(
        `${right.wordId}:${right.facet}`,
      ),
    );

const contexts: BrowserContext[] = [];

/** Một "máy": phiên trình duyệt riêng, không service worker, lộ trình mẫu S9.1. */
export const openMachine = async (browser: Browser): Promise<Page> => {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  contexts.push(context);
  const page = await context.newPage();
  await serveReviewCardsPath(page);
  return page;
};

/** Đóng mọi "máy" đã mở (gọi trong `test.afterEach`). */
export const closeMachines = async (): Promise<void> => {
  await Promise.all(contexts.splice(0).map((context) => context.close()));
};

/** Người học mới trên máy mới, đang ở màn Cài đặt. */
export const openNewLearnerSettings = async (
  browser: Browser,
): Promise<Page> => {
  const page = await openMachine(browser);
  await completeOnboarding(page);
  await openSettingsFromPath(page);
  return page;
};

/** Không có thông báo lỗi (cách S8.5): vùng alert của mục sao lưu rỗng, không alert nào khác. */
export const expectNoErrorMessage = async (page: Page): Promise<void> => {
  await expect(backupAlert(page)).toHaveText('');
  await expect(alertsOutsideBackup(page)).toHaveCount(0);
};

/** Ở màn Cài đặt: nhập file `path`, bấm "Ghi đè", chờ báo đã nhập, không có thông báo lỗi. */
export const importAndOverwrite = async (
  page: Page,
  path: string,
): Promise<void> => {
  await importFile(page, path);
  await overwriteButton(page).click();
  await expect(backupStatus(page)).toHaveText(IMPORTED_MESSAGE);
  await expectNoErrorMessage(page);
};

/** Mở màn Cài đặt (qua Lộ trình), bấm "Xuất tiến độ", trả về đường dẫn file đã lưu. */
export const exportFromSettings = async (page: Page): Promise<string> => {
  await openSettingsFromPath(page);
  const download = await exportProgress(page);
  return download.path();
};
