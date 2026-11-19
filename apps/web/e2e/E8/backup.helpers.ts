/** Helper e2e của mục Sao lưu tiến độ S8.5 (design D10). */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import {
  expect,
  type Download,
  type Locator,
  type Page,
  type Route,
} from '@playwright/test';

import { INTRO_LESSON_IDS } from '../E7/intro-lessons.helpers';

export const BACKUP_SECTION_TITLE = 'Sao lưu tiến độ';
export const EXPORT_LABEL = 'Xuất tiến độ';
export const IMPORT_LABEL = 'Nhập tiến độ';
export const EXPORTED_MESSAGE = 'Đã xuất tiến độ.';
export const EXPORT_FAILED_MESSAGE = 'Không xuất được tiến độ. Hãy thử lại.';
export const NOT_BACKUP_MESSAGE =
  'File này không phải file tiến độ của Tranie Chinese.';
export const CORRUPTED_MESSAGE = 'File tiến độ bị hỏng, không nhập được.';
export const NEWER_VERSION_MESSAGE =
  'File này được tạo từ phiên bản app mới hơn. Hãy cập nhật app rồi thử lại.';
export const IMPORTED_MESSAGE = 'Đã nhập tiến độ.';
export const IMPORT_FAILED_MESSAGE =
  'Không nhập được tiến độ. Tiến độ trên máy vẫn giữ nguyên.';
export const CONFIRM_WARNING =
  'Toàn bộ tiến độ hiện có trên máy này sẽ bị thay bằng tiến độ trong file. Không hoàn tác được.';
export const OVERWRITE_LABEL = 'Ghi đè';
export const CANCEL_LABEL = 'Hủy';

/** File mẫu nằm ở `e2e/E8/fixtures/progress-backup/` (design D10). */
export type BackupFixture =
  | 'hop-le-5-bai.json'
  | 'hop-le-3-bai-15-phut.json'
  | 'bai-la.json'
  | 'trang-thai-sai.json'
  | 'muc-tieu-45.json'
  | 'rong.json'
  | 'json-noi-khac.json'
  | 'ban-moi-hon.json'
  | 'anh.png';

/** Đường dẫn tuyệt đối của file mẫu `name`. */
export const fixturePath = (name: BackupFixture): string =>
  fileURLToPath(new URL(`./fixtures/progress-backup/${name}`, import.meta.url));

/** Tên file xuất theo ngày `YYYY-MM-DD` ở múi giờ của máy. */
export const backupFileName = (dateKey: string): string =>
  `tranie-tien-do-${dateKey}.json`;

export const backupSection = (page: Page): Locator =>
  page.getByRole('region', { name: BACKUP_SECTION_TITLE });

export const exportButton = (page: Page): Locator =>
  backupSection(page).getByRole('button', { name: EXPORT_LABEL, exact: true });

export const importButton = (page: Page): Locator =>
  backupSection(page).getByRole('button', { name: IMPORT_LABEL, exact: true });

export const backupStatus = (page: Page): Locator =>
  backupSection(page).getByRole('status');

export const backupAlert = (page: Page): Locator =>
  backupSection(page).getByRole('alert');

export const importConfirmDialog = (page: Page): Locator =>
  page.getByRole('dialog');

export const overwriteButton = (page: Page): Locator =>
  importConfirmDialog(page).getByRole('button', {
    name: OVERWRITE_LABEL,
    exact: true,
  });

export const cancelButton = (page: Page): Locator =>
  importConfirmDialog(page).getByRole('button', {
    name: CANCEL_LABEL,
    exact: true,
  });

/**
 * Chọn file `path` cho "Nhập tiến độ": gắn file thẳng vào ô chọn file (ẩn) của mục, giống người
 * học chọn file trong hộp chọn file của máy (không mở được hộp đó trong Playwright).
 */
export const importFile = async (
  page: Page,
  file: string | { name: string; mimeType: string; buffer: Buffer },
): Promise<void> => {
  await backupSection(page).locator('input[type="file"]').setInputFiles(file);
};

/** Bấm "Xuất tiến độ" và chờ trình duyệt nhận file tải về. */
export const exportProgress = async (page: Page): Promise<Download> => {
  const downloadPromise = page.waitForEvent('download');
  await exportButton(page).click();
  return downloadPromise;
};

/** Lần tải đầu chưa được service worker điều khiển: tải lại để SW nắm trang (mẫu S1.2). */
export const openOnceWithServiceWorker = async (page: Page): Promise<void> => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
};

/** Nội dung chữ của file vừa tải về (như mở file bằng trình soạn thảo). */
export const readDownloadText = async (download: Download): Promise<string> =>
  readFile(await download.path(), 'utf8');

/**
 * `target` nằm trong vùng trình đọc màn hình đọc tự động khi đổi nội dung: tổ tiên gần nhất có
 * `role="status"`/`role="alert"` (live region ngầm định) hoặc `aria-live` khác `off`.
 */
export const expectInLiveRegion = async (target: Locator): Promise<void> => {
  const isLive = await target.evaluate(
    (element) =>
      element.closest(
        '[role="status"], [role="alert"], [aria-live]:not([aria-live="off"])',
      ) !== null,
  );
  expect(isLive).toBe(true);
};

const introLessonId = (index: number): string => INTRO_LESSON_IDS[index] ?? '';

/** Bài kiểm tra vượt cấp của chủ đề C (bài cuối của chủ đề, design D10). */
export const SKIP_AHEAD_TEST_LESSON_ID = introLessonId(5);

/** Chủ đề hai bài liền nhau, bắt đầu từ bài Nhập môn thứ `first` (0-based). */
const backupPathUnit = (id: string, title: string, first: number) => ({
  id,
  title,
  lessonIds: [introLessonId(first), introLessonId(first + 1)],
});

/**
 * Lộ trình 4 chủ đề dựng từ bài Nhập môn thật (design D10): A (bài 1, 2), B (bài 3, 4), C (bài 5, 6;
 * bài 6 là bài kiểm tra vượt cấp), D (bài 7, 8).
 */
const BACKUP_PATH_CONTENT_ROOT = {
  contentVersion: '0123456789ab',
  stages: [
    {
      id: 'intro',
      title: 'Nhập môn',
      units: [
        backupPathUnit('unit-a', 'Chủ đề A', 0),
        backupPathUnit('unit-b', 'Chủ đề B', 2),
        backupPathUnit('unit-c', 'Chủ đề C', 4),
        backupPathUnit('unit-d', 'Chủ đề D', 6),
      ],
    },
  ],
};

/**
 * Thay nội dung bằng lộ trình 4 chủ đề (mẫu `serveMultiUnitPath`). Cần `serviceWorkers: 'block'`:
 * page.route không chặn request do service worker phục vụ.
 */
export const serveBackupPath = async (page: Page): Promise<void> => {
  await page.route('**/content/content.json', (route: Route) =>
    route.fulfill({ json: BACKUP_PATH_CONTENT_ROOT }),
  );
  await page.route(
    `**/content/lessons/${SKIP_AHEAD_TEST_LESSON_ID}.json`,
    async (route) => {
      const response = await route.fetch();
      const lesson: unknown = await response.json();
      const json =
        typeof lesson === 'object' && lesson !== null
          ? { ...lesson, type: 'test' }
          : lesson;
      await route.fulfill({ response, json });
    },
  );
};

const BREAK_LESSON_PROGRESS_WRITES_FLAG =
  'csk-e2e-break-lesson-progress-writes';

declare global {
  interface Window {
    cskLessonProgressGuardInstalled?: boolean;
  }
}

/**
 * Bọc `put`/`add` của `IDBObjectStore.prototype` (mẫu guard của `settings.helpers.ts`): ghi bảng
 * `lessonProgress` thì throw `UnknownError` khi cờ trong `sessionStorage` bật. `clear` vẫn chạy,
 * nên lần ghi đè hỏng ở giữa transaction (sau khi đã xoá bảng và ghi cài đặt).
 */
const installLessonProgressWriteGuard = (flag: string): void => {
  if (window.cskLessonProgressGuardInstalled === true) {
    return;
  }
  window.cskLessonProgressGuardInstalled = true;
  ['put', 'add'].forEach((methodName) => {
    const original: unknown = Reflect.get(IDBObjectStore.prototype, methodName);
    if (typeof original !== 'function') {
      return;
    }
    Reflect.set(
      IDBObjectStore.prototype,
      methodName,
      function guarded(this: IDBObjectStore, ...args: unknown[]): unknown {
        if (
          this.name === 'lessonProgress' &&
          sessionStorage.getItem(flag) === 'on'
        ) {
          throw new DOMException('E2E: ghi lessonProgress lỗi', 'UnknownError');
        }
        return Reflect.apply(original, this, args);
      },
    );
  });
};

/** Từ giờ mọi lần ghi bảng `lessonProgress` đều lỗi (kể cả sau khi tải lại trang). */
export const breakLessonProgressWrites = async (page: Page): Promise<void> => {
  await page.addInitScript(
    installLessonProgressWriteGuard,
    BREAK_LESSON_PROGRESS_WRITES_FLAG,
  );
  await page.evaluate(
    installLessonProgressWriteGuard,
    BREAK_LESSON_PROGRESS_WRITES_FLAG,
  );
  await page.evaluate((key) => {
    sessionStorage.setItem(key, 'on');
  }, BREAK_LESSON_PROGRESS_WRITES_FLAG);
};
