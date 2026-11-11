import { expect, test, type Page } from '@playwright/test';

import { OFFLINE_FIXTURE_PATHS } from '../fixtures/offlineFixturesPlugin';

/** Lần tải đầu chưa được service worker điều khiển: tải lại để SW nắm trang. */
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

test.describe('S1.2 Mở app khi không có mạng', () => {
  test('đã mở một lần thì tắt mạng vẫn vào được app', async ({
    page,
    context,
  }) => {
    await openOnceWithServiceWorker(page);

    await context.setOffline(true);
    await page.reload();

    await expect(page.getByRole('button', { name: 'Bắt đầu' })).toBeVisible();
    await page.goto('/lessons/intro-01');
    await expect(
      page.getByRole('heading', { name: 'Bốn thanh điệu' }),
    ).toBeVisible();
  });

  test('offline vẫn tải được nội dung và phát được audio đã precache', async ({
    page,
    context,
  }) => {
    await openOnceWithServiceWorker(page);
    await context.setOffline(true);

    const result = await page.evaluate(
      async ({ contentPath, audioPath }) => {
        const contentResponse = await fetch(`/${contentPath}`);
        const lesson: unknown = await contentResponse.json();
        const audioResponse = await fetch(`/${audioPath}`);
        const audioBuffer = await new AudioContext().decodeAudioData(
          await audioResponse.arrayBuffer(),
        );
        return {
          isContentOk: contentResponse.ok,
          lesson,
          isAudioOk: audioResponse.ok,
          audioSeconds: audioBuffer.duration,
        };
      },
      {
        contentPath: OFFLINE_FIXTURE_PATHS.content,
        audioPath: OFFLINE_FIXTURE_PATHS.audio,
      },
    );

    expect(result.isContentOk).toBe(true);
    expect(result.lesson).toMatchObject({ id: 'e2e-offline' });
    expect(result.isAudioOk).toBe(true);
    expect(result.audioSeconds).toBeGreaterThan(0.5);
  });
});
