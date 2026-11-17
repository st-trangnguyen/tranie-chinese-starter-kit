import { expect, test, type Page } from '@playwright/test';

import {
  UNAVAILABLE_MESSAGE,
  openWritingPractice,
  outlineStrokes,
  readBuiltStrokes,
  writingPad,
} from './writing-practice.helpers';

/**
 * Mở app (trang chủ) một lần có mạng và chờ service worker nắm trang, theo mẫu
 * `e2e/E1/s1.2-offline.spec.ts`. Không mở màn luyện viết ở đây: dữ liệu nét phải có sẵn
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

test.describe('S6.2 Luyện viết khi không có mạng', () => {
  test('TC-S6.2-AC1-4: S6.2-AC1 Hiện khung viết có nét mờ của cả chữ khi offline — 人 có đủ 2 nét mờ', async ({
    page,
    context,
  }) => {
    const strokes = await readBuiltStrokes(page, '人');
    expect(strokes).toHaveLength(2);

    await openOnceWithServiceWorker(page);

    await context.setOffline(true);
    await openWritingPractice(page, '人');

    const pad = writingPad(page, '人');
    await expect(pad).toBeVisible();
    await expect(outlineStrokes(pad)).toHaveCount(2);
    for (const [index, stroke] of strokes.entries()) {
      await expect(outlineStrokes(pad).nth(index)).toHaveAttribute('d', stroke);
    }
    await expect(page.getByText(UNAVAILABLE_MESSAGE)).toHaveCount(0);
  });
});
