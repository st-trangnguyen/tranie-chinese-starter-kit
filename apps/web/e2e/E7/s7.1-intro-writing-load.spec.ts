import { expect, test, type Locator, type Page } from '@playwright/test';

import { strokeOrderLink, writingPad } from '../E6/writing-practice.helpers';
import {
  FINISHED_MESSAGE,
  INTRO_LESSON_IDS,
  LEARNING_PATH_URL,
  pathLessonStatuses,
  readBuiltLesson,
  skipButton,
} from './intro-lessons.helpers';
import {
  LESSON_TOTAL,
  WRITING_LESSON_ID,
  answerCurrentCorrectly,
  answerUntilStrokeWrite,
  continueButton,
  openWritingLesson,
  progressText,
} from './intro-writing.helpers';

/** Mở bài 10 và đi qua các câu trước câu viết (vẽ từng nét) cần lâu hơn mặc định 30 s. */
const WRITING_TEST_TIMEOUT_MS = 90_000;
const LOADING_MESSAGE = 'Đang tải…';
const ERROR_MESSAGE = 'Có lỗi xảy ra';
const UNAVAILABLE_MESSAGE = 'Chưa có dữ liệu nét cho chữ này.';
const COMPLETED_LABEL = 'Đã xong';
const WRITING_LESSON_INDEX = INTRO_LESSON_IDS.indexOf(WRITING_LESSON_ID);
const STROKE_WRITE_POSITIONS = readBuiltLesson(WRITING_LESSON_ID)
  .exercises.map((exercise, index) =>
    exercise.kind === 'stroke-write' ? index + 1 : 0,
  )
  .filter((position) => position > 0);

const isStrokeFile = (url: URL, character: string): boolean =>
  decodeURIComponent(url.pathname) === `/content/strokes/${character}.json`;

const isAnyStrokeFile = (url: URL): boolean =>
  url.pathname.startsWith('/content/strokes/');

const anyPad = (page: Page): Locator =>
  page.getByRole('figure', { name: /^Khung viết chữ / });

const retryButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Thử lại' });

const expectLoadError = async (page: Page): Promise<void> => {
  await expect(page.getByText(ERROR_MESSAGE)).toBeVisible();
  await expect(retryButton(page)).toBeVisible();
  await expect(skipButton(page)).toBeVisible();
  await expect(anyPad(page)).toHaveCount(0);
  await expect(strokeOrderLink(page)).toHaveCount(0);
  await expect(page.getByText(UNAVAILABLE_MESSAGE)).toHaveCount(0);
};

const currentPositionOf = async (page: Page): Promise<number> => {
  const text =
    (await page
      .getByText(new RegExp(`^Câu \\d+ / ${LESSON_TOTAL}$`))
      .textContent()) ?? '';
  const match = /^Câu (\d+) \//.exec(text);
  if (!match?.[1]) {
    throw new Error(`Không đọc được tiến độ từ "${text}".`);
  }
  return Number(match[1]);
};

test.describe('S7.1 Soạn 12 bài Nhập môn — câu viết khi tải dữ liệu nét', () => {
  // page.route không chặn được request do service worker phục vụ (design "Test").
  test.use({ serviceWorkers: 'block' });

  test.beforeEach(() => {
    test.setTimeout(WRITING_TEST_TIMEOUT_MS);
  });

  test('TC-S7.1-AC1-24: S7.1-AC1 Câu viết đang tải dữ liệu nét', async ({
    page,
  }) => {
    let releaseRequests: () => void = () => undefined;
    const released = new Promise<void>((resolve) => {
      releaseRequests = resolve;
    });
    await page.route(
      (url) => isStrokeFile(url, '人'),
      async (route) => {
        await released;
        await route.continue();
      },
    );

    await openWritingLesson(page);
    await answerUntilStrokeWrite(page, '人');

    await expect(page.getByText(LOADING_MESSAGE)).toBeVisible();
    await expect(anyPad(page)).toHaveCount(0);
    await expect(strokeOrderLink(page)).toHaveCount(0);
    await expect(continueButton(page)).toHaveCount(0);

    releaseRequests();

    await expect(writingPad(page, '人')).toBeVisible();
    await expect(page.getByText(LOADING_MESSAGE)).toHaveCount(0);
  });

  test('TC-S7.1-AC1-25: S7.1-AC1 Câu viết tải dữ liệu nét lỗi', async ({
    page,
  }) => {
    await page.route(
      (url) => isStrokeFile(url, '人'),
      (route) => route.abort(),
    );

    await openWritingLesson(page);
    await answerUntilStrokeWrite(page, '人');

    await expectLoadError(page);
  });

  test('TC-S7.1-AC1-27: S7.1-AC1 Câu viết thử lại sau khi tải lỗi', async ({
    page,
  }) => {
    const blockRen = (url: URL): boolean => isStrokeFile(url, '人');
    await page.route(blockRen, (route) => route.abort());

    await openWritingLesson(page);
    await answerUntilStrokeWrite(page, '人');
    await expectLoadError(page);

    await page.unroute(blockRen);
    await retryButton(page).click();

    await expect(page.getByText(ERROR_MESSAGE)).toHaveCount(0);
    await expect(writingPad(page, '人')).toBeVisible();
    await expect(strokeOrderLink(page)).toBeVisible();
    await expect(skipButton(page)).toHaveCount(0);
  });

  test('TC-S7.1-AC1-28: S7.1-AC1 Câu viết tải lỗi rồi bỏ qua', async ({
    page,
  }) => {
    const [firstStrokeWrite] = STROKE_WRITE_POSITIONS;
    expect(firstStrokeWrite).toBeDefined();
    expect(firstStrokeWrite).toBeLessThan(LESSON_TOTAL);
    await page.route(isAnyStrokeFile, (route) => route.abort());

    await openWritingLesson(page);

    let skippedCount = 0;
    for (let position = 1; position <= LESSON_TOTAL; position += 1) {
      await expect(progressText(page, position)).toBeVisible();
      expect(await currentPositionOf(page)).toBe(position);
      if (STROKE_WRITE_POSITIONS.includes(position)) {
        await expectLoadError(page);
        await skipButton(page).click();
        skippedCount += 1;
        if (position < LESSON_TOTAL) {
          await expect(progressText(page, position + 1)).toBeVisible();
        }
      } else {
        await answerCurrentCorrectly(page);
      }
    }

    expect(skippedCount).toBe(STROKE_WRITE_POSITIONS.length);
    await expect(
      page.getByText(`Bạn đã bỏ qua ${skippedCount} câu, bài chưa hoàn thành.`),
    ).toBeVisible();
    await expect(page.getByText(FINISHED_MESSAGE)).toHaveCount(0);

    await page.goto(LEARNING_PATH_URL);
    const status = pathLessonStatuses(page).nth(WRITING_LESSON_INDEX);
    await expect(status).toBeVisible();
    await expect(status).not.toHaveText(COMPLETED_LABEL);
  });
});
