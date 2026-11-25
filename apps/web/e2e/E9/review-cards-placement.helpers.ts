/**
 * Helper e2e S9.1 cho bài kiểm tra (cuối chủ đề, vượt cấp) trên lộ trình mẫu
 * (`s9.1-review-cards-placement*.spec.ts`): trả lời đúng mọi câu để đạt bài kiểm tra.
 */
import { toneOfPinyin, type Word } from '@csk/shared';
import { expect, type Page } from '@playwright/test';

import { readBuiltWords } from '../E7/intro-lessons.helpers';
import { continueButton, verdict } from '../E7/intro-writing.helpers';
import { unitSection } from '../E8/offline-audio.helpers';
import { alertsOutsideBackup } from '../E8/settings.helpers';

import { openReviewPath } from './review-cards-lesson.helpers';
import {
  findReviewLesson,
  REVIEW_LESSON_IDS,
  REVIEW_UNIT_TITLES,
  withExtraWords,
  type ReviewLessonKey,
} from './review-cards.content';

export const PASSED_MESSAGE = 'Bạn đã đạt';
const PLACEMENT_LINK_LABEL = 'Kiểm tra vượt cấp';
const TONE_LABELS = {
  1: 'Thanh 1',
  2: 'Thanh 2',
  3: 'Thanh 3',
  4: 'Thanh 4',
  5: 'Thanh nhẹ',
} as const;

const words = withExtraWords(readBuiltWords());

const wordOf = (wordId: string): Word => {
  const word = words.find((item) => item.id === wordId);
  if (!word) {
    throw new Error(`Không có từ ${wordId} trong words.json mẫu.`);
  }
  return word;
};

const progressPosition = async (page: Page): Promise<number> => {
  const progress = page.getByText(/^Câu \d+ \/ \d+$/);
  await expect(progress).toBeVisible();
  const match = /^Câu (\d+) \//.exec((await progress.textContent()) ?? '');
  if (!match?.[1]) {
    throw new Error('Không đọc được tiến độ "Câu k / n".');
  }
  return Number(match[1]);
};

/** Trả lời đúng câu đang hiện của bài mẫu `key` (chỉ tone-choice, pinyin-type) rồi "Tiếp tục". */
const answerCorrectly = async (
  page: Page,
  key: ReviewLessonKey,
): Promise<void> => {
  const position = await progressPosition(page);
  const exercise = findReviewLesson(REVIEW_LESSON_IDS[key])?.exercises[
    position - 1
  ];
  if (exercise?.kind === 'tone-choice') {
    const { pinyin } = wordOf(exercise.wordId);
    await page
      .getByRole('group', { name: 'Chọn thanh của âm tiết vừa nghe' })
      .getByRole('button', { name: TONE_LABELS[toneOfPinyin(pinyin)] })
      .click();
  } else if (exercise?.kind === 'pinyin-type') {
    await page
      .getByRole('textbox', { name: 'Gõ pinyin của âm vừa nghe' })
      .fill(wordOf(exercise.wordId).pinyin);
    await page.getByRole('button', { name: 'Kiểm tra' }).click();
  } else {
    throw new Error(`Câu ${position} của bài ${key} chưa xử lý được.`);
  }
  await expect(verdict(page, 'Đúng')).toBeVisible();
  await continueButton(page).click();
};

const DB_NAME = 'tranie-chinese';

/** `lessonId` của các bài có trạng thái `completed` trong bảng `lessonProgress`. */
const readCompletedLessonIds = (page: Page): Promise<string[]> =>
  page.evaluate(
    (dbName) =>
      new Promise<string[]>((resolve, reject) => {
        const request = indexedDB.open(dbName);
        request.onerror = () => reject(new Error('Không mở được IndexedDB.'));
        request.onsuccess = () => {
          const db = request.result;
          const getAll = db
            .transaction('lessonProgress', 'readonly')
            .objectStore('lessonProgress')
            .getAll();
          getAll.onsuccess = () => {
            db.close();
            const rows: unknown[] = getAll.result;
            resolve(
              rows.flatMap((row) =>
                typeof row === 'object' &&
                row !== null &&
                Reflect.get(row, 'status') === 'completed'
                  ? [String(Reflect.get(row, 'lessonId'))]
                  : [],
              ),
            );
          };
          getAll.onerror = () => {
            db.close();
            reject(new Error('Không đọc được bảng "lessonProgress".'));
          };
        };
      }),
    DB_NAME,
  );

/**
 * Chờ app ghi xong "đã xong" cho các bài `keys` (ghi chạy sau khi màn tổng kết hiện): rời trang
 * trước đó thì lượt ghi bị cắt.
 */
export const expectLessonsSaved = async (
  page: Page,
  keys: readonly ReviewLessonKey[],
): Promise<void> => {
  await expect
    .poll(() => readCompletedLessonIds(page))
    .toEqual(expect.arrayContaining(keys.map((key) => REVIEW_LESSON_IDS[key])));
};

/** Ở màn bài kiểm tra `key` đang mở, trả lời đúng mọi câu tới màn "Bạn đã đạt", không lỗi. */
export const passOpenedTest = async (
  page: Page,
  key: ReviewLessonKey,
): Promise<void> => {
  const passed = page.getByText(PASSED_MESSAGE);
  const total = findReviewLesson(REVIEW_LESSON_IDS[key])?.exercises.length;
  for (let answered = 0; answered < (total ?? 0); answered += 1) {
    await answerCorrectly(page, key);
  }
  await expect(passed).toBeVisible();
  await expect(alertsOutsideBackup(page)).toHaveCount(0);
};

/** Từ màn Lộ trình, bấm "Kiểm tra vượt cấp" của chủ đề mẫu VC và đạt bài kiểm tra. */
export const passVcPlacementTest = async (page: Page): Promise<void> => {
  await openReviewPath(page);
  await unitSection(page, REVIEW_UNIT_TITLES.vc)
    .getByRole('link', { name: PLACEMENT_LINK_LABEL })
    .click();
  await expect(page).toHaveURL(/\/units\/s91-unit-vc\/placement-test$/);
  await passOpenedTest(page, 'vcTest');
  await expectLessonsSaved(page, ['vc1', 'vc2', 'vcTest']);
};
