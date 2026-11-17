import { expect, test, type Page } from '@playwright/test';

import {
  UNAVAILABLE_MESSAGE,
  drawMedian,
  readBuiltMedians,
  waitForWriterReady,
  writingPad,
  type MedianPoint,
} from '../E6/writing-practice.helpers';
import {
  FINISHED_MESSAGE,
  INTRO_LESSON_IDS,
  INTRO_LESSON_TITLES,
  LEARNING_PATH_URL,
  answerCurrentQuestion,
  completeOnboarding,
  pathLessonItems,
  pathLessonStatuses,
  readBuiltLesson,
  readBuiltSentences,
  readBuiltWords,
  seedCompletedLessons,
} from './intro-lessons.helpers';

const LESSON_COUNT = INTRO_LESSON_IDS.length;
/** Mọi bài trừ bài cuối đã xong: cả 12 bài mở được. */
const ALL_OPEN_PROGRESS = INTRO_LESSON_IDS.slice(0, -1);
const LOAD_ERROR_MESSAGE = 'Không mở được bài học.';
const AUDIO_ERROR_MESSAGE = 'Không phát được audio.';
const GENERIC_ERROR_MESSAGE = 'Có lỗi xảy ra';
const WRITING_LESSON_IDS = ['intro-10', 'intro-11'] as const;
/** Đủ để lần phát vừa bấm kịp báo lỗi nếu không tải được audio. */
const PLAY_SETTLE_MS = 1_500;
const TWELVE_LESSONS_TIMEOUT_MS = 180_000;
const ONE_LESSON_TIMEOUT_MS = 120_000;

const words = readBuiltWords();
const sentences = readBuiltSentences();

const wordOf = (wordId: string) => {
  const word = words.find((item) => item.id === wordId);
  if (!word) {
    throw new Error(`Không có từ ${wordId} trong words.json.`);
  }
  return word;
};

const sentenceOf = (sentenceId: string) => {
  const sentence = sentences.find((item) => item.id === sentenceId);
  if (!sentence) {
    throw new Error(`Không có câu ${sentenceId} trong sentences.json.`);
  }
  return sentence;
};

/** Audio mà các nút "Nghe"/"Nghe mẫu" của một bài phát (theo dạng câu). */
const lessonAudioPaths = (lessonId: string): string[] =>
  readBuiltLesson(lessonId).exercises.flatMap((exercise) => {
    switch (exercise.kind) {
      case 'tone-choice':
      case 'pinyin-type':
        return [wordOf(exercise.wordId).audio];
      case 'sound-pair':
        return exercise.wordIds.map((wordId) => wordOf(wordId).audio);
      case 'speak':
        if (exercise.wordId !== undefined) {
          return [wordOf(exercise.wordId).audio];
        }
        return exercise.sentenceId !== undefined
          ? [sentenceOf(exercise.sentenceId).audio]
          : [];
      default:
        // Câu viết không có nút Nghe.
        return [];
    }
  });

/** Lần tải đầu chưa được service worker điều khiển: tải lại để SW nắm trang (mẫu E1/S1.2). */
const openOnceWithServiceWorker = async (page: Page): Promise<void> => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
};

const lessonTotal = (lessonId: string): number =>
  readBuiltLesson(lessonId).exercises.length;

const progressText = (page: Page, position: number, total: number) =>
  page.getByText(`Câu ${position} / ${total}`, { exact: true });

const openLessonOffline = async (page: Page, index: number): Promise<void> => {
  const lessonId = INTRO_LESSON_IDS[index] ?? '';
  await page.goto(`/lessons/${lessonId}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    INTRO_LESSON_TITLES[index] ?? '',
  );
  await expect(progressText(page, 1, lessonTotal(lessonId))).toBeVisible();
  await expect(page.getByText(LOAD_ERROR_MESSAGE)).toHaveCount(0);
};

/** Có mạng: mở app một lần, nạp sẵn tiến độ mở hết 12 bài (không mở màn bài nào), rồi tắt mạng. */
const prepareAllOpenOffline = async (
  page: Page,
  goOffline: () => Promise<void>,
): Promise<void> => {
  await openOnceWithServiceWorker(page);
  await seedCompletedLessons(page, ALL_OPEN_PROGRESS);
  await goOffline();
};

test.describe('S7.1 Soạn 12 bài Nhập môn — offline', () => {
  test('TC-S7.1-AC5-1: S7.1-AC5 Offline mở được cả 12 bài', async ({
    page,
    context,
  }) => {
    test.setTimeout(TWELVE_LESSONS_TIMEOUT_MS);
    await prepareAllOpenOffline(page, () => context.setOffline(true));

    for (let index = 0; index < LESSON_COUNT; index += 1) {
      await test.step(`bài ${index + 1}`, async () => {
        await openLessonOffline(page, index);
      });
    }
  });

  test('TC-S7.1-AC5-3: S7.1-AC5 Offline phát được mọi audio của 12 bài', async ({
    page,
    context,
  }) => {
    test.setTimeout(TWELVE_LESSONS_TIMEOUT_MS);
    const audioPaths = [...new Set(INTRO_LESSON_IDS.flatMap(lessonAudioPaths))];
    expect(audioPaths.length).toBeGreaterThan(0);

    await prepareAllOpenOffline(page, () => context.setOffline(true));

    const results = await page.evaluate(async (paths) => {
      const audioContext = new AudioContext();
      const decoded: { path: string; isOk: boolean; seconds: number }[] = [];
      for (const path of paths) {
        try {
          const response = await fetch(`/${path}`);
          const buffer = await audioContext.decodeAudioData(
            await response.arrayBuffer(),
          );
          decoded.push({ path, isOk: response.ok, seconds: buffer.duration });
        } catch {
          decoded.push({ path, isOk: false, seconds: 0 });
        }
      }
      return decoded;
    }, audioPaths);

    const failures = results.filter(
      (result) => !result.isOk || result.seconds <= 0,
    );
    expect(failures, 'audio không tải/giải mã được khi offline').toEqual([]);

    for (let index = 0; index < LESSON_COUNT; index += 1) {
      await test.step(`bài ${index + 1}: bấm Nghe ở câu đầu`, async () => {
        await openLessonOffline(page, index);
        await page.getByRole('button', { name: 'Nghe', exact: true }).click();
        await page.waitForTimeout(PLAY_SETTLE_MS);
        await expect(page.getByText(AUDIO_ERROR_MESSAGE)).toHaveCount(0);
      });
    }
  });

  test('TC-S7.1-AC5-5: S7.1-AC5 Offline làm hết bài thì bài xong và bài kế mở', async ({
    page,
    context,
  }) => {
    test.setTimeout(ONE_LESSON_TIMEOUT_MS);
    const total = lessonTotal('intro-01');
    await openOnceWithServiceWorker(page);
    await context.setOffline(true);

    await completeOnboarding(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      INTRO_LESSON_TITLES[0],
    );
    for (let position = 1; position <= total; position += 1) {
      await expect(progressText(page, position, total)).toBeVisible();
      await answerCurrentQuestion(page);
    }
    await expect(page.getByText(FINISHED_MESSAGE)).toBeVisible();

    await page.goto(LEARNING_PATH_URL);
    await expect(pathLessonItems(page)).toHaveCount(LESSON_COUNT);
    await expect(pathLessonStatuses(page)).toHaveText([
      'Đã xong',
      'Đang mở',
      ...Array.from({ length: LESSON_COUNT - 2 }, () => 'Đã khóa'),
    ]);
  });

  WRITING_LESSON_IDS.forEach((lessonId) => {
    const index = INTRO_LESSON_IDS.indexOf(lessonId);
    test(`TC-S7.1-AC5-6: S7.1-AC5 Offline làm được câu viết — bài ${index + 1} "${INTRO_LESSON_TITLES[index]}"`, async ({
      page,
      context,
    }) => {
      test.setTimeout(ONE_LESSON_TIMEOUT_MS);
      const exercises = readBuiltLesson(lessonId).exercises;
      const characters = exercises.flatMap((exercise) =>
        exercise.kind === 'stroke-write' ? [wordOf(exercise.wordId).hanzi] : [],
      );
      expect(characters.length).toBeGreaterThan(0);
      // Đọc median khi còn mạng, từ file đã build (không phải từ app).
      const mediansByCharacter = new Map<string, MedianPoint[][]>();
      for (const character of characters) {
        mediansByCharacter.set(
          character,
          await readBuiltMedians(page, character),
        );
      }

      await prepareAllOpenOffline(page, () => context.setOffline(true));
      await openLessonOffline(page, index);

      for (const [position, exercise] of exercises.entries()) {
        await expect(
          progressText(page, position + 1, exercises.length),
        ).toBeVisible();
        if (exercise.kind !== 'stroke-write') {
          await answerCurrentQuestion(page);
          continue;
        }
        const character = wordOf(exercise.wordId).hanzi;
        await test.step(`câu ${position + 1}: viết ${character}`, async () => {
          const pad = writingPad(page, character);
          await expect(
            pad
              .or(page.getByText(UNAVAILABLE_MESSAGE))
              .or(page.getByText(GENERIC_ERROR_MESSAGE))
              .first(),
          ).toBeVisible();
          await expect(page.getByText(UNAVAILABLE_MESSAGE)).toHaveCount(0);
          await expect(page.getByText(GENERIC_ERROR_MESSAGE)).toHaveCount(0);
          await expect(pad).toBeVisible();

          await pad.scrollIntoViewIfNeeded();
          await waitForWriterReady(pad);
          for (const median of mediansByCharacter.get(character) ?? []) {
            await drawMedian(page, pad, median);
          }
          await expect(
            page.getByRole('status').filter({ hasText: /(^|\s)Đúng$/ }),
          ).toBeVisible();
          await page.getByRole('button', { name: 'Tiếp tục' }).click();
        });
      }
      await expect(page.getByText(FINISHED_MESSAGE)).toBeVisible();
    });
  });
});
