import { expect, test, type Locator, type Page } from '@playwright/test';

declare global {
  interface Window {
    /** Các giá trị `data-drawn-stroke-count` đã đổi, ghi bởi MutationObserver của test. */
    strokeCountLog?: string[];
  }
}

const UNAVAILABLE_MESSAGE = 'Chưa có dữ liệu nét cho chữ này.';
const ERROR_MESSAGE = 'Có lỗi xảy ra';

/** hanzi-writer thật vẽ mỗi nét ~0,3–0,7 s: chờ theo số nét (design "Test"). */
const strokePollTimeout = (strokeCount: number): number =>
  5_000 + strokeCount * 1_000;

const strokeOrderPath = (character: string): string =>
  `/characters/${encodeURIComponent(character)}/stroke-order`;

const openStrokeOrder = async (
  page: Page,
  character: string,
): Promise<void> => {
  await page.goto(strokeOrderPath(character));
};

const strokeFigure = (page: Page, character: string): Locator =>
  page.getByRole('img', { name: `Thứ tự nét chữ ${character}` });

const anyStrokeFigure = (page: Page): Locator => page.locator('figure');

const replayButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Phát lại', exact: true });

/** Số nét đã vẽ (không tính chữ mờ nền), app ghi ở `data-drawn-stroke-count` của khối. */
const drawnStrokeCount = async (figure: Locator): Promise<number> =>
  Number(await figure.getAttribute('data-drawn-stroke-count'));

const expectDrawnStrokes = async (
  figure: Locator,
  strokeCount: number,
): Promise<void> => {
  await expect
    .poll(() => drawnStrokeCount(figure), {
      timeout: strokePollTimeout(strokeCount),
    })
    .toBe(strokeCount);
};

/** Ghi lại mọi lần số nét đã vẽ thay đổi từ thời điểm gọi. */
const startRecordingStrokeCounts = async (figure: Locator): Promise<void> => {
  await figure.evaluate((element) => {
    const counts: string[] = [];
    window.strokeCountLog = counts;
    new MutationObserver(() => {
      counts.push(element.getAttribute('data-drawn-stroke-count') ?? '');
    }).observe(element, {
      attributes: true,
      attributeFilter: ['data-drawn-stroke-count'],
    });
  });
};

const readRecordedStrokeCounts = (page: Page): Promise<string[]> =>
  page.evaluate(() => [...(window.strokeCountLog ?? [])]);

/** Bấm "Phát lại" rồi chờ lượt mới vẽ lại từ 0 đến đủ nét, tăng từng nét một. */
const replayAndExpectFullRun = async (
  page: Page,
  figure: Locator,
  strokeCount: number,
): Promise<void> => {
  await startRecordingStrokeCounts(figure);
  await replayButton(page).click();
  const fullRun = [
    '0',
    ...Array.from({ length: strokeCount }, (_, i) => `${i + 1}`),
  ];
  await expect
    .poll(() => readRecordedStrokeCounts(page), {
      timeout: strokePollTimeout(strokeCount),
    })
    .toEqual(fullRun);
};

const isStrokeFile = (url: URL, character: string): boolean =>
  decodeURIComponent(url.pathname) === `/content/strokes/${character}.json`;

const expectNoAnimation = async (page: Page): Promise<void> => {
  await expect(anyStrokeFigure(page)).toHaveCount(0);
  await expect(replayButton(page)).toHaveCount(0);
};

const expectUnavailable = async (page: Page): Promise<void> => {
  await expect(page.getByText(UNAVAILABLE_MESSAGE)).toBeVisible();
  await expectNoAnimation(page);
  await expect(page.getByText(ERROR_MESSAGE)).toHaveCount(0);
};

const expectLoadError = async (page: Page): Promise<void> => {
  await expect(page.getByRole('alert')).toHaveText(ERROR_MESSAGE);
  await expect(page.getByRole('button', { name: 'Thử lại' })).toBeVisible();
  await expectNoAnimation(page);
  await expect(page.getByText(UNAVAILABLE_MESSAGE)).toHaveCount(0);
};

test.describe('S6.1 Xem thứ tự nét', () => {
  test('TC-S6.1-AC1-2: S6.1-AC1 Chữ hiện animation và tự phát khi mở — 白 tự vẽ xong 5 nét không cần bấm', async ({
    page,
  }) => {
    await openStrokeOrder(page, '白');

    const figure = strokeFigure(page, '白');
    await expect(figure).toBeVisible();
    await expectDrawnStrokes(figure, 5);
  });

  test('TC-S6.1-AC1-10: S6.1-AC1 Số nét được vẽ bằng số nét của chữ — 白 xong có đúng 5 nét', async ({
    page,
  }) => {
    await openStrokeOrder(page, '白');

    const figure = strokeFigure(page, '白');
    await expectDrawnStrokes(figure, 5);
    await startRecordingStrokeCounts(figure);
    await page.waitForTimeout(2_000);
    expect(await readRecordedStrokeCounts(page)).toEqual([]);
    expect(await drawnStrokeCount(figure)).toBe(5);
  });

  test('TC-S6.1-AC1-11: S6.1-AC1 Số nét được vẽ bằng số nét của chữ — 好 xong có đúng 6 nét', async ({
    page,
  }) => {
    await openStrokeOrder(page, '好');

    const figure = strokeFigure(page, '好');
    await expectDrawnStrokes(figure, 6);
    await startRecordingStrokeCounts(figure);
    await page.waitForTimeout(2_000);
    expect(await readRecordedStrokeCounts(page)).toEqual([]);
    expect(await drawnStrokeCount(figure)).toBe(6);
  });

  test('TC-S6.1-AC1-12: S6.1-AC1 Animation chỉ tự phát một lần — 人 xong rồi 10 giây không phát lại', async ({
    page,
  }) => {
    await openStrokeOrder(page, '人');

    const figure = strokeFigure(page, '人');
    await expectDrawnStrokes(figure, 2);
    await startRecordingStrokeCounts(figure);
    await page.waitForTimeout(10_000);

    expect(await readRecordedStrokeCounts(page)).toEqual([]);
    expect(await drawnStrokeCount(figure)).toBe(2);
  });

  test('TC-S6.1-AC1-14: S6.1-AC1 Màn chỉ hiện một chữ — chỉ có khối của 好, không có nút chuyển chữ', async ({
    page,
  }) => {
    await openStrokeOrder(page, '好');

    await expect(strokeFigure(page, '好')).toBeVisible();
    await expect(anyStrokeFigure(page)).toHaveCount(1);
    await expect(page.getByRole('img', { name: /Thứ tự nét chữ/ })).toHaveCount(
      1,
    );
    const main = page.getByRole('main');
    await expect(main.getByRole('button')).toHaveCount(1);
    await expect(main.getByRole('button')).toHaveText('Phát lại');
    await expect(main.getByRole('link')).toHaveCount(0);
  });

  test('TC-S6.1-AC1-15: S6.1-AC1 Chữ không có dữ liệu nét — 龘 hiện thông báo, không animation', async ({
    page,
  }) => {
    await openStrokeOrder(page, '龘');

    await expectUnavailable(page);
  });

  test('TC-S6.1-AC1-18: S6.1-AC1 Chữ được yêu cầu rỗng — không chỉ định chữ hiện thông báo', async ({
    page,
  }) => {
    await page.goto('/characters/stroke-order');

    await expectUnavailable(page);
  });

  test('TC-S6.1-AC1-19: S6.1-AC1 Chữ được yêu cầu không phải chữ Hán — "abc" hiện thông báo', async ({
    page,
  }) => {
    await openStrokeOrder(page, 'abc');

    await expectUnavailable(page);
  });

  test('TC-S6.1-AC1-20: S6.1-AC1 Chữ được yêu cầu gồm nhiều chữ — "你好" hiện thông báo, không hiện riêng 你/好', async ({
    page,
  }) => {
    await openStrokeOrder(page, '你好');

    await expectUnavailable(page);
    const main = page.getByRole('main');
    await expect(main).not.toContainText('你');
    await expect(main).not.toContainText('好');
  });

  test('TC-S6.1-AC1-31: S6.1-AC1 Giảm chuyển động hiện thứ tự nét tĩnh — 白 hiện ngay 5 nét đánh số 1…5', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStrokeOrder(page, '白');

    const figure = strokeFigure(page, '白');
    await expect(figure).toBeVisible();
    await expect(figure.locator('text')).toHaveText(['1', '2', '3', '4', '5']);
    await expect(figure.locator('path')).toHaveCount(5);
    await expect(replayButton(page)).toHaveCount(0);
  });

  test('TC-S6.1-AC1-35: S6.1-AC1 Đổi giảm chuyển động khi đang ở màn — giữ animation tới khi mở lại màn', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await openStrokeOrder(page, '人');

    const figure = strokeFigure(page, '人');
    await expect(figure).toBeVisible();
    await expect(replayButton(page)).toBeVisible();

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expectDrawnStrokes(figure, 2);
    await expect(replayButton(page)).toBeVisible();
    await expect(figure.locator('text')).toHaveCount(0);

    await page.reload();

    const reopenedFigure = strokeFigure(page, '人');
    await expect(reopenedFigure).toBeVisible();
    await expect(reopenedFigure.locator('text')).toHaveText(['1', '2']);
    await expect(replayButton(page)).toHaveCount(0);
  });

  test('TC-S6.1-AC2-1: S6.1-AC2 Có nút Phát lại bấm được — bấm được khi đang phát và khi đã xong', async ({
    page,
  }) => {
    await openStrokeOrder(page, '人');

    const figure = strokeFigure(page, '人');
    await expect(replayButton(page)).toBeVisible();
    await expect(replayButton(page)).toBeEnabled();

    await expectDrawnStrokes(figure, 2);
    await expect(replayButton(page)).toBeVisible();
    await expect(replayButton(page)).toBeEnabled();
  });

  test('TC-S6.1-AC2-5: S6.1-AC2 Có nút Phát lại bấm được — nút có tên truy cập "Phát lại"', async ({
    page,
  }) => {
    await openStrokeOrder(page, '人');

    const button = page.getByRole('main').getByRole('button');
    await expect(button).toHaveCount(1);
    await expect(button).toHaveAccessibleName('Phát lại');
  });

  test('TC-S6.1-AC2-9: S6.1-AC2 Phát lại sau khi đã phát xong — 人 vẽ lại đủ 2 nét', async ({
    page,
  }) => {
    await openStrokeOrder(page, '人');

    const figure = strokeFigure(page, '人');
    await expectDrawnStrokes(figure, 2);

    await replayAndExpectFullRun(page, figure, 2);
    expect(await drawnStrokeCount(figure)).toBe(2);
  });

  test('TC-S6.1-AC2-11: S6.1-AC2 Phát lại khi đang phát — 好 bấm ngay khi mở, xong có đúng 6 nét', async ({
    page,
  }) => {
    await openStrokeOrder(page, '好');

    const figure = strokeFigure(page, '好');
    await expect(figure).toBeVisible();
    await replayButton(page).click();

    await expectDrawnStrokes(figure, 6);
    await startRecordingStrokeCounts(figure);
    await page.waitForTimeout(2_000);
    expect(await readRecordedStrokeCounts(page)).toEqual([]);
    expect(await drawnStrokeCount(figure)).toBe(6);
  });

  test('TC-S6.1-AC2-12: S6.1-AC2 Phát lại khi đang phát — 白 bấm nhanh 5 lần, lượt cuối vẽ đúng 5 nét', async ({
    page,
  }) => {
    await openStrokeOrder(page, '白');

    const figure = strokeFigure(page, '白');
    await expect(figure).toBeVisible();
    await startRecordingStrokeCounts(figure);
    for (let click = 0; click < 5; click += 1) {
      await replayButton(page).click();
    }

    await expectDrawnStrokes(figure, 5);
    await page.waitForTimeout(2_000);
    const counts = await readRecordedStrokeCounts(page);
    expect(counts.slice(counts.lastIndexOf('0') + 1)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
    ]);
    expect(await drawnStrokeCount(figure)).toBe(5);
  });

  test('TC-S6.1-AC2-13: S6.1-AC2 Phát lại nhiều lần — 人 bấm 3 lần, mỗi lần vẽ đủ 2 nét', async ({
    page,
  }) => {
    await openStrokeOrder(page, '人');

    const figure = strokeFigure(page, '人');
    await expectDrawnStrokes(figure, 2);

    for (let round = 0; round < 3; round += 1) {
      await replayAndExpectFullRun(page, figure, 2);
    }
  });

  test.describe('chặn, làm chậm, thay phản hồi dữ liệu nét', () => {
    // page.route không chặn được request do service worker phục vụ (design "Test").
    test.use({ serviceWorkers: 'block' });

    test('TC-S6.1-AC1-21: S6.1-AC1 Đang tải dữ liệu nét — hiện "Đang tải…", không animation', async ({
      page,
    }) => {
      let releaseRequests: () => void = () => undefined;
      const released = new Promise<void>((resolve) => {
        releaseRequests = resolve;
      });
      await page.route(
        (url) => url.pathname.startsWith('/content/strokes/'),
        async (route) => {
          await released;
          await route.continue();
        },
      );

      await openStrokeOrder(page, '人');

      await expect(page.getByRole('status')).toHaveText('Đang tải…');
      await expectNoAnimation(page);
      releaseRequests();
    });

    test('TC-S6.1-AC1-22: S6.1-AC1 Tải dữ liệu nét lỗi — hiện "Có lỗi xảy ra" và "Thử lại"', async ({
      page,
    }) => {
      await page.route(
        (url) => isStrokeFile(url, '人'),
        (route) => route.abort(),
      );

      await openStrokeOrder(page, '人');

      await expectLoadError(page);
    });

    test('TC-S6.1-AC1-25: S6.1-AC1 Dữ liệu nét hỏng hoặc sai cấu trúc — nội dung không đọc được', async ({
      page,
    }) => {
      await page.route(
        (url) => isStrokeFile(url, '人'),
        (route) =>
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: '{ không phải JSON',
          }),
      );

      await openStrokeOrder(page, '人');

      await expectLoadError(page);
    });

    test('TC-S6.1-AC1-26: S6.1-AC1 Dữ liệu nét hỏng hoặc sai cấu trúc — JSON thiếu phần nét', async ({
      page,
    }) => {
      await page.route(
        (url) => isStrokeFile(url, '人'),
        (route) =>
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              medians: [
                [
                  [100, 100],
                  [200, 200],
                ],
              ],
            }),
          }),
      );

      await openStrokeOrder(page, '人');

      await expectLoadError(page);
    });

    test('TC-S6.1-AC1-27: S6.1-AC1 Thử lại sau khi tải lỗi — bỏ chặn, Thử lại thì phát đủ 2 nét', async ({
      page,
    }) => {
      const blockRen = (url: URL): boolean => isStrokeFile(url, '人');
      await page.route(blockRen, (route) => route.abort());

      await openStrokeOrder(page, '人');
      await expectLoadError(page);

      await page.unroute(blockRen);
      await page.getByRole('button', { name: 'Thử lại' }).click();

      await expect(page.getByText(ERROR_MESSAGE)).toHaveCount(0);
      const figure = strokeFigure(page, '人');
      await expect(figure).toBeVisible();
      await expect(replayButton(page)).toBeVisible();
      await expectDrawnStrokes(figure, 2);
    });
  });
});
