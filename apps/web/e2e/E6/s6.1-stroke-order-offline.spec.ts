import { expect, test, type Page } from '@playwright/test';

import { strokeOrderPath, strokePollTimeout } from './stroke-order.helpers';

const UNAVAILABLE_MESSAGE = 'Chưa có dữ liệu nét cho chữ này.';
const ERROR_MESSAGE = 'Có lỗi xảy ra';

/**
 * Mở app (trang chủ) một lần có mạng và chờ service worker nắm trang, theo mẫu
 * `e2e/E1/s1.2-offline.spec.ts`. Không mở màn nét ở đây: dữ liệu nét phải có sẵn
 * từ precache chứ không nhờ lần xem trước.
 */
const openOnceWithServiceWorker = async (page: Page): Promise<void> => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
};

test.describe('S6.1 Xem thứ tự nét khi không có mạng', () => {
  test('TC-S6.1-AC1-29: S6.1-AC1 Xem animation khi offline — chữ 人 phát đủ 2 nét', async ({
    page,
    context,
  }) => {
    await openOnceWithServiceWorker(page);

    await context.setOffline(true);
    await page.goto(strokeOrderPath('人'));

    const figure = page.getByRole('img', { name: 'Thứ tự nét chữ 人' });
    await expect(figure).toBeVisible();
    await expect
      .poll(() => figure.getAttribute('data-drawn-stroke-count'), {
        timeout: strokePollTimeout(2),
      })
      .toBe('2');
    await expect(page.getByText(ERROR_MESSAGE)).toHaveCount(0);
    await expect(page.getByText(UNAVAILABLE_MESSAGE)).toHaveCount(0);
  });
});
