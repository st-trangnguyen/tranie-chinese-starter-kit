/** Helper e2e của mục Sao lưu tiến độ S8.5 (design D10). */
import {
  expect,
  type Download,
  type Locator,
  type Page,
} from '@playwright/test';

export const BACKUP_SECTION_TITLE = 'Sao lưu tiến độ';
export const EXPORT_LABEL = 'Xuất tiến độ';
export const EXPORTED_MESSAGE = 'Đã xuất tiến độ.';

/** Tên file xuất theo ngày `YYYY-MM-DD` ở múi giờ của máy. */
export const backupFileName = (dateKey: string): string =>
  `tranie-tien-do-${dateKey}.json`;

export const backupSection = (page: Page): Locator =>
  page.getByRole('region', { name: BACKUP_SECTION_TITLE });

export const exportButton = (page: Page): Locator =>
  backupSection(page).getByRole('button', { name: EXPORT_LABEL, exact: true });

export const backupStatus = (page: Page): Locator =>
  backupSection(page).getByRole('status');

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
