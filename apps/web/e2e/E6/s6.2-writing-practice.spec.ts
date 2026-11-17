import { expect, test } from '@playwright/test';

import { strokeOrderPath } from './stroke-order.helpers';
import {
  UNAVAILABLE_MESSAGE,
  WRITING_PRACTICE_LINK,
  MOBILE_VIEWPORT,
  MIN_PAD_SIDE_PX,
  writingPracticePath,
  openWritingPractice,
  writingPad,
  anyWritingPad,
  outlineStrokes,
  userStrokes,
  strokeOrderLink,
  writingPracticeLink,
  isEscapedPath,
  readBuiltStrokes,
  expectNoHorizontalScroll,
  expectTouchTarget,
  tabUntilFocused,
  expectVisibleFocusRing,
} from './writing-practice.helpers';

test.describe('S6.2 Viết theo nét có gợi ý', () => {
  test('TC-S6.2-AC1-1: S6.2-AC1 Hiện khung viết có nét mờ của cả chữ — 十 có đủ 2 nét mờ, chưa nét nào đã viết', async ({
    page,
  }) => {
    const strokes = await readBuiltStrokes(page, '十');
    expect(strokes).toHaveLength(2);

    await openWritingPractice(page, '十');

    const pad = writingPad(page, '十');
    await expect(pad).toBeVisible();
    await expect(outlineStrokes(pad)).toHaveCount(2);
    for (const [index, stroke] of strokes.entries()) {
      await expect(outlineStrokes(pad).nth(index)).toHaveAttribute('d', stroke);
    }
    await expect(pad).toHaveAttribute('data-completed-stroke-count', '0');
    await expect(userStrokes(pad)).toHaveCount(0);
  });

  test('TC-S6.2-AC1-20: S6.2-AC1 Màn luyện viết có liên kết về thứ tự nét — bấm "Xem thứ tự nét" mở màn của đúng chữ 人', async ({
    page,
  }) => {
    await openWritingPractice(page, '人');
    await expect(writingPad(page, '人')).toBeVisible();

    await strokeOrderLink(page).click();

    await expect
      .poll(() => isEscapedPath(page, strokeOrderPath('人')))
      .toBe(true);
    await expect(
      page.getByRole('img', { name: 'Thứ tự nét chữ 人' }),
    ).toBeVisible();
  });

  test('TC-S6.2-AC1-22: S6.2-AC1 Chữ không có dữ liệu nét — mở trực tiếp 龘 hiện thông báo, không khung viết', async ({
    page,
  }) => {
    await openWritingPractice(page, '龘');

    await expect(
      page.getByText(UNAVAILABLE_MESSAGE, { exact: true }),
    ).toBeVisible();
    await expect(anyWritingPad(page)).toHaveCount(0);
    await expect(page.getByRole('figure')).toHaveCount(0);
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`TC-S6.2-AC1-23: S6.2-AC1 Khung viết nhận focus bàn phím — Tab vào khung 十, viền focus nhìn thấy (${colorScheme})`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await openWritingPractice(page, '十');
      const pad = writingPad(page, '十');
      await expect(pad).toBeVisible();

      await tabUntilFocused(page, pad);

      await expect(pad).toBeFocused();
      await expectVisibleFocusRing(pad);
    });
  }

  test('TC-S6.2-AC1-25: S6.2-AC1 Khung viết nhận focus bàn phím — phím không tạo nét, không thông báo sai, không gợi ý', async ({
    page,
  }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error);
    });
    await openWritingPractice(page, '十');
    const pad = writingPad(page, '十');
    await expect(pad).toBeVisible();
    await tabUntilFocused(page, pad);

    const keys = [
      'a',
      'z',
      '1',
      '9',
      'Space',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
    ];
    for (const key of keys) {
      await page.keyboard.press(key);
    }

    await expect(pad).toHaveAttribute('data-completed-stroke-count', '0');
    await expect(pad).not.toHaveAttribute('data-hint-stroke-index', /.*/);
    await expect(userStrokes(pad)).toHaveCount(0);
    await expect(pad.locator('.writing-pad-hint path')).toHaveCount(0);
    await expect(page.getByRole('alert')).toHaveCount(0);
    await expect(outlineStrokes(pad)).toHaveCount(2);
    await expect
      .poll(() => isEscapedPath(page, writingPracticePath('十')))
      .toBe(true);
    expect(pageErrors).toEqual([]);
  });

  test('TC-S6.2-AC1-26: S6.2-AC1 Đường thay thế khi không dùng được chuột hoặc cảm ứng — Tab tới "Xem thứ tự nét", Enter mở màn của 人', async ({
    page,
  }) => {
    await openWritingPractice(page, '人');
    await expect(writingPad(page, '人')).toBeVisible();
    const link = strokeOrderLink(page);

    await tabUntilFocused(page, link);

    await expect(link).toBeFocused();
    await expectVisibleFocusRing(link);

    await page.keyboard.press('Enter');

    await expect
      .poll(() => isEscapedPath(page, strokeOrderPath('人')))
      .toBe(true);
    await expect(
      page.getByRole('img', { name: 'Thứ tự nét chữ 人' }),
    ).toBeVisible();
  });

  test('TC-S6.2-AC1-27: S6.2-AC1 Vào luyện viết từ màn xem thứ tự nét — bấm "Tập viết" mở một khung viết 人 với 2 nét mờ', async ({
    page,
  }) => {
    await page.goto(strokeOrderPath('人'));

    await writingPracticeLink(page).click();

    await expect
      .poll(() => isEscapedPath(page, writingPracticePath('人')))
      .toBe(true);
    const pad = writingPad(page, '人');
    await expect(pad).toBeVisible();
    await expect(anyWritingPad(page)).toHaveCount(1);
    await expect(page.getByRole('figure')).toHaveCount(1);
    await expect(outlineStrokes(pad)).toHaveCount(2);
    await expect(pad).toHaveAttribute('data-completed-stroke-count', '0');
  });

  test('TC-S6.2-AC1-29: S6.2-AC1 Nút Tập viết bấm được bằng bàn phím — Tab tới "Tập viết", Enter mở luyện viết 人', async ({
    page,
  }) => {
    await page.goto(strokeOrderPath('人'));
    const link = writingPracticeLink(page);
    await expect(link).toBeVisible();

    await tabUntilFocused(page, link);

    await expect(link).toBeFocused();
    await expectVisibleFocusRing(link);

    await page.keyboard.press('Enter');

    await expect
      .poll(() => isEscapedPath(page, writingPracticePath('人')))
      .toBe(true);
    await expect(writingPad(page, '人')).toBeVisible();
  });

  test('TC-S6.2-AC1-30: S6.2-AC1 Không có nút Tập viết khi chữ không có dữ liệu nét — màn thứ tự nét của 龘', async ({
    page,
  }) => {
    await page.goto(strokeOrderPath('龘'));

    await expect(
      page.getByText(UNAVAILABLE_MESSAGE, { exact: true }),
    ).toBeVisible();
    await expect(writingPracticeLink(page)).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: WRITING_PRACTICE_LINK }),
    ).toHaveCount(0);
  });

  test.describe('khổ 375×812', () => {
    test.use({ viewport: MOBILE_VIEWPORT });

    test('TC-S6.2-AC1-2: S6.2-AC1 Hiện khung viết có nét mờ của cả chữ — 你 ở 375×812: khung gọn, cạnh ≥ 240 px, đủ 7 nét mờ', async ({
      page,
    }) => {
      await openWritingPractice(page, '你');

      const pad = writingPad(page, '你');
      await expect(pad).toBeVisible();
      await expect(outlineStrokes(pad)).toHaveCount(7);

      const box = await pad.boundingBox();
      expect(box).not.toBeNull();
      const padBox = box ?? { x: 0, y: 0, width: 0, height: 0 };
      expect(Math.min(padBox.width, padBox.height)).toBeGreaterThanOrEqual(
        MIN_PAD_SIDE_PX,
      );
      expect(padBox.x).toBeGreaterThanOrEqual(0);
      expect(padBox.x + padBox.width).toBeLessThanOrEqual(
        MOBILE_VIEWPORT.width,
      );

      const strokeBoxes = await outlineStrokes(pad).evaluateAll((paths) =>
        paths.map((path) => {
          const rect = path.getBoundingClientRect();
          return {
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
          };
        }),
      );
      for (const stroke of strokeBoxes) {
        expect(stroke.left).toBeGreaterThanOrEqual(padBox.x - 1);
        expect(stroke.top).toBeGreaterThanOrEqual(padBox.y - 1);
        expect(stroke.right).toBeLessThanOrEqual(padBox.x + padBox.width + 1);
        expect(stroke.bottom).toBeLessThanOrEqual(padBox.y + padBox.height + 1);
      }
      await expectNoHorizontalScroll(page);
    });

    test('TC-S6.2-AC1-21: S6.2-AC1 Màn luyện viết có liên kết về thứ tự nét — 人 ở 375×812: liên kết ≥ 44×44 px, không bị khung che', async ({
      page,
    }) => {
      await openWritingPractice(page, '人');
      await expect(writingPad(page, '人')).toBeVisible();

      const link = strokeOrderLink(page);
      await expect(link).toBeVisible();
      await expect(link).toBeInViewport();
      await expectTouchTarget(link);

      const isOnTop = await link.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const topmost = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
        );
        return topmost !== null && element.contains(topmost);
      });
      expect(isOnTop).toBe(true);
      await expectNoHorizontalScroll(page);
    });

    test('TC-S6.2-AC1-28: S6.2-AC1 Vào luyện viết từ màn xem thứ tự nét — 人 ở 375×812: nút "Tập viết" ≥ 44×44 px', async ({
      page,
    }) => {
      await page.goto(strokeOrderPath('人'));

      const link = writingPracticeLink(page);
      await expect(link).toBeVisible();
      await expectTouchTarget(link);
      await expectNoHorizontalScroll(page);
    });
  });
});
