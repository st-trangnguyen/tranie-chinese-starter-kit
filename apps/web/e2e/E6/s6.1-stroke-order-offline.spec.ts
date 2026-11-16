import { readFileSync } from 'node:fs';

import { strokeDataSchema, strokeIndexSchema } from '@csk/shared';
import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from '@playwright/test';

import { strokeOrderPath, strokePollTimeout } from './stroke-order.helpers';

const UNAVAILABLE_MESSAGE = 'Chưa có dữ liệu nét cho chữ này.';
const ERROR_MESSAGE = 'Có lỗi xảy ra';

/**
 * TC-S6.1-AC1-37: danh sách chữ lấy từ dữ liệu nét của dự án lúc nạp file (không ghi cố
 * định); test chặn lệch bên dưới bảo đảm bản build phục vụ đúng danh sách này.
 */
const STROKE_CHARACTERS = strokeIndexSchema.parse(
  JSON.parse(
    readFileSync(
      new URL('../../src/assets/content/strokes/index.json', import.meta.url),
      'utf-8',
    ),
  ),
);

const strokeFilePath = (character: string): string =>
  `/content/strokes/${encodeURIComponent(character)}.json`;

/** Số nét của chữ theo file nét của bản build (gọi khi còn mạng, không qua trang). */
const readBuildStrokeCount = async (
  request: APIRequestContext,
  character: string,
): Promise<number> => {
  const response = await request.get(strokeFilePath(character));
  expect(response.ok()).toBe(true);
  return strokeDataSchema.parse(await response.json()).strokes.length;
};

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

  test('TC-S6.1-AC1-38: S6.1-AC1 Chữ không có dữ liệu nét khi offline — 龘 hiện thông báo, không lỗi', async ({
    page,
    context,
  }) => {
    await openOnceWithServiceWorker(page);

    await context.setOffline(true);
    await page.goto(strokeOrderPath('龘'));

    await expect(page.getByText(UNAVAILABLE_MESSAGE)).toBeVisible();
    await expect(page.getByText(ERROR_MESSAGE)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Thử lại' })).toHaveCount(0);
    await expect(page.getByRole('img', { name: /Thứ tự nét chữ/ })).toHaveCount(
      0,
    );
    await expect(page.getByRole('button', { name: 'Phát lại' })).toHaveCount(0);
  });

  test('TC-S6.1-AC1-37: danh sách chữ có dữ liệu nét của bản build khớp dữ liệu nét của dự án', async ({
    request,
  }) => {
    const response = await request.get('/content/strokes/index.json');
    expect(response.ok()).toBe(true);
    expect(strokeIndexSchema.parse(await response.json())).toEqual(
      STROKE_CHARACTERS,
    );
  });

  for (const character of STROKE_CHARACTERS) {
    test(`TC-S6.1-AC1-37: S6.1-AC1 Mọi chữ có dữ liệu nét đều xem được khi offline — chữ ${character}`, async ({
      page,
      context,
      request,
    }) => {
      const strokeCount = await readBuildStrokeCount(request, character);

      await openOnceWithServiceWorker(page);

      await context.setOffline(true);
      await page.goto(strokeOrderPath(character));

      const figure = page.getByRole('img', {
        name: `Thứ tự nét chữ ${character}`,
      });
      await expect(figure).toBeVisible();
      await expect
        .poll(() => figure.getAttribute('data-drawn-stroke-count'), {
          timeout: strokePollTimeout(strokeCount),
        })
        .toBe(String(strokeCount));
      await expect(page.getByText(ERROR_MESSAGE)).toHaveCount(0);
      await expect(page.getByText(UNAVAILABLE_MESSAGE)).toHaveCount(0);
    });
  }
});
