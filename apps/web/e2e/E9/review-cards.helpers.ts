/** Helper e2e S9.1 Tạo thẻ ôn tập (design D10). */
import {
  reviewCardId,
  reviewCardSchema,
  writtenCharacterSchema,
  type CardFacet,
  type ReviewCard,
} from '@csk/shared';
import { expect, type Page, type Route } from '@playwright/test';
import { z } from 'zod';

import { readBuiltWords } from '../E7/intro-lessons.helpers';

import {
  findReviewLesson,
  REVIEW_CONTENT_ROOT,
  withExtraWords,
} from './review-cards.content';

const DB_NAME = 'tranie-chinese';
const CARDS_STORE = 'cards';
const WRITTEN_STORE = 'writtenCharacters';
const REVIEW_LESSON_URL = /\/content\/lessons\/(s91-[^/]+)\.json(\?.*)?$/;

/**
 * Thay nội dung bằng lộ trình mẫu S9.1: `content.json`, `lessons/s91-*.json`, `words.json` (từ thật
 * + từ thêm). Phục vụ thẳng từ phía test (không `route.fetch`) nên vẫn chạy khi `setOffline(true)`.
 * Cần `serviceWorkers: 'block'`: page.route không chặn request do service worker phục vụ.
 */
export const serveReviewCardsPath = async (page: Page): Promise<void> => {
  const words = withExtraWords(readBuiltWords());
  await page.route('**/content/content.json', (route: Route) =>
    route.fulfill({ json: REVIEW_CONTENT_ROOT }),
  );
  await page.route('**/content/words.json', (route: Route) =>
    route.fulfill({ json: words }),
  );
  await page.route(REVIEW_LESSON_URL, (route: Route) => {
    const match = REVIEW_LESSON_URL.exec(new URL(route.request().url()).href);
    const lessonId = decodeURIComponent(match?.[1] ?? '');
    const lesson = findReviewLesson(lessonId);
    return lesson === undefined
      ? route.fulfill({ status: 404, body: 'Not found' })
      : route.fulfill({ json: lesson });
  });
};

/** Dòng bảng `cards`: thẻ + khóa `id` = `${wordId}:${facet}`. */
const cardRowSchema = reviewCardSchema.extend({ id: z.string() });
export type ReviewCardRow = z.infer<typeof cardRowSchema>;

const readAllRows = (page: Page, storeName: string): Promise<unknown[]> =>
  page.evaluate(
    ({ dbName, name }) =>
      new Promise<unknown[]>((resolve, reject) => {
        const request = indexedDB.open(dbName);
        request.onerror = () => reject(new Error('Không mở được IndexedDB.'));
        request.onsuccess = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(name)) {
            db.close();
            reject(new Error(`IndexedDB chưa có bảng "${name}".`));
            return;
          }
          const getAll = db
            .transaction(name, 'readonly')
            .objectStore(name)
            .getAll();
          getAll.onsuccess = () => {
            db.close();
            resolve(getAll.result);
          };
          getAll.onerror = () => {
            db.close();
            reject(new Error(`Không đọc được bảng "${name}".`));
          };
        };
      }),
    { dbName: DB_NAME, name: storeName },
  );

/** Danh sách thẻ ôn tập đã lưu trong trình duyệt, sắp theo `id`. */
export const readReviewCards = async (page: Page): Promise<ReviewCardRow[]> =>
  cardRowSchema
    .array()
    .parse(await readAllRows(page, CARDS_STORE))
    .toSorted((left, right) => left.id.localeCompare(right.id));

/** Các chữ đã viết xong đã lưu trong trình duyệt, sắp theo chữ. */
export const readWrittenCharacters = async (page: Page): Promise<string[]> =>
  writtenCharacterSchema
    .array()
    .parse(await readAllRows(page, WRITTEN_STORE))
    .map((row) => row.character)
    .toSorted((left, right) => left.localeCompare(right));

/** Ngày ôn cố định của thẻ nạp sẵn (epoch ms, 2026-11-23 00:00 UTC). */
export const SEED_DUE = Date.UTC(2026, 10, 23);
/** Thẻ "đã ôn một lần": ôn hôm trước, ngày ôn tiếp theo cách 3 ngày. */
export const REVIEWED_ONCE_LAST_REVIEW = Date.UTC(2026, 10, 22);
export const REVIEWED_ONCE_DUE = Date.UTC(2026, 10, 25);

/** Thẻ "mới" như khi người học vừa xong bài chứa từ. */
export const newCard = (
  wordId: string,
  facet: CardFacet,
  due: number = SEED_DUE,
): ReviewCard => ({
  wordId,
  facet,
  state: 'new',
  due,
  stability: 0,
  difficulty: 0,
  elapsedDays: 0,
  scheduledDays: 0,
  learningSteps: 0,
  reps: 0,
  lapses: 0,
});

/** Thẻ "đã ôn một lần": trạng thái `review`, ngày ôn tiếp theo cố định, khác thẻ mới. */
export const reviewedOnceCard = (
  wordId: string,
  facet: CardFacet,
): ReviewCard => ({
  ...newCard(wordId, facet, REVIEWED_ONCE_DUE),
  state: 'review',
  stability: 3.17,
  difficulty: 5.28,
  scheduledDays: 3,
  reps: 1,
  lastReview: REVIEWED_ONCE_LAST_REVIEW,
});

export interface ReviewProgressSeed {
  lessonProgress?: readonly { lessonId: string; status: string }[];
  cards?: readonly ReviewCard[];
  writtenCharacters?: readonly string[];
}

const hasCardsStore = (page: Page): Promise<boolean> =>
  page.evaluate(
    ({ dbName, name }) =>
      new Promise<boolean>((resolve) => {
        const request = indexedDB.open(dbName);
        request.onsuccess = () => {
          const db = request.result;
          const isReady = db.objectStoreNames.contains(name);
          db.close();
          resolve(isReady);
        };
        request.onerror = () => resolve(false);
      }),
    { dbName: DB_NAME, name: CARDS_STORE },
  );

/**
 * Nạp sẵn: mở app một lần (Dexie tạo version 4 có bảng `cards`, `writtenCharacters`), ghi thô
 * `hasCompletedOnboarding`, tiến độ bài, thẻ, chữ đã viết, rồi tải lại để app đọc từ đầu.
 */
export const seedReviewProgress = async (
  page: Page,
  seed: ReviewProgressSeed = {},
): Promise<void> => {
  await page.goto('/');
  await expect.poll(() => hasCardsStore(page)).toBe(true);
  await page.evaluate(
    ({ dbName, progressRows, cardRows, writtenRows }) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open(dbName);
        request.onerror = () => reject(new Error('Không mở được IndexedDB.'));
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(
            ['settings', 'lessonProgress', 'cards', 'writtenCharacters'],
            'readwrite',
          );
          transaction
            .objectStore('settings')
            .put({ key: 'hasCompletedOnboarding', value: true });
          const progress = transaction.objectStore('lessonProgress');
          progressRows.forEach((row) => progress.put(row));
          const cards = transaction.objectStore('cards');
          cardRows.forEach((row) => cards.put(row));
          const written = transaction.objectStore('writtenCharacters');
          writtenRows.forEach((row) => written.put(row));
          transaction.oncomplete = () => {
            db.close();
            resolve();
          };
          transaction.onerror = () => {
            db.close();
            reject(new Error('Không ghi được dữ liệu nạp sẵn.'));
          };
        };
      }),
    {
      dbName: DB_NAME,
      progressRows: [...(seed.lessonProgress ?? [])],
      cardRows: (seed.cards ?? []).map((card) => ({
        ...card,
        id: reviewCardId(card.wordId, card.facet),
      })),
      writtenRows: (seed.writtenCharacters ?? []).map((character) => ({
        character,
      })),
    },
  );
  await page.reload();
};

export type ReviewTable = 'cards' | 'writtenCharacters';
/** "Lỗi lưu": chặn cả ghi chữ đã viết và thẻ. */
export const BREAK_ALL_REVIEW_WRITES: readonly ReviewTable[] = [
  'cards',
  'writtenCharacters',
];
/** "Lỗi lưu thẻ": chỉ chặn ghi thẻ. */
export const BREAK_CARD_WRITES: readonly ReviewTable[] = ['cards'];

const BREAK_REVIEW_WRITES_KEY = 'csk-e2e-break-review-writes';

declare global {
  interface Window {
    cskReviewWriteGuardInstalled?: boolean;
  }
}

/**
 * Bọc `put`/`add` của `IDBObjectStore.prototype` (mẫu `breakLessonProgressWrites`): ghi bảng có tên
 * trong danh sách lưu ở `sessionStorage` thì throw `UnknownError`.
 */
const installReviewWriteGuard = (key: string): void => {
  if (window.cskReviewWriteGuardInstalled === true) {
    return;
  }
  window.cskReviewWriteGuardInstalled = true;
  const isBroken = (storeName: string): boolean => {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(key) ?? '[]');
    return Array.isArray(parsed) && parsed.includes(storeName);
  };
  ['put', 'add'].forEach((methodName) => {
    const original: unknown = Reflect.get(IDBObjectStore.prototype, methodName);
    if (typeof original !== 'function') {
      return;
    }
    Reflect.set(
      IDBObjectStore.prototype,
      methodName,
      function guarded(this: IDBObjectStore, ...args: unknown[]): unknown {
        if (isBroken(this.name)) {
          throw new DOMException(`E2E: ghi ${this.name} lỗi`, 'UnknownError');
        }
        return Reflect.apply(original, this, args);
      },
    );
  });
};

/** Từ giờ mọi lần ghi các bảng `tables` đều lỗi (kể cả sau khi tải lại trang). */
export const breakReviewWrites = async (
  page: Page,
  tables: readonly ReviewTable[],
): Promise<void> => {
  await page.addInitScript(installReviewWriteGuard, BREAK_REVIEW_WRITES_KEY);
  await page.evaluate(installReviewWriteGuard, BREAK_REVIEW_WRITES_KEY);
  await page.evaluate(
    ({ key, value }) => {
      sessionStorage.setItem(key, value);
    },
    { key: BREAK_REVIEW_WRITES_KEY, value: JSON.stringify(tables) },
  );
};

/** Ghi thẻ / chữ đã viết chạy lại bình thường. */
export const restoreReviewWrites = async (page: Page): Promise<void> => {
  await page.evaluate((key) => {
    sessionStorage.removeItem(key);
  }, BREAK_REVIEW_WRITES_KEY);
};
