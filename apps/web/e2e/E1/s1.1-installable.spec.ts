import { expect, test } from '@playwright/test';

test.describe('S1.1 Cài app lên màn hình chính', () => {
  test('manifest đủ điều kiện installable', async ({ page, request }) => {
    await page.goto('/');
    const href = await page
      .locator('link[rel="manifest"]')
      .getAttribute('href');
    expect(href).toBeTruthy();

    const manifest = await (
      await request.get(new URL(href ?? '', page.url()).toString())
    ).json();
    expect(manifest).toMatchObject({
      name: 'Tranie Chinese',
      short_name: 'Tranie',
      display: 'standalone',
      start_url: '/',
    });
    const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
    expect(sizes).toEqual(expect.arrayContaining(['192x192', '512x512']));
    expect(
      manifest.icons.some(
        (icon: { purpose?: string }) => icon.purpose === 'maskable',
      ),
    ).toBe(true);

    for (const icon of manifest.icons) {
      const response = await request.get(
        new URL(icon.src, page.url()).toString(),
      );
      expect(response.ok(), icon.src).toBe(true);
    }
  });

  test('service worker được kích hoạt', async ({ page }) => {
    await page.goto('/');
    const scope = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      return registration.scope;
    });
    expect(scope).toMatch(/\/$/);
  });
});
