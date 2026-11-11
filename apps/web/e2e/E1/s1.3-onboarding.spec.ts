import { expect, test } from '@playwright/test';

test.describe('S1.3 Chọn mục tiêu mỗi ngày khi mở lần đầu', () => {
  test('onboarding một lần rồi vào thẳng bài 1', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/onboarding$/);
    await page.getByRole('button', { name: 'Bắt đầu' }).click();
    await page.getByRole('radio', { name: /30 phút/ }).check();
    await page.getByRole('button', { name: 'Tiếp tục' }).click();

    await expect(
      page.getByRole('heading', { name: 'Cài app lên màn hình chính' }),
    ).toBeVisible();
    await page.getByRole('button', { name: /Bỏ qua|Vào học/ }).click();
    await expect(page).toHaveURL(/\/lessons\/intro-01$/);

    await page.goto('/');
    await expect(page).toHaveURL(/\/lessons\/intro-01$/);
    await page.goto('/onboarding');
    await expect(page).toHaveURL(/\/lessons\/intro-01$/);
  });
});
