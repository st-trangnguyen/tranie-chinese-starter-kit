import { expect, test, type Page } from '@playwright/test';

import { strokeOrderPath } from '../E6/stroke-order.helpers';
import {
  drawMedian,
  isEscapedPath,
  outlineStrokes,
  readBuiltStrokes,
  strokeOrderLink,
  tabUntilFocused,
  writingPad,
  writingPracticeLink,
  writingPracticePath,
} from '../E6/writing-practice.helpers';
import {
  LESSON_TOTAL,
  answerCurrentCorrectly,
  answerUntilStrokeWrite,
  openStrokeWrite,
  openWritingLesson,
  progressText,
  readyPad,
  readTenStrokes,
  strokeWritePosition,
} from './intro-writing.helpers';

/** Mở bài 10 và đi qua các câu trước câu viết (vẽ từng nét) cần lâu hơn mặc định 30 s. */
const WRITING_TEST_TIMEOUT_MS = 90_000;
/** "Để màn mở ít nhất 2 phút trước khi tới câu k" (TC-S7.1-AC2-10). */
const TIME_BEFORE_STROKE_WRITE = '02:30';
const SUMMARY_TIME_LIMIT_SECONDS = 120;
const SECONDS_PER_MINUTE = 60;

const strokeOrderFigure = (page: Page, character: string) =>
  page.getByRole('img', { name: `Thứ tự nét chữ ${character}` });

const expectStrokeOrderScreen = async (
  page: Page,
  character: string,
): Promise<void> => {
  await expect
    .poll(() => isEscapedPath(page, strokeOrderPath(character)))
    .toBe(true);
  await expect(strokeOrderFigure(page, character)).toBeVisible();
  await expect(writingPracticeLink(page)).toBeVisible();
};

/** Giây của chuỗi thời gian "m:ss" trên màn tổng kết. */
const toSeconds = (text: string): number => {
  const match = /^(\d+):(\d{2})$/.exec(text.trim());
  if (!match?.[1] || !match[2]) {
    throw new Error(`Thời gian "${text}" không đúng dạng m:ss.`);
  }
  return Number(match[1]) * SECONDS_PER_MINUTE + Number(match[2]);
};

test.describe('S7.1 Soạn 12 bài Nhập môn — từ câu viết sang màn thứ tự nét', () => {
  test.beforeEach(() => {
    test.setTimeout(WRITING_TEST_TIMEOUT_MS);
  });

  test('TC-S7.1-AC2-4: S7.1-AC2 Từ câu viết mở màn xem thứ tự nét', async ({
    page,
  }) => {
    await openStrokeWrite(page, '人');

    await strokeOrderLink(page).click();

    await expectStrokeOrderScreen(page, '人');
  });

  test('TC-S7.1-AC2-5: S7.1-AC2 Từ bài vào luyện viết qua màn thứ tự nét', async ({
    page,
  }) => {
    await openStrokeWrite(page, '人');
    await strokeOrderLink(page).click();
    await expectStrokeOrderScreen(page, '人');
    const strokes = await readBuiltStrokes(page, '人');

    await writingPracticeLink(page).click();

    await expect
      .poll(() => isEscapedPath(page, writingPracticePath('人')))
      .toBe(true);
    const pad = writingPad(page, '人');
    await expect(pad).toBeVisible();
    await expect(outlineStrokes(pad)).toHaveCount(strokes.length);
  });

  test('TC-S7.1-AC2-6: S7.1-AC2 Quay lại bài từ màn thứ tự nét', async ({
    page,
  }) => {
    const { pad, position } = await openStrokeWrite(page, '十');
    const { horizontal } = await readTenStrokes(page);
    await drawMedian(page, pad, horizontal);
    await expect(pad).toHaveAttribute('data-completed-stroke-count', '1');

    await strokeOrderLink(page).click();
    await expectStrokeOrderScreen(page, '十');
    await page.goBack();

    await expect(progressText(page, position)).toBeVisible();
    const padAgain = await readyPad(page, '十');
    await expect(padAgain).toHaveAttribute('data-completed-stroke-count', '0');
  });

  test('TC-S7.1-AC2-8: S7.1-AC2 Liên kết Xem thứ tự nét dùng được bằng bàn phím', async ({
    page,
  }) => {
    await openStrokeWrite(page, '人');
    const link = strokeOrderLink(page);

    await tabUntilFocused(page, link);
    await page.keyboard.press('Enter');

    await expectStrokeOrderScreen(page, '人');
  });

  test('TC-S7.1-AC2-10: S7.1-AC2 Quay lại bài thì tổng kết chỉ tính từ câu viết đó', async ({
    page,
  }) => {
    await page.clock.install();
    const position = strokeWritePosition('人');
    const remaining = LESSON_TOTAL - position + 1;

    await openWritingLesson(page);
    await page.clock.fastForward(TIME_BEFORE_STROKE_WRITE);
    await answerUntilStrokeWrite(page, '人');
    await readyPad(page, '人');
    await strokeOrderLink(page).click();
    await expectStrokeOrderScreen(page, '人');
    await page.goBack();
    await expect(progressText(page, position)).toBeVisible();

    for (let answered = 0; answered < remaining; answered += 1) {
      await answerCurrentCorrectly(page);
    }

    await expect(
      page.getByText(`Đúng ${remaining} / ${remaining} câu`, { exact: true }),
    ).toBeVisible();
    await expect(page.getByText('Sai 0 câu', { exact: true })).toBeVisible();
    const timeText = await page.getByText(/^\d+:\d{2}$/).textContent();
    expect(toSeconds(timeText ?? '')).toBeLessThan(SUMMARY_TIME_LIMIT_SECONDS);
  });
});
