/** Helper e2e của câu viết trong bài "Nét cơ bản và thứ tự nét" (S7.1, task 7.6). */
import { toneOfPinyin } from '@csk/shared';
import { expect, type Locator, type Page } from '@playwright/test';

import {
  drawMedian,
  readBuiltMedians,
  waitForWriterReady,
  writingPad,
  type MedianPoint,
} from '../E6/writing-practice.helpers';
import {
  INTRO_LESSON_IDS,
  readBuiltLesson,
  readBuiltWords,
  seedCompletedLessons,
} from './intro-lessons.helpers';

export const WRITING_LESSON_ID = 'intro-10';
const WRITING_LESSON_URL = `/lessons/${WRITING_LESSON_ID}`;
/** "Tiến độ tới bài 10": bài 1–9 đã xong, bài 10 đang mở. */
const PROGRESS_TO_WRITING_LESSON = INTRO_LESSON_IDS.slice(0, 9);
const TONE_LABELS = {
  1: 'Thanh 1',
  2: 'Thanh 2',
  3: 'Thanh 3',
  4: 'Thanh 4',
  5: 'Thanh nhẹ',
} as const;
export const MISTAKE_MESSAGE = 'Sai nét. Viết lại nét này.';
/** Đủ cho thư viện chấm xong một lần nhả nếu nó có phản hồi. */
export const SETTLE_MS = 500;

const lessonExercises = readBuiltLesson(WRITING_LESSON_ID).exercises;
const words = readBuiltWords();
export const LESSON_TOTAL = lessonExercises.length;

const wordOf = (wordId: string) => {
  const word = words.find((item) => item.id === wordId);
  if (!word) {
    throw new Error(`Không có từ ${wordId} trong words.json.`);
  }
  return word;
};

/** Vị trí k (tính từ 1) của câu viết chữ `character` trong bài đã build. */
export const strokeWritePosition = (character: string): number => {
  const index = lessonExercises.findIndex(
    (exercise) =>
      exercise.kind === 'stroke-write' &&
      wordOf(exercise.wordId).hanzi === character,
  );
  if (index < 0) {
    throw new Error(
      `Bài ${WRITING_LESSON_ID} không có câu viết chữ ${character}.`,
    );
  }
  return index + 1;
};

export const progressText = (page: Page, position: number): Locator =>
  page.getByText(`Câu ${position} / ${LESSON_TOTAL}`, { exact: true });

const anyProgressText = (page: Page): Locator =>
  page.getByText(new RegExp(`^Câu \\d+ / ${LESSON_TOTAL}$`));

export const continueButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Tiếp tục' });

/** Kết quả của câu ("Đúng"/"Sai") hiện trong vùng trạng thái sau khi trả lời. */
export const verdict = (page: Page, text: 'Đúng' | 'Sai'): Locator =>
  page.getByRole('status').filter({ hasText: new RegExp(`(^|\\s)${text}$`) });

export const mistakeAlert = (page: Page): Locator =>
  page.getByRole('alert').filter({ hasText: MISTAKE_MESSAGE });

const currentPosition = async (page: Page): Promise<number> => {
  const text = (await anyProgressText(page).textContent()) ?? '';
  const match = /^Câu (\d+) \//.exec(text);
  if (!match?.[1]) {
    throw new Error(`Không đọc được tiến độ từ "${text}".`);
  }
  return Number(match[1]);
};

export const readMedians = async (
  page: Page,
  character: string,
): Promise<MedianPoint[][]> => readBuiltMedians(page, character);

/** Khung viết của chữ đang hiện, đã sẵn sàng nhận nét. */
export const readyPad = async (
  page: Page,
  character: string,
): Promise<Locator> => {
  const pad = writingPad(page, character);
  await expect(pad).toBeVisible();
  await pad.scrollIntoViewIfNeeded();
  await waitForWriterReady(pad);
  return pad;
};

/** Viết đủ các nét đúng thứ tự vào khung của chữ. */
export const writeCharacter = async (
  page: Page,
  character: string,
): Promise<void> => {
  const pad = await readyPad(page, character);
  for (const median of await readMedians(page, character)) {
    await drawMedian(page, pad, median);
  }
};

/** Trả lời đúng câu đang hiện (đọc vị trí từ "Câu k / n") rồi bấm "Tiếp tục". */
export const answerCurrentCorrectly = async (page: Page): Promise<void> => {
  await expect(anyProgressText(page)).toBeVisible();
  const position = await currentPosition(page);
  const exercise = lessonExercises[position - 1];
  if (!exercise) {
    throw new Error(`Không có câu ${position} trong bài.`);
  }
  if (exercise.kind === 'tone-choice') {
    const { pinyin } = wordOf(exercise.wordId);
    await page
      .getByRole('group', { name: 'Chọn thanh của âm tiết vừa nghe' })
      .getByRole('button', { name: TONE_LABELS[toneOfPinyin(pinyin)] })
      .click();
  } else if (exercise.kind === 'stroke-write') {
    await writeCharacter(page, wordOf(exercise.wordId).hanzi);
  } else {
    throw new Error(
      `Bài ${WRITING_LESSON_ID} có dạng ${exercise.kind} chưa xử lý.`,
    );
  }
  await expect(verdict(page, 'Đúng')).toBeVisible();
  await continueButton(page).click();
  await expect(
    progressText(page, position + 1).or(
      page.getByRole('heading', { level: 2 }),
    ),
  ).toBeVisible();
};

/** Làm đúng các câu trước câu viết chữ `character` (đã ở màn bài 10). */
export const answerUntilStrokeWrite = async (
  page: Page,
  character: string,
): Promise<number> => {
  const position = strokeWritePosition(character);
  await expect(anyProgressText(page)).toBeVisible();
  while ((await currentPosition(page)) < position) {
    await answerCurrentCorrectly(page);
  }
  await expect(progressText(page, position)).toBeVisible();
  return position;
};

/** Tiến độ tới bài 10, mở bài và đi tới câu viết chữ `character`; trả về khung và vị trí k. */
export const openStrokeWrite = async (
  page: Page,
  character: string,
): Promise<{ pad: Locator; position: number }> => {
  await seedCompletedLessons(page, PROGRESS_TO_WRITING_LESSON);
  await page.goto(WRITING_LESSON_URL);
  const position = await answerUntilStrokeWrite(page, character);
  const pad = await readyPad(page, character);
  return { pad, position };
};

export const openWritingLesson = async (page: Page): Promise<void> => {
  await seedCompletedLessons(page, PROGRESS_TO_WRITING_LESSON);
  await page.goto(WRITING_LESSON_URL);
  await expect(progressText(page, 1)).toBeVisible();
};

/** Hai median của 十: nét ngang rồi nét sổ. */
export const readTenStrokes = async (
  page: Page,
): Promise<{ horizontal: MedianPoint[]; vertical: MedianPoint[] }> => {
  const [horizontal, vertical] = await readMedians(page, '十');
  if (!horizontal || !vertical) {
    throw new Error('File nét của 十 phải có 2 median.');
  }
  return { horizontal, vertical };
};
