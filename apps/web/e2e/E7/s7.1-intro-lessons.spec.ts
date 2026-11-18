import { expect, test } from '@playwright/test';

import {
  FINISHED_MESSAGE,
  INTRO_LESSON_IDS,
  INTRO_LESSON_TITLES,
  INTRO_STAGE_TITLE,
  INTRO_UNIT_TITLE,
  LEARNING_PATH_URL,
  answerCurrentQuestion,
  completeOnboarding,
  currentQuestion,
  firstStage,
  listenButton,
  pathLessonItems,
  pathLessonStatuses,
  pathLessonTitles,
  readBuiltLesson,
  readBuiltWords,
  seedCompletedLessons,
  skipButton,
  unsupportedMessage,
} from './intro-lessons.helpers';

const LESSON_COUNT = INTRO_LESSON_TITLES.length;
/** Mọi bài trừ bài cuối đã xong: cả 12 bài là liên kết mở được trên lộ trình. */
const ALL_OPEN_PROGRESS = INTRO_LESSON_IDS.slice(0, -1);
/** Đi qua 12 bài trong một test cần lâu hơn mặc định 30 s. */
const TWELVE_LESSONS_TIMEOUT_MS = 180_000;
/** Làm hết một bài (có câu viết vẽ từng nét) cần lâu hơn mặc định 30 s. */
const ONE_LESSON_TIMEOUT_MS = 120_000;
const WRITING_LESSON_ID = 'intro-10';
const RADICALS_LESSON_ID = 'intro-11';

/** Chữ của từng câu viết trong bài đã build, đúng thứ tự câu (theo `word.hanzi`). */
const builtStrokeWriteCharacters = (lessonId: string): string[] => {
  const words = readBuiltWords();
  return readBuiltLesson(lessonId).exercises.flatMap((exercise) => {
    if (exercise.kind !== 'stroke-write') {
      return [];
    }
    const word = words.find((item) => item.id === exercise.wordId);
    return word ? [word.hanzi] : [];
  });
};

/** Tên test: S7.1-AC1 "Không bài nào có câu phải bỏ qua"; bài 10 phủ thêm TC-S7.1-AC1-23. */
const noSkipTestName = (index: number): string => {
  const base = `TC-S7.1-AC1-2: S7.1-AC1 Không bài nào có câu phải bỏ qua — bài ${index + 1} "${INTRO_LESSON_TITLES[index]}"`;
  return INTRO_LESSON_IDS[index] === WRITING_LESSON_ID
    ? `${base} · TC-S7.1-AC1-23: S7.1-AC1 Làm hết bài có câu viết thì bài Đã xong`
    : base;
};

test.describe('S7.1 Soạn 12 bài Nhập môn', () => {
  test('TC-S7.1-AC2-11: S7.1-AC2 Lộ trình có đủ 12 bài Nhập môn đúng thứ tự', async ({
    page,
  }) => {
    await completeOnboarding(page);
    await page.goto(LEARNING_PATH_URL);

    const stage = firstStage(page);
    await expect(stage.getByRole('heading', { level: 2 })).toHaveText(
      INTRO_STAGE_TITLE,
    );
    await expect(stage.getByRole('heading', { level: 3 })).toHaveText([
      INTRO_UNIT_TITLE,
    ]);
    await expect(pathLessonItems(page)).toHaveCount(LESSON_COUNT);
    await expect(pathLessonTitles(page)).toHaveText([...INTRO_LESSON_TITLES]);
  });

  test('TC-S7.1-AC2-13: S7.1-AC2 Không còn bài mẫu cũ', async ({ page }) => {
    await completeOnboarding(page);
    await page.goto(LEARNING_PATH_URL);

    await expect(pathLessonTitles(page).first()).toBeVisible();
    await expect(page.getByText('Bốn thanh điệu')).toHaveCount(0);
  });

  test('TC-S7.1-AC2-14: S7.1-AC2 Tiêu đề trên màn bài khớp lộ trình', async ({
    page,
  }) => {
    test.setTimeout(TWELVE_LESSONS_TIMEOUT_MS);
    await seedCompletedLessons(page, ALL_OPEN_PROGRESS);
    await page.goto(LEARNING_PATH_URL);
    await expect(pathLessonItems(page)).toHaveCount(LESSON_COUNT);

    for (let index = 0; index < LESSON_COUNT; index += 1) {
      await test.step(`bài ${index + 1}`, async () => {
        await page.goto(LEARNING_PATH_URL);
        const link = pathLessonItems(page).nth(index).getByRole('link');
        const pathTitle = await link
          .locator('.learning-path-lesson-title')
          .textContent();
        expect(pathTitle).toBe(INTRO_LESSON_TITLES[index]);

        await link.click();
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(
          pathTitle ?? '',
        );
      });
    }
  });

  test('TC-S7.1-AC4-1: S7.1-AC4 Xong onboarding vào thẳng bài "Thanh 1–4"', async ({
    page,
  }) => {
    const total = readBuiltLesson('intro-01').exercises.length;

    await completeOnboarding(page);

    await expect(page).toHaveURL(/\/lessons\/intro-01$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Thanh 1–4',
    );
    await expect(
      page.getByText(`Câu 1 / ${total}`, { exact: true }),
    ).toBeVisible();
  });

  test('TC-S7.1-AC4-3: S7.1-AC4 Bài 1 đang mở trên lộ trình', async ({
    page,
  }) => {
    await completeOnboarding(page);
    await page.goto(LEARNING_PATH_URL);

    await expect(pathLessonTitles(page).first()).toHaveText('Thanh 1–4');
    await expect(pathLessonStatuses(page)).toHaveText([
      'Đang mở',
      ...Array.from({ length: LESSON_COUNT - 1 }, () => 'Đã khóa'),
    ]);
  });

  test('TC-S7.1-AC1-4: S7.1-AC1 Mỗi bài có câu nghe', async ({ page }) => {
    test.setTimeout(TWELVE_LESSONS_TIMEOUT_MS);
    await seedCompletedLessons(page, ALL_OPEN_PROGRESS);
    await page.goto(LEARNING_PATH_URL);
    await expect(pathLessonItems(page)).toHaveCount(LESSON_COUNT);

    for (let index = 0; index < LESSON_COUNT; index += 1) {
      await test.step(`bài ${index + 1}`, async () => {
        await page.goto(LEARNING_PATH_URL);
        await pathLessonItems(page).nth(index).getByRole('link').click();
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(
          INTRO_LESSON_TITLES[index],
        );

        const total = readBuiltLesson(INTRO_LESSON_IDS[index] ?? '').exercises
          .length;
        let hasListen = false;
        for (let question = 1; question <= total && !hasListen; question += 1) {
          await expect(
            page.getByText(`Câu ${question} / ${total}`, { exact: true }),
          ).toBeVisible();
          hasListen = await listenButton(page).isVisible();
          if (!hasListen) {
            await answerCurrentQuestion(page);
          }
        }
        if (!hasListen) {
          await expect(page.getByText(FINISHED_MESSAGE)).toBeVisible();
        }
        expect(hasListen, `bài ${INTRO_LESSON_TITLES[index]} có nút Nghe`).toBe(
          true,
        );
      });
    }
  });
  INTRO_LESSON_IDS.forEach((lessonId, index) => {
    test(noSkipTestName(index), async ({ page }) => {
      test.setTimeout(ONE_LESSON_TIMEOUT_MS);
      await seedCompletedLessons(page, INTRO_LESSON_IDS.slice(0, index));
      await page.goto(LEARNING_PATH_URL);
      await pathLessonItems(page).nth(index).getByRole('link').click();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        INTRO_LESSON_TITLES[index],
      );

      const total = readBuiltLesson(lessonId).exercises.length;
      const padCharacters: string[] = [];
      for (let question = 1; question <= total; question += 1) {
        await expect(
          page.getByText(`Câu ${question} / ${total}`, { exact: true }),
        ).toBeVisible();
        await expect(
          currentQuestion(page)
            .or(unsupportedMessage(page))
            .or(skipButton(page))
            .first(),
        ).toBeVisible();
        await expect(unsupportedMessage(page)).toHaveCount(0);
        await expect(skipButton(page)).toHaveCount(0);

        const character = await answerCurrentQuestion(page);
        if (character !== null) {
          padCharacters.push(character);
        }
      }

      await expect(page.getByText(FINISHED_MESSAGE)).toBeVisible();
      await expect(page.getByText(/Bạn đã bỏ qua/)).toHaveCount(0);

      if (lessonId === WRITING_LESSON_ID) {
        expect(padCharacters).toEqual(expect.arrayContaining(['人', '十']));
      }
      if (lessonId === RADICALS_LESSON_ID) {
        const expected = builtStrokeWriteCharacters(RADICALS_LESSON_ID);
        expect(expected.length).toBeGreaterThanOrEqual(1);
        expect(padCharacters).toEqual(expected);
      }

      await page.goto(LEARNING_PATH_URL);
      await expect(pathLessonItems(page)).toHaveCount(LESSON_COUNT);
      if (index === LESSON_COUNT - 1) {
        await expect(pathLessonStatuses(page)).toHaveText(
          Array.from({ length: LESSON_COUNT }, () => 'Đã xong'),
        );
      } else {
        await expect(pathLessonStatuses(page).nth(index)).toHaveText('Đã xong');
        await expect(pathLessonStatuses(page).nth(index + 1)).toHaveText(
          'Đang mở',
        );
      }
    });
  });
});
