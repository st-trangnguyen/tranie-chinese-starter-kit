import { expect, test, type Locator, type Page } from '@playwright/test';

import {
  type MedianPoint,
  drawMedian,
  openWritingPractice,
  readBuiltMedians,
  readBuiltStrokes,
  visibleUserStrokeCount,
  waitForWriterReady,
  writingPad,
} from './writing-practice.helpers';

/**
 * Giảm chuyển động của hệ điều hành (`prefers-reduced-motion: reduce`) trên khung viết, với thư viện
 * chấm nét thật (hanzi-writer) trên bản build. Emulate trước khi mở màn vì khung chốt lựa chọn lúc mount.
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
/** Gợi ý phải đứng yên suốt khoảng chờ này (không nháy, không đổi kiểu). */
const HINT_STILL_MS = 2_000;

interface TenStrokes {
  horizontal: MedianPoint[];
  vertical: MedianPoint[];
  horizontalPath: string;
}

const openTenWithReducedMotion = async (
  page: Page,
): Promise<{ pad: Locator; strokes: TenStrokes }> => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const [horizontal, vertical] = await readBuiltMedians(page, CHARACTER);
  const [horizontalPath] = await readBuiltStrokes(page, CHARACTER);
  if (!horizontal || !vertical || !horizontalPath) {
    throw new Error(`File nét của ${CHARACTER} phải có 2 nét và 2 median.`);
  }
  await openWritingPractice(page, CHARACTER);
  const pad = writingPad(page, CHARACTER);
  await expect(pad).toBeVisible();
  await pad.scrollIntoViewIfNeeded();
  await waitForWriterReady(pad);
  expect(
    await page.evaluate(
      () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    ),
  ).toBe(true);
  return { pad, strokes: { horizontal, vertical, horizontalPath } };
};

const reversed = (median: readonly MedianPoint[]): MedianPoint[] =>
  [...median].reverse();

/**
 * Opacity hiệu dụng (tích `opacity` tới khung) lớn nhất trong các path nét của thư viện có `clip-path`
 * trỏ tới `clipPath` chứa đúng `d` của nét. Đọc sau hai khung hình (≈ 33 ms) kể từ lúc gọi — sớm hơn
 * nhiều so với thời gian hiện dần mặc định của thư viện (400 ms).
 */
const libraryStrokeOpacityRightAfter = (
  pad: Locator,
  strokePath: string,
): Promise<number> =>
  pad.evaluate(async (figure, d) => {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    const writer = figure.querySelector('svg.writing-pad-writer');
    if (!writer) {
      throw new Error('Không có svg.writing-pad-writer.');
    }
    const clipIds = Array.from(writer.querySelectorAll('clipPath'))
      .filter((clip) =>
        Array.from(clip.querySelectorAll('path')).some(
          (path) => path.getAttribute('d') === d,
        ),
      )
      .map((clip) => clip.id);
    const strokePaths = Array.from(
      writer.querySelectorAll('path[clip-path]'),
    ).filter((path) =>
      clipIds.some((id) => path.getAttribute('clip-path')?.includes(`#${id}`)),
    );
    if (strokePaths.length === 0) {
      throw new Error('Không tìm thấy path nét của thư viện cho nét này.');
    }
    const effectiveOpacity = (path: Element): number => {
      let opacity = 1;
      let node: Element | null = path;
      while (node && node !== figure) {
        opacity *= Number.parseFloat(getComputedStyle(node).opacity);
        node = node.parentElement;
      }
      return opacity;
    };
    return Math.max(...strokePaths.map(effectiveOpacity));
  }, strokePath);

interface HintMotionStyle {
  animationName: string;
  /** Thời lượng transition dài nhất của nét gợi ý, tính bằng giây. */
  maxTransitionSeconds: number;
}

/**
 * Ngưỡng "tĩnh" cho transition: quy tắc giảm chuyển động chung của app
 * (`styles/tailwind/base/_base.css`) đặt `transition-duration: 0.01ms !important`, nên 0.01 ms
 * (1e-5 s) được coi là không chuyển động — quyết định của người dùng, spec chỉ đòi "tĩnh".
 */
const MAX_STATIC_TRANSITION_SECONDS = 0.00001;

const parseDurationSeconds = (value: string): number => {
  const trimmed = value.trim();
  const seconds = trimmed.endsWith('ms')
    ? Number.parseFloat(trimmed.slice(0, -2)) / 1000
    : Number.parseFloat(trimmed.slice(0, -1));
  if (!trimmed.endsWith('s') || Number.isNaN(seconds)) {
    throw new Error(`Không đọc được thời lượng transition: "${value}".`);
  }
  return seconds;
};

const hintMotionStyle = async (pad: Locator): Promise<HintMotionStyle> => {
  const { animationName, transitionDuration } = await pad
    .locator('.writing-pad-hint path')
    .evaluate((path) => {
      const style = getComputedStyle(path);
      return {
        animationName: style.animationName,
        transitionDuration: style.transitionDuration,
      };
    });
  return {
    animationName,
    maxTransitionSeconds: Math.max(
      ...transitionDuration.split(',').map(parseDurationSeconds),
    ),
  };
};

const expectStaticHint = async (pad: Locator): Promise<void> => {
  const style = await hintMotionStyle(pad);
  expect(style.animationName).toBe('none');
  expect(style.maxTransitionSeconds).toBeLessThanOrEqual(
    MAX_STATIC_TRANSITION_SECONDS,
  );
};

for (const layout of LAYOUTS) {
  test.describe(`S6.2 giảm chuyển động — ${layout.name}`, () => {
    test.use(layout.use);

    test(`TC-S6.2-AC1-31: S6.2-AC1 Giảm chuyển động trên khung viết — nét ngang đúng hiện ngay (opacity 1), nét sổ sai biến mất ngay khi nhả, rồi viết xong chữ (${layout.name})`, async ({
      page,
    }) => {
      const { pad, strokes } = await openTenWithReducedMotion(page);

      await drawMedian(page, pad, strokes.horizontal);
      expect(
        await libraryStrokeOpacityRightAfter(pad, strokes.horizontalPath),
      ).toBe(1);
      await expect(pad).toHaveAttribute('data-completed-stroke-count', '1');

      await drawMedian(page, pad, reversed(strokes.vertical));
      expect(await visibleUserStrokeCount(pad)).toBe(0);
      await expect(page.getByRole('alert')).toBeVisible();
      await expect(pad).toHaveAttribute('data-completed-stroke-count', '1');

      await drawMedian(page, pad, strokes.vertical);
      await expect(pad).toHaveAttribute('data-completed-stroke-count', '2');
      await expect(
        page.getByText(COMPLETE_MESSAGE, { exact: true }),
      ).toBeVisible();
    });

    test(`TC-S6.2-AC3-10: S6.2-AC3 Gợi ý không phụ thuộc chuyển động — sai nét ngang 3 lần: nét gợi ý tĩnh (không animation, không transition) và vẫn còn sau 2 s (${layout.name})`, async ({
      page,
    }) => {
      const { pad, strokes } = await openTenWithReducedMotion(page);

      for (let attempt = 0; attempt < 3; attempt += 1) {
        await drawMedian(page, pad, reversed(strokes.horizontal));
        await expect(page.getByRole('alert')).toBeVisible();
      }

      await expect(pad).toHaveAttribute('data-hint-stroke-index', '0');
      const hintPaths = pad.locator('.writing-pad-hint path');
      await expect(hintPaths).toHaveCount(1);
      await expectStaticHint(pad);

      await page.waitForTimeout(HINT_STILL_MS);

      await expect(hintPaths).toHaveCount(1);
      await expect(pad).toHaveAttribute('data-hint-stroke-index', '0');
      await expectStaticHint(pad);
    });
  });
}
