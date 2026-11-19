/** Helper e2e của mục Sao lưu tiến độ S8.5 (design D10). */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import {
  expect,
  type Download,
  type Locator,
  type Page,
} from '@playwright/test';

export const BACKUP_SECTION_TITLE = 'Sao lưu tiến độ';
export const EXPORT_LABEL = 'Xuất tiến độ';
export const IMPORT_LABEL = 'Nhập tiến độ';
export const EXPORTED_MESSAGE = 'Đã xuất tiến độ.';
export const EXPORT_FAILED_MESSAGE = 'Không xuất được tiến độ. Hãy thử lại.';
export const NOT_BACKUP_MESSAGE =
  'File này không phải file tiến độ của Tranie Chinese.';
export const CORRUPTED_MESSAGE = 'File tiến độ bị hỏng, không nhập được.';
export const IMPORTED_MESSAGE = 'Đã nhập tiến độ.';
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
export const importFile = async (page: Page, path: string): Promise<void> => {
  await backupSection(page).locator('input[type="file"]').setInputFiles(path);
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
