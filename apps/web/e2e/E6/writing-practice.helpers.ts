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
