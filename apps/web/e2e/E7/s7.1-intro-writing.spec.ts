import { expect, test } from '@playwright/test';

import {
  drawMedian,
  outlineStrokes,
  readBuiltStrokes,
  strokeOrderLink,
  tabUntilFocused,
  visibleUserStrokeCount,
} from '../E6/writing-practice.helpers';
import { skipButton } from './intro-lessons.helpers';
import {
  SETTLE_MS,
  continueButton,
  mistakeAlert,
  openStrokeWrite,
  progressText,
  readMedians,
  readTenStrokes,
  verdict,
} from './intro-writing.helpers';

/** Mở bài 10 và đi qua các câu trước câu viết (vẽ từng nét) cần lâu hơn mặc định 30 s. */
const WRITING_TEST_TIMEOUT_MS = 90_000;
const MISTAKES_BEFORE_CORRECT = 4;

test.describe('S7.1 Soạn 12 bài Nhập môn — câu viết trong bài', () => {
  test.beforeEach(() => {
    test.setTimeout(WRITING_TEST_TIMEOUT_MS);
  });

  test('TC-S7.1-AC1-12: S7.1-AC1 Câu viết hiện khung viết của đúng chữ', async ({
    page,
  }) => {
    const { pad } = await openStrokeWrite(page, '人');
    const strokes = await readBuiltStrokes(page, '人');

    await expect(outlineStrokes(pad)).toHaveCount(strokes.length);
    await expect(pad).toHaveAttribute('data-completed-stroke-count', '0');
    await expect(skipButton(page)).toHaveCount(0);
    await expect(strokeOrderLink(page)).toBeVisible();
  });

  test('TC-S7.1-AC1-16: S7.1-AC1 Khung viết trong bài nhận focus bàn phím', async ({
    page,
  }) => {
    const { pad } = await openStrokeWrite(page, '人');

    await tabUntilFocused(page, pad);

    const outlineStyle = await pad.evaluate(
      (element) => getComputedStyle(element).outlineStyle,
    );
    expect(outlineStyle).not.toBe('none');
  });

  test('TC-S7.1-AC1-18: S7.1-AC1 Viết sai nét trong câu viết chưa kết thúc câu', async ({
    page,
  }) => {
    const { pad, position } = await openStrokeWrite(page, '十');
    const { vertical } = await readTenStrokes(page);

    await drawMedian(page, pad, vertical);

    await expect(mistakeAlert(page)).toBeVisible();
    await expect(verdict(page, 'Đúng')).toHaveCount(0);
    await expect(verdict(page, 'Sai')).toHaveCount(0);
    await expect(continueButton(page)).toHaveCount(0);
    await expect(progressText(page, position)).toBeVisible();
    await expect(pad).toHaveAttribute('data-completed-stroke-count', '0');
  });

  test('TC-S7.1-AC1-19: S7.1-AC1 Viết xong chữ thì câu được tính đúng', async ({
    page,
  }) => {
    const { pad, position } = await openStrokeWrite(page, '十');
    const { horizontal, vertical } = await readTenStrokes(page);

    await drawMedian(page, pad, vertical);
    await expect(mistakeAlert(page)).toBeVisible();
    await drawMedian(page, pad, horizontal);
    await expect(pad).toHaveAttribute('data-completed-stroke-count', '1');
    await expect(continueButton(page)).toHaveCount(0);
    await drawMedian(page, pad, vertical);

    await expect(verdict(page, 'Đúng')).toBeVisible();
    await expect(continueButton(page)).toBeVisible();
    await continueButton(page).click();
    await expect(progressText(page, position + 1)).toBeVisible();
  });

  test('TC-S7.1-AC1-22: S7.1-AC1 Câu viết đã Đúng thì khung bị khóa', async ({
    page,
  }) => {
    const { pad } = await openStrokeWrite(page, '十');
    const { horizontal, vertical } = await readTenStrokes(page);
    await drawMedian(page, pad, horizontal);
    await drawMedian(page, pad, vertical);
    await expect(verdict(page, 'Đúng')).toBeVisible();
    const strokesBefore = await visibleUserStrokeCount(pad);

    await drawMedian(page, pad, horizontal);
    await page.waitForTimeout(SETTLE_MS);

    await expect(page.getByRole('alert')).toHaveCount(0);
    await expect(pad).toHaveAttribute('data-completed-stroke-count', '2');
    expect(await visibleUserStrokeCount(pad)).toBeLessThanOrEqual(
      strokesBefore,
    );
    await expect(verdict(page, 'Đúng')).toBeVisible();
    await expect(continueButton(page)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Viết lại' })).toHaveCount(0);
  });

  test('TC-S7.1-AC1-21: lesson-runner Câu viết chỉ có kết quả Đúng', async ({
    page,
  }) => {
    const { pad } = await openStrokeWrite(page, '十');
    const { horizontal, vertical } = await readTenStrokes(page);

    for (let attempt = 0; attempt < MISTAKES_BEFORE_CORRECT; attempt += 1) {
      await drawMedian(page, pad, vertical);
      await expect(mistakeAlert(page)).toBeVisible();
      await expect(verdict(page, 'Sai')).toHaveCount(0);
      await expect(continueButton(page)).toHaveCount(0);
    }
    await drawMedian(page, pad, horizontal);
    await expect(pad).toHaveAttribute('data-completed-stroke-count', '1');
    await drawMedian(page, pad, vertical);

    await expect(verdict(page, 'Đúng')).toBeVisible();
    await expect(verdict(page, 'Đúng')).toHaveText(/^\W*Đúng$/);
    await expect(verdict(page, 'Sai')).toHaveCount(0);
    await expect(continueButton(page)).toBeVisible();
  });

  test('TC-S7.1-AC2-15: S7.1-AC2 Câu viết đã Đúng thì không còn liên kết Xem thứ tự nét', async ({
    page,
  }) => {
    const { pad } = await openStrokeWrite(page, '人');
    await expect(strokeOrderLink(page)).toBeVisible();
    const strokes = await readBuiltStrokes(page, '人');

    for (const median of await readMedians(page, '人')) {
      await drawMedian(page, pad, median);
    }

    await expect(pad).toHaveAttribute(
      'data-completed-stroke-count',
      String(strokes.length),
    );
    await expect(verdict(page, 'Đúng')).toBeVisible();
    await expect(continueButton(page)).toBeVisible();
    await expect(strokeOrderLink(page)).toHaveCount(0);
  });
});
