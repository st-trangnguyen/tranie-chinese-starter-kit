/** Helper e2e của màn luyện viết S6.2. */
import { expect, type Locator, type Page } from '@playwright/test';

export const UNAVAILABLE_MESSAGE = 'Chưa có dữ liệu nét cho chữ này.';
const STROKE_ORDER_LINK = 'Xem thứ tự nét';
export const WRITING_PRACTICE_LINK = 'Tập viết';
export const MOBILE_VIEWPORT = { width: 375, height: 812 };
const MIN_TOUCH_TARGET_PX = 44;
export const MIN_PAD_SIDE_PX = 240;
const MIN_FOCUS_CONTRAST = 3;
const MAX_TAB_PRESSES = 20;

export const writingPracticePath = (character: string): string =>
  `/characters/${encodeURIComponent(character)}/writing-practice`;

export const openWritingPractice = async (
  page: Page,
  character: string,
): Promise<void> => {
  await page.goto(writingPracticePath(character));
};

export const writingPad = (page: Page, character: string): Locator =>
  page.getByRole('figure', { name: `Khung viết chữ ${character}` });

export const anyWritingPad = (page: Page): Locator =>
  page.locator('.writing-pad');

export const outlineStrokes = (pad: Locator): Locator =>
  pad.locator('.stroke-order-outline path');

/** Nét người viết do hanzi-writer vẽ (UserStrokeRenderer đặt `stroke-linejoin="round"`). */
export const userStrokes = (pad: Locator): Locator =>
  pad.locator('svg.writing-pad-writer path[stroke-linejoin="round"]');

export const strokeOrderLink = (page: Page): Locator =>
  page.getByRole('link', { name: STROKE_ORDER_LINK });

export const writingPracticeLink = (page: Page): Locator =>
  page.getByRole('link', { name: WRITING_PRACTICE_LINK });

export const isEscapedPath = (page: Page, path: string): boolean =>
  decodeURIComponent(new URL(page.url()).pathname) === decodeURIComponent(path);

/** Nét chữ trong file nét bản build — nguồn sự thật cho số nét mờ cần vẽ. */
export const readBuiltStrokes = async (
  page: Page,
  character: string,
): Promise<string[]> => {
  const response = await page.request.get(
    `/content/strokes/${encodeURIComponent(character)}.json`,
  );
  expect(response.ok()).toBe(true);
  const body: unknown = await response.json();
  if (
    typeof body !== 'object' ||
    body === null ||
    !('strokes' in body) ||
    !Array.isArray(body.strokes)
  ) {
    throw new Error(`File nét của ${character} không có "strokes".`);
  }
  return body.strokes.map((stroke: unknown) => String(stroke));
};

export const expectNoHorizontalScroll = async (page: Page): Promise<void> => {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
};

export const expectTouchTarget = async (target: Locator): Promise<void> => {
  const box = await target.boundingBox();
  expect(box).not.toBeNull();
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX);
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX);
};

const isFocused = (target: Locator): Promise<boolean> =>
  target.evaluate((element) => element === document.activeElement);

/** Chỉ dùng bàn phím: nhấn Tab cho tới khi `target` nhận focus. */
export const tabUntilFocused = async (
  page: Page,
  target: Locator,
): Promise<void> => {
  for (let press = 0; press < MAX_TAB_PRESSES; press += 1) {
    await page.keyboard.press('Tab');
    if (await isFocused(target)) {
      return;
    }
  }
  throw new Error(`Không Tab tới được phần tử sau ${MAX_TAB_PRESSES} lần.`);
};

interface FocusRing {
  outlineStyle: string;
  outlineWidth: number;
  contrast: number;
}

/**
 * Viền focus của phần tử đang focus: kiểu, độ dày và tương phản giữa màu viền và nền gần nhất
 * (màu đổi về sRGB qua canvas để đọc được mọi cú pháp màu CSS).
 */
const readFocusRing = (target: Locator): Promise<FocusRing> =>
  target.evaluate((element) => {
    const toRgb = (color: string): [number, number, number, number] => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Không có canvas 2d.');
      }
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
      return [r, g, b, a];
    };
    const luminance = ([r, g, b]: [number, number, number, number]): number => {
      const channel = (value: number): number => {
        const c = value / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };
    const backgroundOf = (start: Element): string => {
      let node: Element | null = start.parentElement;
      while (node) {
        const color = getComputedStyle(node).backgroundColor;
        if (toRgb(color)[3] > 0) {
          return color;
        }
        node = node.parentElement;
      }
      return 'rgb(255, 255, 255)';
    };
    const style = getComputedStyle(element);
    const ring = luminance(toRgb(style.outlineColor));
    const background = luminance(toRgb(backgroundOf(element)));
    const contrast =
      (Math.max(ring, background) + 0.05) / (Math.min(ring, background) + 0.05);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth),
      contrast,
    };
  });

export const expectVisibleFocusRing = async (
  target: Locator,
): Promise<void> => {
  const ring = await readFocusRing(target);
  expect(ring.outlineStyle).not.toBe('none');
  expect(ring.outlineWidth).toBeGreaterThan(0);
  expect(ring.contrast).toBeGreaterThanOrEqual(MIN_FOCUS_CONTRAST);
};

/** Một điểm median trong toạ độ dữ liệu nét (hộp 1024, trục y hướng lên). */
export type MedianPoint = readonly [number, number];

interface ScreenPoint {
  x: number;
  y: number;
}

interface DrawOptions {
  /** `false`: giữ chuột sau khi kéo hết median (đang viết, chưa nhả). */
  isReleased?: boolean;
  steps?: number;
}

/** Đường gốc của trục y lật trong `STROKE_PATH_TRANSFORM` (`translate(0, 900) scale(1, -1)`). */
const STROKE_BASELINE_Y = 900;
const DEFAULT_DRAW_STEPS = 8;

const isMedianPoint = (value: unknown): value is MedianPoint =>
  Array.isArray(value) &&
  value.length === 2 &&
  typeof value[0] === 'number' &&
  typeof value[1] === 'number';

const isMedian = (value: unknown): value is MedianPoint[] =>
  Array.isArray(value) && value.every(isMedianPoint);

/** Median từng nét trong file nét bản build — đường đi đúng của mỗi nét. */
export const readBuiltMedians = async (
  page: Page,
  character: string,
): Promise<MedianPoint[][]> => {
  const response = await page.request.get(
    `/content/strokes/${encodeURIComponent(character)}.json`,
  );
  expect(response.ok()).toBe(true);
  const body: unknown = await response.json();
  if (
    typeof body !== 'object' ||
    body === null ||
    !('medians' in body) ||
    !Array.isArray(body.medians) ||
    !body.medians.every(isMedian)
  ) {
    throw new Error(`File nét của ${character} không có "medians" hợp lệ.`);
  }
  return body.medians;
};

/** `<svg viewBox="0 0 1024 1024">` của khung (StrokeGlyph), cùng hệ toạ độ với lớp nét mờ. */
const padSvg = (pad: Locator): Locator =>
  pad.locator('svg[viewBox="0 0 1024 1024"]').first();

/** `<svg>` đích của thư viện chấm nét (adapter tạo trong host). */
export const writerSvg = (pad: Locator): Locator =>
  pad.locator('svg.writing-pad-writer');

/** Chờ thư viện mount renderer vào đích (quiz bắt đầu sau microtask). */
export const waitForWriterReady = async (pad: Locator): Promise<void> => {
  await expect(writerSvg(pad)).toHaveCount(1);
  await expect(writerSvg(pad).locator('g').first()).toBeAttached();
};

/**
 * Đổi điểm median (hộp 1024, y lật qua `900 - y`) sang toạ độ màn (CSS px của viewport)
 * bằng `getScreenCTM()` của `<svg>` khung — độc lập với đích của thư viện.
 */
export const toPadScreenPoints = (
  pad: Locator,
  points: readonly MedianPoint[],
): Promise<ScreenPoint[]> =>
  padSvg(pad).evaluate(
    (svg, { medianPoints, baselineY }) => {
      if (!(svg instanceof SVGSVGElement)) {
        throw new Error('Khung viết không có <svg>.');
      }
      const matrix = svg.getScreenCTM();
      if (!matrix) {
        throw new Error('<svg> khung không có screen CTM.');
      }
      return medianPoints.map(([x, y]) => {
        const point = new DOMPoint(x, baselineY - y).matrixTransform(matrix);
        return { x: point.x, y: point.y };
      });
    },
    {
      medianPoints: points.map(([x, y]) => [x, y]),
      baselineY: STROKE_BASELINE_Y,
    },
  );

/** Vẽ bằng chuột theo median: nhấn ở điểm đầu, kéo qua từng điểm (có `steps`), nhả ở điểm cuối. */
export const drawMedian = async (
  page: Page,
  pad: Locator,
  median: readonly MedianPoint[],
  { isReleased = true, steps = DEFAULT_DRAW_STEPS }: DrawOptions = {},
): Promise<ScreenPoint[]> => {
  const screenPoints = await toPadScreenPoints(pad, median);
  const [start, ...rest] = screenPoints;
  if (!start) {
    throw new Error('Median rỗng.');
  }
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  for (const point of rest) {
    await page.mouse.move(point.x, point.y, { steps });
  }
  if (isReleased) {
    await page.mouse.up();
  }
  return screenPoints;
};

/** Nhấp một điểm (hộp 1024) trong khung, không kéo. */
export const tapPadPoint = async (
  page: Page,
  pad: Locator,
  point: MedianPoint,
): Promise<void> => {
  const [screenPoint] = await toPadScreenPoints(pad, [point]);
  if (!screenPoint) {
    throw new Error('Không đổi được toạ độ điểm chạm.');
  }
  await page.mouse.click(screenPoint.x, screenPoint.y);
};

/** Số nét người viết còn nhìn thấy: còn trong DOM và tích `opacity` tới khung > 0. */
export const visibleUserStrokeCount = (pad: Locator): Promise<number> =>
  pad.evaluate((figure) => {
    const paths = figure.querySelectorAll(
      'svg.writing-pad-writer path[stroke-linejoin="round"]',
    );
    return Array.from(paths).filter((path) => {
      let opacity = 1;
      let node: Element | null = path;
      while (node && node !== figure) {
        opacity *= Number.parseFloat(getComputedStyle(node).opacity);
        node = node.parentElement;
      }
      return opacity > 0;
    }).length;
  });

/**
 * Kéo cảm ứng theo median qua CDP `Input.dispatchTouchEvent` (touchStart → nhiều touchMove →
 * touchEnd), đi qua pipeline input thật của Chromium nên trình duyệt áp `touch-action` và có thể
 * cuộn trang như ngón tay thật. Cần context có touch (Pixel 7).
 */
export const touchDragMedian = async (
  page: Page,
  pad: Locator,
  median: readonly MedianPoint[],
  steps: number = DEFAULT_DRAW_STEPS,
): Promise<void> => {
  const screenPoints = await toPadScreenPoints(pad, median);
  const [start, ...rest] = screenPoints;
  if (!start) {
    throw new Error('Median rỗng.');
  }
  const session = await page.context().newCDPSession(page);
  try {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: start.x, y: start.y }],
    });
    let previous = start;
    for (const point of rest) {
      for (let step = 1; step <= steps; step += 1) {
        const ratio = step / steps;
        await session.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [
            {
              x: previous.x + (point.x - previous.x) * ratio,
              y: previous.y + (point.y - previous.y) * ratio,
            },
          ],
        });
      }
      previous = point;
    }
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    });
  } finally {
    await session.detach();
  }
};
