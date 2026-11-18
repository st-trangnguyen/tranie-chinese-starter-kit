import { toneOfPinyin, type Tone } from '@csk/shared';
import { expect, test, type Locator, type Page } from '@playwright/test';

import {
  completeOnboarding,
  readBuiltLesson,
  readBuiltWords,
} from './intro-lessons.helpers';
import {
  continueButton,
  openStrokeWrite,
  verdict,
} from './intro-writing.helpers';

const LESSON_ID = 'intro-01';
const TONE_LABELS: Record<Tone, string> = {
  1: 'Thanh 1',
  2: 'Thanh 2',
  3: 'Thanh 3',
  4: 'Thanh 4',
  5: 'Thanh nhẹ',
};
const ALL_TONES: readonly Tone[] = [1, 2, 3, 4, 5];
/** Mở bài 10 và đi qua các câu trước câu viết (vẽ từng nét) cần lâu hơn mặc định 30 s. */
const WRITING_TEST_TIMEOUT_MS = 90_000;

const lessonExercises = readBuiltLesson(LESSON_ID).exercises;
const words = readBuiltWords();
const LESSON_TOTAL = lessonExercises.length;

const correctToneAt = (index: number): Tone => {
  const exercise = lessonExercises[index];
  if (exercise?.kind !== 'tone-choice') {
    throw new Error(
      `Câu ${index + 1} của bài ${LESSON_ID} không phải tone-choice.`,
    );
  }
  const word = words.find((item) => item.id === exercise.wordId);
  if (!word) {
    throw new Error(`Không có từ ${exercise.wordId} trong words.json.`);
  }
  return toneOfPinyin(word.pinyin);
};

const FIRST_TONE_INDEX = lessonExercises.findIndex(
  (exercise) => exercise.kind === 'tone-choice',
);

const otherTone = (tone: Tone): Tone => {
  const other = ALL_TONES.find((item) => item !== tone);
  if (!other) {
    throw new Error('Phải có thanh khác thanh đúng.');
  }
  return other;
};

const toneGroup = (page: Page): Locator =>
  page.getByRole('group', { name: 'Chọn thanh của âm tiết vừa nghe' });

const toneButton = (page: Page, tone: Tone): Locator =>
  toneGroup(page).getByRole('button', { name: TONE_LABELS[tone], exact: true });

const progressText = (page: Page, position: number): Locator =>
  page.getByText(`Câu ${position} / ${LESSON_TOTAL}`, { exact: true });

/** Onboarding đưa thẳng vào bài "Thanh 1–4", câu tone-choice đầu tiên đang hiện. */
const openFirstToneQuestion = async (page: Page): Promise<number> => {
  await completeOnboarding(page);
  await expect(page).toHaveURL(new RegExp(`/lessons/${LESSON_ID}$`));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Thanh 1–4');
  const position = FIRST_TONE_INDEX + 1;
  expect(position).toBe(1);
  await expect(progressText(page, position)).toBeVisible();
  await expect(toneGroup(page)).toBeVisible();
  return position;
};

const expectNoResult = async (page: Page): Promise<void> => {
  await expect(verdict(page, 'Đúng')).toHaveCount(0);
  await expect(verdict(page, 'Sai')).toHaveCount(0);
  await expect(continueButton(page)).toHaveCount(0);
};

test.describe('S3.2-AC2 Màn bài báo kết quả ngay sau khi trả lời (12 bài Nhập môn)', () => {
  test('TC-S3.2-AC2-1: S3.2-AC2 Trả lời đúng được báo ngay', async ({
    page,
  }) => {
    const position = await openFirstToneQuestion(page);

    await toneButton(page, correctToneAt(FIRST_TONE_INDEX)).click();

    await expect(verdict(page, 'Đúng')).toBeVisible();
    await expect(verdict(page, 'Sai')).toHaveCount(0);
    await expect(continueButton(page)).toBeVisible();
    await expect(progressText(page, position)).toBeVisible();
  });

  test('TC-S3.2-AC2-2: S3.2-AC2 Trả lời sai được báo ngay', async ({
    page,
  }) => {
    const position = await openFirstToneQuestion(page);

    await toneButton(page, otherTone(correctToneAt(FIRST_TONE_INDEX))).click();

    await expect(verdict(page, 'Sai')).toBeVisible();
    await expect(verdict(page, 'Đúng')).toHaveCount(0);
    await expect(continueButton(page)).toBeVisible();
    await expect(progressText(page, position)).toBeVisible();
  });

  test('TC-S3.2-AC2-3: S3.2-AC2 Trả lời xong thì không trả lời lại được', async ({
    page,
  }) => {
    const position = await openFirstToneQuestion(page);
    const correctTone = correctToneAt(FIRST_TONE_INDEX);
    await toneButton(page, correctTone).click();
    await expect(verdict(page, 'Đúng')).toBeVisible();

    await toneButton(page, otherTone(correctTone)).click({ force: true });

    await expect(verdict(page, 'Đúng')).toBeVisible();
    await expect(verdict(page, 'Sai')).toHaveCount(0);
    await expect(progressText(page, position)).toBeVisible();

    await continueButton(page).click();
    await expect(progressText(page, position + 1)).toBeVisible();
    await expectNoResult(page);
    for (const tone of ALL_TONES) {
      await expect(toneButton(page, tone)).toBeEnabled();
    }
    await toneButton(page, correctToneAt(position)).click();
    await expect(verdict(page, 'Đúng')).toBeVisible();
  });

  test('TC-S3.2-AC2-4: S3.2-AC2 Chưa trả lời thì chưa có kết quả (câu đầu bài 1)', async ({
    page,
  }) => {
    await openFirstToneQuestion(page);

    await expectNoResult(page);
  });

  test('TC-S3.2-AC2-4: S3.2-AC2 Chưa trả lời thì chưa có kết quả (câu viết 人 bài 10)', async ({
    page,
  }) => {
    test.setTimeout(WRITING_TEST_TIMEOUT_MS);
    const { pad } = await openStrokeWrite(page, '人');
    await expect(pad).toHaveAttribute('data-completed-stroke-count', '0');

    await expectNoResult(page);
  });
});
