/** Helper e2e của Trang chủ S8.1 (design mục Test). */
import {
  expect,
  type BrowserContext,
  type Locator,
  type Page,
} from '@playwright/test';

import {
  answerCurrentQuestion,
  INTRO_LESSON_IDS,
  INTRO_LESSON_TITLES,
} from '../E7/intro-lessons.helpers';

export const HOME_URL = /\/home$/;
export const HOME_TITLE = 'Trang chủ';
export const START_LESSON_LABEL = 'Vào học';
export const LEARNING_PATH_LINK_LABEL = 'Xem lộ trình';
export const GOAL_REACHED_TEXT = 'Đã đạt mục tiêu hôm nay';
export const ALL_COMPLETED_TEXT = 'Bạn đã học xong lộ trình hiện có.';

/** Mốc giờ máy dựng theo múi giờ cố định để khóa ngày `dailyStats` không phụ thuộc máy chạy. */
export const TIMEZONE = 'Asia/Ho_Chi_Minh';
export const NOW = new Date('2026-11-18T10:00:00+07:00');
export const TODAY = '2026-11-18';
export const YESTERDAY = '2026-11-17';

export const SECOND = 1_000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;

export const lessonId = (index: number): string =>
  INTRO_LESSON_IDS[index] ?? '';
export const lessonTitle = (index: number): string =>
  INTRO_LESSON_TITLES[index] ?? '';

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

/** "Hôm nay: X / Y phút" hiện đúng `minutes` phút với mục tiêu `goal` phút. */
export const expectTodayMinutes = async (
  page: Page,
  minutes: number,
  goal: DailyGoal = 15,
): Promise<void> => {
  await expect(todayStudyText(page)).toHaveText(
    `Hôm nay: ${minutes} / ${goal} phút`,
  );
};

/** Cho đồng hồ giả chạy tới `target` (interval của trang vẫn chạy đủ từng lần). */
export const runClockUntil = async (
  page: Page,
  target: Date,
): Promise<void> => {
  const now = await page.evaluate(() => Date.now());
  await page.clock.runFor(Math.max(0, target.getTime() - now));
};

/** Trả lời `count` câu đầu, chờ thanh tiến độ sang câu kế tiếp sau mỗi câu. */
export const answerQuestions = async (
  page: Page,
  count: number,
): Promise<void> => {
  for (let index = 1; index <= count; index += 1) {
    await answerCurrentQuestion(page);
    await expect(lessonProgress(page)).toHaveAccessibleName(
      new RegExp(`^Câu ${index + 1} /`),
    );
  }
};

/** Trả lời mọi câu tới màn tổng kết (có liên kết "Trang chủ"). */
export const finishLesson = async (page: Page): Promise<void> => {
  const summaryHomeLink = page.getByRole('link', { name: 'Trang chủ' });
  while (!(await summaryHomeLink.isVisible())) {
    await answerCurrentQuestion(page);
    await expect(lessonProgress(page).or(summaryHomeLink)).toBeVisible();
  }
};

export const expectHomeScreen = async (page: Page): Promise<void> => {
  await expect(page).toHaveURL(HOME_URL);
  await expect(homeHeading(page)).toBeVisible();
};

/** Bấm "Vào học" trên Trang chủ, chờ màn bài hiện. */
export const startLesson = async (page: Page): Promise<void> => {
  await startLessonLink(page).click();
  await expect(lessonProgress(page)).toBeVisible();
};

/** Rời màn bài bằng nút Quay lại của trình duyệt, về Trang chủ. */
export const leaveLessonToHome = async (page: Page): Promise<void> => {
  await page.goBack();
  await expectHomeScreen(page);
};

/** Ở màn bài `durationMs` (đồng hồ giả) rồi rời về Trang chủ. */
export const stayInLessonThenLeave = async (
  page: Page,
  durationMs: number,
): Promise<void> => {
  await page.clock.runFor(durationMs);
  await leaveLessonToHome(page);
};

export const GOAL_15: ProgressSeed = { settings: { dailyGoalMinutes: 15 } };

/** Mở Trang chủ (mục tiêu 15 phút, hôm nay chưa học) rồi bấm "Vào học". */
export const openHomeThenStartLesson = async (page: Page): Promise<void> => {
  await seedProgress(page, GOAL_15);
  await page.goto('/');
  await expectHomeScreen(page);
  await startLesson(page);
};

/** Mở lại app trong cùng trình duyệt (cùng IndexedDB): vào Trang chủ. */
export const reopenApp = async (context: BrowserContext): Promise<Page> => {
  const reopened = await context.newPage();
  await reopened.goto('/');
  await expectHomeScreen(reopened);
  return reopened;
};
