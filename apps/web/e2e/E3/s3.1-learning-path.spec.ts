import { expect, test } from '@playwright/test';

test.describe('S3.1 Bản đồ lộ trình', () => {
  test('S3.1-AC1: mở bản đồ lộ trình trong app thật', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Bắt đầu' }).click();
    await page.getByRole('button', { name: 'Tiếp tục' }).click();
    await page.getByRole('button', { name: /Bỏ qua|Vào học/ }).click();
    await expect(page).toHaveURL(/\/lessons\/intro-01$/);

    await page.goto('/learning-paths');

    await expect(
      page.getByRole('heading', { level: 2, name: 'Nhập môn' }),
    ).toBeVisible();
    const firstLesson = page.getByRole('link', { name: /Bốn thanh điệu/ });
    await expect(firstLesson).toContainText('Đang mở');

    await firstLesson.click();
    await expect(page).toHaveURL(/\/lessons\/intro-01$/);
  });
});
