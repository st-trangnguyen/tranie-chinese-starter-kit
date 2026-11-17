import { expect, test, type Page } from '@playwright/test';

import {
  type MedianPoint,
  openWritingPractice,
  writingPad,
  userStrokes,
  readBuiltMedians,
  waitForWriterReady,
  drawMedian,
  tapPadPoint,
  toPadScreenPoints,
  visibleUserStrokeCount,
  touchDragMedian,
} from './writing-practice.helpers';

/**
 * Thư viện chấm nét thật (hanzi-writer) trên bản build: vẽ bằng chuột theo median của file nét,
 * ở khổ Pixel 7 (project mặc định) và desktop 1280×800.
 */
const LAYOUTS = [
  { name: 'Pixel 7', use: {} },
  {
    name: '1280×800',
    use: {
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
    },
  },
] as const;

const CHARACTER = '十';
const COMPLETE_MESSAGE = `Đã viết xong chữ ${CHARACTER}.`;
/** Lâu hơn `drawingFadeDuration` (300 ms) của thư viện. */
const ERASE_TIMEOUT_MS = 1_000;
/** Đủ cho thư viện chấm xong một lần nhả/nhấp nếu nó có phản hồi. */
const SETTLE_MS = 500;
const CENTER_POINT: MedianPoint = [512, 388];
/**
 * Đường kéo nằm hẳn ở góc trên-trái của hộp 1024 (median, y hướng lên: y 800 → màn 100/1024),
 * xa nét ngang (y≈388) và nét sổ (x≈512) của 十. Test vẫn kiểm lại bằng `elementFromPoint`
 * rằng điểm nhấn không rơi trên `path` nào.
 */
const EMPTY_AREA_DRAG: MedianPoint[] = [
  [120, 800],
  [220, 800],
  [320, 800],
];

/** Tên thẻ (chữ thường) của phần tử trên cùng tại một điểm màn. */
const tagNameAt = (page: Page, x: number, y: number): Promise<string | null> =>
  page.evaluate(
    ({ px, py }) =>
      document.elementFromPoint(px, py)?.tagName.toLowerCase() ?? null,
    { px: x, py: y },
  );

interface TenStrokes {
  horizontal: MedianPoint[];
  vertical: MedianPoint[];
}

const openTen = async (page: Page) => {
  const [horizontal, vertical] = await readBuiltMedians(page, CHARACTER);
  if (!horizontal || !vertical) {
    throw new Error(`File nét của ${CHARACTER} phải có 2 median.`);
  }
  await openWritingPractice(page, CHARACTER);
  const pad = writingPad(page, CHARACTER);
  await expect(pad).toBeVisible();
  await pad.scrollIntoViewIfNeeded();
  await waitForWriterReady(pad);
  const strokes: TenStrokes = { horizontal, vertical };
  return { pad, strokes };
};

const reversed = (median: readonly MedianPoint[]): MedianPoint[] =>
  [...median].reverse();

for (const layout of LAYOUTS) {
  test.describe(`S6.2 viết bằng thư viện thật — ${layout.name}`, () => {
    test.use(layout.use);

    test(`TC-S6.2-AC1-6: S6.2-AC1 Viết bằng chuột — đang kéo (chưa nhả) đã có nét người viết (${layout.name})`, async ({
      page,
    }) => {
      const { pad, strokes } = await openTen(page);

      await drawMedian(page, pad, strokes.horizontal, { isReleased: false });

      await expect(userStrokes(pad).first()).toBeAttached();
      await page.mouse.up();
    });

    test(`TC-S6.2-AC1-6: S6.2-AC1 Viết bằng chuột — nhấn ở vùng trống trong khung (không trên nét chữ), kéo chưa nhả: đã có nét người viết (${layout.name})`, async ({
      page,
    }) => {
      const { pad } = await openTen(page);
      const [start] = await toPadScreenPoints(pad, EMPTY_AREA_DRAG);
      if (!start) {
        throw new Error('Không đổi được toạ độ điểm nhấn.');
      }
      const box = await pad.boundingBox();
      expect(box).not.toBeNull();
      expect(start.x).toBeGreaterThan(box?.x ?? Infinity);
      expect(start.y).toBeGreaterThan(box?.y ?? Infinity);
      expect(await tagNameAt(page, start.x, start.y)).not.toBe('path');

      await drawMedian(page, pad, EMPTY_AREA_DRAG, { isReleased: false });

      await expect(userStrokes(pad).first()).toBeAttached();
      await page.mouse.up();
    });

    test(`TC-S6.2-AC1-10, TC-S6.2-AC1-11: S6.2-AC1 Viết đúng nét thì sang nét kế, Viết đúng hết các nét thì hoàn thành chữ — 十 ngang rồi sổ (${layout.name})`, async ({
      page,
    }) => {
      const { pad, strokes } = await openTen(page);
      await expect(pad).toHaveAttribute('data-completed-stroke-count', '0');

      await drawMedian(page, pad, strokes.horizontal);

      await expect(pad).toHaveAttribute('data-completed-stroke-count', '1');
      await expect(page.getByRole('alert')).toHaveCount(0);
      await expect(page.getByText(COMPLETE_MESSAGE)).toHaveCount(0);

      await drawMedian(page, pad, strokes.vertical);

      await expect(pad).toHaveAttribute('data-completed-stroke-count', '2');
      await expect(
        page.getByText(COMPLETE_MESSAGE, { exact: true }),
      ).toBeVisible();
    });

    test(`TC-S6.2-AC1-17: S6.2-AC1 Chạm một điểm thì bỏ qua — nhấp một điểm: không báo sai, vẫn 0 (${layout.name})`, async ({
      page,
    }) => {
      const { pad } = await openTen(page);

      await tapPadPoint(page, pad, CENTER_POINT);
      await page.waitForTimeout(SETTLE_MS);

      await expect(page.getByRole('alert')).toHaveCount(0);
      await expect(pad).toHaveAttribute('data-completed-stroke-count', '0');
    });

    test(`TC-S6.2-AC2-3: S6.2-AC2 Viết ngược hướng thì sai — ngang phải sang trái: báo sai, vẫn 0 (${layout.name})`, async ({
      page,
    }) => {
      const { pad, strokes } = await openTen(page);

      await drawMedian(page, pad, reversed(strokes.horizontal));

      await expect(page.getByRole('alert')).toBeVisible();
      await expect(pad).toHaveAttribute('data-completed-stroke-count', '0');
    });

    test(`TC-S6.2-AC2-6: S6.2-AC2 Nét sai bị xoá và được viết lại — nét sai biến mất, viết đúng ngang sau đó được nhận (${layout.name})`, async ({
      page,
    }) => {
      const { pad, strokes } = await openTen(page);

      await drawMedian(page, pad, reversed(strokes.horizontal));
      await expect(page.getByRole('alert')).toBeVisible();

      await expect
        .poll(() => visibleUserStrokeCount(pad), { timeout: ERASE_TIMEOUT_MS })
        .toBe(0);
      await expect(pad).toHaveAttribute('data-completed-stroke-count', '0');

      await drawMedian(page, pad, strokes.horizontal);

      await expect(pad).toHaveAttribute('data-completed-stroke-count', '1');
    });

    test(`TC-S6.2-AC2-5: S6.2-AC2 Viết nét của một nét khác thì sai — sổ khi đang chờ ngang: báo sai, vẫn 0 (${layout.name})`, async ({
      page,
    }) => {
      const { pad, strokes } = await openTen(page);

      await drawMedian(page, pad, strokes.vertical);

      await expect(page.getByRole('alert')).toBeVisible();
      await expect(pad).toHaveAttribute('data-completed-stroke-count', '0');
    });

    test(`TC-S6.2-AC3-2: S6.2-AC3 Sai 3 lần liên tiếp thì hiện gợi ý — 3 nét ngang ngược: gợi ý nét 0 (${layout.name})`, async ({
      page,
    }) => {
      const { pad, strokes } = await openTen(page);

      for (let attempt = 0; attempt < 3; attempt += 1) {
        await drawMedian(page, pad, reversed(strokes.horizontal));
        await expect(page.getByRole('alert')).toBeVisible();
      }

      await expect(pad).toHaveAttribute('data-hint-stroke-index', '0');
      await expect(pad).toHaveAttribute('data-completed-stroke-count', '0');
    });
  });
}

/** Đủ để trang cuộn được hẳn trên và dưới khung khi khung nằm giữa màn. */
const LONG_PAGE_MIN_HEIGHT = '3000px';
/** Khoảng từ mép trên màn tới khung sau khi cuộn (px). */
const PAD_TOP_OFFSET_PX = 40;

test.describe('S6.2 viết bằng ngón tay — Pixel 7 (cảm ứng)', () => {
  test('TC-S6.2-AC1-8, TC-S6.2-AC1-9: S6.2-AC1 Viết bằng ngón tay — kéo cảm ứng nét ngang rồi nét sổ (dọc) trong khung: cả hai nét được nhận, trang không cuộn, khung touch-action none', async ({
    page,
  }) => {
    const { pad, strokes } = await openTen(page);

    await page.evaluate((minHeight) => {
      document.body.style.minHeight = minHeight;
    }, LONG_PAGE_MIN_HEIGHT);
    // Khung ở gần đầu trang nên không cuộn được tới đúng giữa màn: cuộn để khung cách mép trên
    // một đoạn, nằm trọn trong màn, và trang còn cuộn được cả lên lẫn xuống.
    await pad.evaluate((figure, offset) => {
      const top = figure.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top - offset, behavior: 'instant' });
    }, PAD_TOP_OFFSET_PX);
    await expect(pad).toBeInViewport({ ratio: 1 });
    const scrollYBefore = await page.evaluate(() => window.scrollY);
    expect(scrollYBefore).toBeGreaterThan(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollHeight - window.innerHeight,
      ),
    ).toBeGreaterThan(scrollYBefore);

    await touchDragMedian(page, pad, strokes.horizontal);

    await expect(pad).toHaveAttribute('data-completed-stroke-count', '1');
    await page.waitForTimeout(SETTLE_MS);
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollYBefore);

    // TC-S6.2-AC1-9: kéo dọc từ trên xuống trong khung — hướng mà trình duyệt sẽ cuộn trang
    // nếu khung không chặn cử chỉ.
    const scrollYBeforeVertical = await page.evaluate(() => window.scrollY);
    await touchDragMedian(page, pad, strokes.vertical);

    await expect(pad).toHaveAttribute('data-completed-stroke-count', '2');
    await page.waitForTimeout(SETTLE_MS);
    expect(await page.evaluate(() => window.scrollY)).toBe(
      scrollYBeforeVertical,
    );
    expect(
      await pad.evaluate((figure) => getComputedStyle(figure).touchAction),
    ).toBe('none');
  });
});
