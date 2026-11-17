import type { Exercise } from '@csk/shared';
import { expect, test, type Locator, type Page } from '@playwright/test';

import {
  INTRO_LESSON_IDS,
  INTRO_LESSON_TITLES,
  answerCurrentQuestion,
  completeOnboarding,
  installAudioRecorder,
  isLastAudioPlaying,
  readAudioPlays,
  readBuiltLesson,
  readBuiltSentences,
  readBuiltWords,
  seedCompletedLessons,
} from './intro-lessons.helpers';

/** Mọi bài trừ bài cuối đã xong: cả 12 bài mở được. */
const ALL_OPEN_PROGRESS = INTRO_LESSON_IDS.slice(0, -1);
const AUDIO_ERROR_MESSAGE = 'Không phát được audio.';
const FIRST_LESSON_ID = 'intro-01';
/** Bài có câu viết (vẽ từng nét) cần lâu hơn mặc định 30 s. */
const ONE_LESSON_TIMEOUT_MS = 120_000;

const words = readBuiltWords();
const sentences = readBuiltSentences();

const wordAudio = (wordId: string): string => {
  const word = words.find((item) => item.id === wordId);
  if (!word) {
    throw new Error(`Không có từ ${wordId} trong words.json.`);
  }
  return word.audio;
};

const sentenceAudio = (sentenceId: string): string => {
  const sentence = sentences.find((item) => item.id === sentenceId);
  if (!sentence) {
    throw new Error(`Không có câu ${sentenceId} trong sentences.json.`);
  }
  return sentence.audio;
};

/** Audio của từ/câu mà câu này hỏi (nút "Nghe"/"Nghe mẫu" phải phát); câu viết không có. */
const questionAudio = (exercise: Exercise): string | null => {
  switch (exercise.kind) {
    case 'tone-choice':
    case 'pinyin-type':
      return wordAudio(exercise.wordId);
    case 'sound-pair':
      return wordAudio(exercise.answerWordId);
    case 'speak':
      if (exercise.wordId !== undefined) {
        return wordAudio(exercise.wordId);
      }
      return exercise.sentenceId !== undefined
        ? sentenceAudio(exercise.sentenceId)
        : null;
    default:
      return null;
  }
};

const lessonQuestionAudios = (lessonId: string): (string | null)[] =>
  readBuiltLesson(lessonId).exercises.map(questionAudio);

const progressText = (page: Page, position: number, total: number): Locator =>
  page.getByText(`Câu ${position} / ${total}`, { exact: true });

/** Nút nghe của câu đang hiện: "Nghe" (từ cần nhận ra) hoặc "Nghe mẫu" (câu nói theo mẫu). */
const questionListenButton = (page: Page): Locator =>
  page.getByRole('button', { name: /^Nghe( mẫu)?$/ });

const playCount = async (page: Page): Promise<number> =>
  (await readAudioPlays(page)).length;

/**
 * Bấm nút nghe của câu đang hiện; mọi lần phát mới phải là `expectedAudio` và bắt đầu phát với
 * thời lượng > 0, không hiện lỗi phát audio.
 */
const listenAndExpectPlayed = async (
  page: Page,
  expectedAudio: string,
): Promise<void> => {
  const playsBefore = await playCount(page);
  await questionListenButton(page).click();

  await expect.poll(() => playCount(page)).toBeGreaterThan(playsBefore);
  await expect
    .poll(async () => (await readAudioPlays(page)).at(-1)?.duration ?? 0, {
      message: `audio ${expectedAudio} phải bắt đầu phát, thời lượng > 0`,
    })
    .toBeGreaterThan(0);
  const newPlays = (await readAudioPlays(page)).slice(playsBefore);
  expect(newPlays.map((play) => play.error)).toEqual(newPlays.map(() => null));
  for (const play of newPlays) {
    expect(play.src, 'nút nghe phát đúng từ/câu câu này hỏi').toMatch(
      new RegExp(`/${expectedAudio.replace(/[.]/g, '\\.')}$`),
    );
  }
  await expect(page.getByText(AUDIO_ERROR_MESSAGE)).toHaveCount(0);
};

test.describe('S7.1 Soạn 12 bài Nhập môn — audio của từ và câu', () => {
  INTRO_LESSON_IDS.forEach((lessonId, lessonIndex) => {
    test(`TC-S7.1-AC1-5: S7.1-AC1 Mọi từ và câu của bài đều có audio; TC-S7.1-AC1-8: S7.1-AC1 Nút Nghe phát đúng từ hoặc câu đang hiện (bài ${lessonIndex + 1} "${INTRO_LESSON_TITLES[lessonIndex]}")`, async ({
      page,
    }) => {
      test.setTimeout(ONE_LESSON_TIMEOUT_MS);
      const audios = lessonQuestionAudios(lessonId);
      const total = audios.length;
      await installAudioRecorder(page);
      await seedCompletedLessons(page, ALL_OPEN_PROGRESS);
      await page.goto(`/lessons/${lessonId}`);

      for (const [index, expectedAudio] of audios.entries()) {
        await test.step(`câu ${index + 1} / ${total}`, async () => {
          await expect(progressText(page, index + 1, total)).toBeVisible();
          if (expectedAudio !== null) {
            await expect(questionListenButton(page)).toBeVisible();
            await listenAndExpectPlayed(page, expectedAudio);
          }
          await answerCurrentQuestion(page);
        });
      }
    });
  });

  test('TC-S7.1-AC1-8: S7.1-AC1 Nút Nghe phát đúng từ hoặc câu đang hiện (bấm Tiếp tục khi audio còn phát, bài 1)', async ({
    page,
  }) => {
    const [firstAudio, secondAudio] = lessonQuestionAudios(FIRST_LESSON_ID);
    const total = readBuiltLesson(FIRST_LESSON_ID).exercises.length;
    if (!firstAudio || !secondAudio) {
      throw new Error(`Hai câu đầu bài ${FIRST_LESSON_ID} phải có nút Nghe.`);
    }
    expect(secondAudio, 'hai câu đầu phải hỏi hai từ khác nhau').not.toBe(
      firstAudio,
    );
    await installAudioRecorder(page);
    await completeOnboarding(page);
    await expect(page).toHaveURL(new RegExp(`/lessons/${FIRST_LESSON_ID}$`));
    await expect(progressText(page, 1, total)).toBeVisible();

    await listenAndExpectPlayed(page, firstAudio);
    await page
      .getByRole('group', { name: 'Chọn thanh của âm tiết vừa nghe' })
      .getByRole('button')
      .first()
      .click();
    expect(await isLastAudioPlaying(page), 'audio câu 1 còn đang phát').toBe(
      true,
    );
    await page.getByRole('button', { name: 'Tiếp tục' }).click();

    await expect(progressText(page, 2, total)).toBeVisible();
    await expect
      .poll(() => isLastAudioPlaying(page), {
        message: 'sang câu kế thì audio câu trước phải dừng',
      })
      .toBe(false);
    await listenAndExpectPlayed(page, secondAudio);
    const lastPlay = (await readAudioPlays(page)).at(-1);
    expect(lastPlay?.src).toMatch(new RegExp(`/${secondAudio}$`));
    expect(lastPlay?.src).not.toMatch(new RegExp(`/${firstAudio}$`));
  });
});
