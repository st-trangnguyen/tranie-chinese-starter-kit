import { expect, test } from '@playwright/test';

test.describe('S1.2 Mở app khi không có mạng', () => {
  test('đã mở một lần thì tắt mạng vẫn vào được app', async ({
    page,
    context,
  }) => {
    await page.goto('/');
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    // Lần tải đầu chưa được service worker điều khiển: tải lại để SW nắm trang.
    await page.reload();
    await expect
      .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
      .toBe(true);

    await context.setOffline(true);
    await page.reload();

    await expect(page.getByRole('button', { name: 'Bắt đầu' })).toBeVisible();
    await page.goto('/lesson/intro-01');
    await expect(
      page.getByRole('heading', { name: 'Bài intro-01' }),
    ).toBeVisible();
  });
});
