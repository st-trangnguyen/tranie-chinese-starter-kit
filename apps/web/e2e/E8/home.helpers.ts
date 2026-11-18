/** Helper e2e của Trang chủ S8.1 (design mục Test). */
import { expect, type Locator, type Page } from '@playwright/test';

export const HOME_URL = /\/home$/;
export const HOME_TITLE = 'Trang chủ';
export const START_LESSON_LABEL = 'Vào học';
export const LEARNING_PATH_LINK_LABEL = 'Xem lộ trình';
export const GOAL_REACHED_TEXT = 'Đã đạt mục tiêu hôm nay';
export const ALL_COMPLETED_TEXT = 'Bạn đã học xong lộ trình hiện có.';

const DB_NAME = 'tranie-chinese';
/** Bảng mới nhất của DB (version 3): có bảng này thì app đã tạo xong schema. */
const LATEST_STORE = 'dailyStats';

export type DailyGoal = 15 | 30 | 60;

/** Làm onboarding qua giao diện như người học mới, chọn mục tiêu `goal` phút mỗi ngày. */
export const completeOnboarding = async (
  page: Page,
  goal: DailyGoal,
): Promise<void> => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Bắt đầu' }).click();
  await page.getByRole('radio', { name: new RegExp(`^${goal} phút`) }).check();
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await page.getByRole('button', { name: /Bỏ qua|Vào học/ }).click();
};

/** Dòng thô ghi thẳng vào IndexedDB; giá trị có thể hỏng (`unknown`) để thử dữ liệu lưu không đọc được. */
export interface LessonProgressSeed {
  lessonId: string;
  [field: string]: unknown;
}

export interface DailyStatSeed {
  date: string;
  [field: string]: unknown;
}

export interface ProgressSeed {
  /** Gộp vào `{ hasCompletedOnboarding: true }`. */
  settings?: Record<string, unknown>;
  lessonProgress?: readonly LessonProgressSeed[];
  dailyStats?: readonly DailyStatSeed[];
}

const isDatabaseReady = (page: Page): Promise<boolean> =>
  page.evaluate(
    ({ dbName, storeName }) =>
      new Promise<boolean>((resolve) => {
        const request = indexedDB.open(dbName);
        request.onsuccess = () => {
          const db = request.result;
          const isReady = db.objectStoreNames.contains(storeName);
          db.close();
          resolve(isReady);
        };
        request.onerror = () => resolve(false);
      }),
    { dbName: DB_NAME, storeName: LATEST_STORE },
  );

/**
 * Dữ liệu tạo sẵn: mở app một lần (app tạo DB version 3), ghi `settings`, `lessonProgress`,
 * `dailyStats` bằng API IndexedDB thô, rồi tải lại để app đọc từ đầu.
 */
export const seedProgress = async (
  page: Page,
  seed: ProgressSeed = {},
): Promise<void> => {
  await page.goto('/');
  await expect.poll(() => isDatabaseReady(page)).toBe(true);

  const settings = { hasCompletedOnboarding: true, ...seed.settings };
  await page.evaluate(
    ({ dbName, settingRows, progressRows, statRows }) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open(dbName);
        request.onerror = () => reject(new Error('Không mở được IndexedDB.'));
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(
            ['settings', 'lessonProgress', 'dailyStats'],
            'readwrite',
          );
          const settingStore = transaction.objectStore('settings');
          settingRows.forEach(([key, value]) =>
            settingStore.put({ key, value }),
          );
          const progressStore = transaction.objectStore('lessonProgress');
          progressRows.forEach((row) => progressStore.put(row));
          const statStore = transaction.objectStore('dailyStats');
          statRows.forEach((row) => statStore.put(row));
          transaction.oncomplete = () => {
            db.close();
            resolve();
          };
          transaction.onerror = () => {
            db.close();
            reject(new Error('Không ghi được dữ liệu tạo sẵn.'));
          };
        };
      }),
    {
      dbName: DB_NAME,
      settingRows: Object.entries(settings),
      progressRows: [...(seed.lessonProgress ?? [])],
      statRows: [...(seed.dailyStats ?? [])],
    },
  );
  await page.reload();
};

export const completedLessons = (
  lessonIds: readonly string[],
): LessonProgressSeed[] =>
  lessonIds.map((lessonId) => ({ lessonId, status: 'completed' }));

declare global {
  interface Window {
    cskVisibilityHidden?: boolean;
  }
}

/**
 * Giả lập trang bị ẩn/hiện lại (Chromium headless không tự ẩn tab): định nghĩa lại getter
 * `document.visibilityState`/`document.hidden` rồi phát `visibilitychange`.
 */
export const setPageVisibility = async (
  page: Page,
  hidden: boolean,
): Promise<void> => {
  await page.evaluate((isHidden) => {
    window.cskVisibilityHidden = isHidden;
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => (window.cskVisibilityHidden === true ? 'hidden' : 'visible'),
    });
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => window.cskVisibilityHidden === true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);
};

/** Dòng "Hôm nay: X / Y phút" trên Trang chủ. */
export const todayStudyText = (page: Page): Locator =>
  page.getByText(/^Hôm nay: \d+ \/ \d+ phút$/);

export const homeHeading = (page: Page): Locator =>
  page.getByRole('heading', { level: 1, name: HOME_TITLE });

export const startLessonLink = (page: Page): Locator =>
  page.getByRole('link', { name: START_LESSON_LABEL });

export const learningPathLink = (page: Page): Locator =>
  page.getByRole('link', { name: LEARNING_PATH_LINK_LABEL });

/** Thẻ "Bài tiếp theo" trên Trang chủ. */
export const nextLessonCard = (page: Page): Locator =>
  page.locator('section', {
    has: page.getByRole('heading', { name: 'Bài tiếp theo' }),
  });

/** Thanh tiến độ "Câu k / n" của màn bài. */
export const lessonProgress = (page: Page): Locator =>
  page.getByRole('progressbar', { name: /^Câu \d+ \/ \d+$/ });
