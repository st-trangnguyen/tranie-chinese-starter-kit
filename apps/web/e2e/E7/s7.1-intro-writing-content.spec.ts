import { hanCharacterSchema } from '@csk/shared';
import { expect, test, type Locator, type Page } from '@playwright/test';

import { UNAVAILABLE_MESSAGE } from '../E6/writing-practice.helpers';
import {
  INTRO_LESSON_IDS,
  INTRO_LESSON_TITLES,
  answerCurrentQuestion,
  currentQuestion,
  readBuiltLesson,
  readBuiltWords,
  seedCompletedLessons,
} from './intro-lessons.helpers';

/** Mọi bài trừ bài cuối đã xong: cả 12 bài mở được. */
const ALL_OPEN_PROGRESS = INTRO_LESSON_IDS.slice(0, -1);
const STROKES_LESSON_ID = 'intro-10';
const RADICALS_LESSON_ID = 'intro-11';
const PAD_LABEL_PREFIX = 'Khung viết chữ ';
/** Bài có câu viết (vẽ từng nét) cần lâu hơn mặc định 30 s. */
const ONE_LESSON_TIMEOUT_MS = 120_000;

const words = readBuiltWords();

const hanziOf = (wordId: string): string => {
  const word = words.find((item) => item.id === wordId);
  if (!word) {
    throw new Error(`Không có từ ${wordId} trong words.json.`);
  }
  return word.hanzi;
};

/** Chữ của các câu viết trong bài đã build, đúng thứ tự (theo `word.hanzi`). */
const builtStrokeWriteCharacters = (lessonId: string): string[] =>
  readBuiltLesson(lessonId).exercises.flatMap((exercise) =>
    exercise.kind === 'stroke-write' ? [hanziOf(exercise.wordId)] : [],
  );

const progressText = (page: Page, position: number, total: number): Locator =>
  page.getByText(`Câu ${position} / ${total}`, { exact: true });

const writingPads = (page: Page): Locator =>
  page.getByRole('figure', { name: new RegExp(`^${PAD_LABEL_PREFIX}`) });

const unavailableMessage = (page: Page): Locator =>
  page.getByText(UNAVAILABLE_MESSAGE);

interface LessonWalk {
  /** `aria-label` của khung viết ở từng câu viết, theo thứ tự gặp. */
  padLabels: string[];
  /** Chữ `answerCurrentQuestion` trả về ở từng câu viết. */
  characters: string[];
}

/**
 * Mở bài (tiến độ mở hết 12 bài) và đi qua mọi câu bằng `answerCurrentQuestion`. Ở mỗi câu: chờ
 * phần trả lời hoặc thông báo không có dữ liệu nét hiện ra, khẳng định không có thông báo đó, rồi
 * ghi nhãn khung viết (nếu có) trước khi trả lời.
 */
const walkLesson = async (
  page: Page,
  lessonId: string,
): Promise<LessonWalk> => {
  const total = readBuiltLesson(lessonId).exercises.length;
  await seedCompletedLessons(page, ALL_OPEN_PROGRESS);
  await page.goto(`/lessons/${lessonId}`);

  const padLabels: string[] = [];
  const characters: string[] = [];
  for (let position = 1; position <= total; position += 1) {
    await test.step(`câu ${position} / ${total}`, async () => {
      await expect(progressText(page, position, total)).toBeVisible();
      await expect(
        currentQuestion(page).or(unavailableMessage(page)),
      ).toBeVisible();
      await expect(
        unavailableMessage(page),
        `câu ${position} không được hiện "${UNAVAILABLE_MESSAGE}"`,
      ).toHaveCount(0);

      if (await writingPads(page).isVisible()) {
        const label = await writingPads(page).getAttribute('aria-label');
        padLabels.push(label ?? '');
      }
      const character = await answerCurrentQuestion(page);
      if (character !== null) {
        characters.push(character);
      }
    });
  }
  await expect(unavailableMessage(page)).toHaveCount(0);
  return { padLabels, characters };
};

test.describe('S7.1 Soạn 12 bài Nhập môn — nội dung câu viết', () => {
  test.beforeEach(() => {
    test.setTimeout(ONE_LESSON_TIMEOUT_MS);
  });

  test('TC-S7.1-AC2-1: S7.1-AC2 Bài "Nét cơ bản và thứ tự nét" có câu viết', async ({
    page,
  }) => {
    const { padLabels } = await walkLesson(page, STROKES_LESSON_ID);

    expect(padLabels).toEqual(
      expect.arrayContaining([
        `${PAD_LABEL_PREFIX}人`,
        `${PAD_LABEL_PREFIX}十`,
      ]),
    );
  });

  test('TC-S7.1-AC2-2: S7.1-AC2 Bài "30 bộ thủ phổ biến" có câu viết', async ({
    page,
  }) => {
    const { padLabels, characters } = await walkLesson(
      page,
      RADICALS_LESSON_ID,
    );

    expect(
      padLabels.length,
      'bài 11 có ít nhất một khung viết',
    ).toBeGreaterThanOrEqual(1);
    expect(characters).toEqual(builtStrokeWriteCharacters(RADICALS_LESSON_ID));
    expect(padLabels).toEqual(
      characters.map((character) => `${PAD_LABEL_PREFIX}${character}`),
    );
  });

  INTRO_LESSON_IDS.forEach((lessonId, lessonIndex) => {
    test(`TC-S7.1-AC3-5: S7.1-AC3 Mọi câu viết của 12 bài có dữ liệu nét (bài ${lessonIndex + 1} "${INTRO_LESSON_TITLES[lessonIndex]}")`, async ({
      page,
    }) => {
      const expectedCharacters = builtStrokeWriteCharacters(lessonId);

      const { padLabels } = await walkLesson(page, lessonId);

      expect(padLabels.length, 'mỗi câu viết của bài hiện một khung viết').toBe(
        expectedCharacters.length,
      );
      for (const label of padLabels) {
        expect(label.startsWith(PAD_LABEL_PREFIX), label).toBe(true);
        const character = label.slice(PAD_LABEL_PREFIX.length);
        expect(
          hanCharacterSchema.safeParse(character).success,
          `"${character}" phải là đúng một chữ Hán`,
        ).toBe(true);
      }
    });
  });
});
