import { randomUUID } from 'crypto';
import { expect, test, type Page } from '@playwright/test';

import {
  answerCurrentQuestion,
  readBuiltLesson,
  readBuiltSentences,
  readBuiltWords,
} from '../E7/intro-lessons.helpers';
import {
  GREET,
  GREET_AUDIO,
  GREET_LESSON_ID,
  clickDownload,
  downloadButton,
  expectDownloaded,
  expectDownloading,
  openLearningPath,
  removeButton,
} from './offline-audio-download.helpers';
import {
  INTRO_UNIT_TITLE,
  expectListenPlays,
  expectQuestion,
  expectSampleCannotPlay,
  installAudioRecorder,
  isInAnyCache,
  launchPersistentApp,
  passSpeakQuestion,
} from './offline-audio-offline.helpers';
import {
  E2E_AUDIO,
  INTRO_SENTENCE_IDS,
  LEARNING_PATH_URL,
  goOffline,
  offlineAudioBlock,
  openLessonByUrl,
  openOnceWithServiceWorker,
  releaseAudio,
  servedAudio,
  setAudioNetwork,
  unitTitle,
  useOfflineAudioFixture,
} from './offline-audio.helpers';

const GREET_TOTAL = GREET_AUDIO.length;
/** Audio chỉ thuộc "Chào hỏi" ở câu 2 của bài (câu 1 là audio chung Chào hỏi–Gia đình). */
const GREET_ONLY_POSITION = 2;
const GREET_ONLY_AUDIO = E2E_AUDIO.greetOnly1.path;
const INTRO_SHARED = unitTitle('intro-shared');
const FIRST_INTRO_LESSON_ID = 'intro-01';
const SHARED_INTRO_LESSON_ID = 'intro-02';
const PERSISTENT_TIMEOUT_MS = 120_000;

/** Audio của câu đầu bài Nhập môn đầu tiên (câu chọn thanh, nút "Nghe"). */
const firstIntroAudio = (): string => {
  const [first] = readBuiltLesson(FIRST_INTRO_LESSON_ID).exercises;
  const wordId =
    first !== undefined && 'wordId' in first ? first.wordId : undefined;
  const word = readBuiltWords().find((item) => item.id === wordId);
  if (!word) {
    throw new Error(`Câu đầu ${FIRST_INTRO_LESSON_ID} phải có từ kèm audio.`);
  }
  return word.audio;
};

/** Audio Nhập môn dùng chung với "Chủ đề dùng chung Nhập môn". */
const sharedIntroAudio = (): string => {
  const sentence = readBuiltSentences().find(
    (item) => item.id === INTRO_SENTENCE_IDS.shared,
  );
  if (!sentence) {
    throw new Error(`Không có câu ${INTRO_SENTENCE_IDS.shared}.`);
  }
  return sentence.audio;
};

/** Vị trí (1-based) của câu dùng audio Nhập môn chung trong bài Nhập môn chứa nó. */
const sharedIntroPosition = (): { position: number; total: number } => {
  const { exercises } = readBuiltLesson(SHARED_INTRO_LESSON_ID);
  const index = exercises.findIndex(
    (exercise) =>
      exercise.kind === 'speak' &&
      exercise.sentenceId === INTRO_SENTENCE_IDS.shared,
  );
  expect(index, 'bài Nhập môn phải chứa câu dùng chung').toBeGreaterThanOrEqual(
    0,
  );
  return { position: index + 1, total: exercises.length };
};

/** Mở bài "Chào hỏi" bằng URL và đi tới câu 2 (audio chỉ thuộc "Chào hỏi") mà không nghe câu 1. */
const openGreetOnlyQuestion = async (page: Page): Promise<void> => {
  await openLessonByUrl(page, GREET_LESSON_ID);
  await expectQuestion(page, 1, GREET_TOTAL);
  await passSpeakQuestion(page);
  await expectQuestion(page, GREET_ONLY_POSITION, GREET_TOTAL);
};

const greetServedCount = async (page: Page): Promise<number> =>
  (await servedAudio(page)).filter((path) =>
    GREET_AUDIO.some((greetPath) => greetPath === path),
  ).length;

test.describe('S8.4 Tải audio offline — nghe khi offline', () => {
  test.beforeEach(async ({ context, page }) => {
    await useOfflineAudioFixture(context);
    await installAudioRecorder(page);
    await openOnceWithServiceWorker(page);
  });

  test('TC-S8.4-AC1-5: S8.4-AC1 Mới cài app thì audio HSK chưa có trên máy', async ({
    context,
    page,
  }) => {
    await goOffline(context, page);
    await page.goto(LEARNING_PATH_URL);
    await expect(downloadButton(page, GREET)).toHaveText('Tải audio (2,4 MB)');

    expect(await isInAnyCache(page, GREET_ONLY_AUDIO)).toBe(false);
    await openGreetOnlyQuestion(page);
    await expectSampleCannotPlay(page, GREET_ONLY_AUDIO);
  });

  test('TC-S8.4-AC1-17: S8.4-AC1 Đã tải thì học offline vẫn nghe được', async ({
    context,
    page,
  }) => {
    await openLearningPath(page);
    await clickDownload(page, GREET);
    await expectDownloaded(page, GREET, '2,4 MB');
    const servedBeforeOffline = await greetServedCount(page);

    await goOffline(context, page);
    await openLessonByUrl(page, GREET_LESSON_ID);
    for (const [index, path] of GREET_AUDIO.entries()) {
      await expectQuestion(page, index + 1, GREET_TOTAL);
      await expectListenPlays(page, path);
      await passSpeakQuestion(page);
    }

    expect(
      await greetServedCount(page),
      'khi offline audio phải lấy từ máy, không từ mạng',
    ).toBe(servedBeforeOffline);
  });

  test('TC-S8.4-AC1-28: S8.4-AC1 Chủ đề Nhập môn có sẵn offline', async ({
    context,
    page,
  }) => {
    const introAudio = firstIntroAudio();
    await goOffline(context, page);
    await page.close();
    const reopened = await context.newPage();
    await installAudioRecorder(reopened);

    await reopened.goto(LEARNING_PATH_URL);
    await expect(offlineAudioBlock(reopened, INTRO_UNIT_TITLE)).toHaveText(
      'Audio có sẵn offline',
    );
    await reopened.goto(`/lessons/${FIRST_INTRO_LESSON_ID}`);
    await expectQuestion(
      reopened,
      1,
      readBuiltLesson(FIRST_INTRO_LESSON_ID).exercises.length,
    );
    await expectListenPlays(reopened, introAudio);
  });

  test('TC-S8.4-AC2-5: S8.4-AC2 Đã xóa thì offline không còn nghe được', async ({
    context,
    page,
  }) => {
    await openLearningPath(page);
    await clickDownload(page, GREET);
    await expectDownloaded(page, GREET, '2,4 MB');
    await removeButton(page, GREET).click();
    await expect(downloadButton(page, GREET)).toHaveText('Tải audio (2,4 MB)');

    await goOffline(context, page);
    await openGreetOnlyQuestion(page);
    await expectSampleCannotPlay(page, GREET_ONLY_AUDIO);
  });

  test('TC-S8.4-AC2-7: S8.4-AC2 Xóa không làm mất audio Nhập môn', async ({
    context,
    page,
  }) => {
    const sharedAudio = sharedIntroAudio();
    const { position, total } = sharedIntroPosition();
    await openLearningPath(page);
    const label = await clickDownload(page, INTRO_SHARED);
    const size = label.replace(/^Tải audio \((.+)\)$/, '$1');
    await expectDownloaded(page, INTRO_SHARED, size);
    await removeButton(page, INTRO_SHARED).click();
    await expect(downloadButton(page, INTRO_SHARED)).toHaveText(label);

    await goOffline(context, page);
    await page.goto(LEARNING_PATH_URL);
    await expect(offlineAudioBlock(page, INTRO_UNIT_TITLE)).toHaveText(
      'Audio có sẵn offline',
    );
    await page.goto(`/lessons/${SHARED_INTRO_LESSON_ID}`);
    for (let current = 1; current < position; current += 1) {
      await expectQuestion(page, current, total);
      await answerCurrentQuestion(page);
    }
    await expectQuestion(page, position, total);
    await expectListenPlays(page, sharedAudio);
  });
});

test.describe('S8.4 Tải audio offline — đóng app giữa chừng', () => {
  test('TC-S8.4-AC1-51: S8.4-AC1 Đóng app giữa chừng', async ({
    browserName,
  }, testInfo) => {
    test.skip(browserName !== 'chromium', 'Hồ sơ bền chạy bằng Chromium.');
    test.setTimeout(PERSISTENT_TIMEOUT_MS);
    const profileDir = testInfo.outputPath('profile');
    const downloadedBeforeClose = GREET_AUDIO.slice(0, 2);

    const first = await launchPersistentApp(testInfo, profileDir);
    try {
      await openOnceWithServiceWorker(first.page);
      await setAudioNetwork(first.page, { holdPaths: [...GREET_AUDIO] });
      await openLearningPath(first.page);
      await clickDownload(first.page, GREET);
      for (const path of downloadedBeforeClose) {
        await releaseAudio(first.page, path);
      }
      await expectDownloading(first.page, GREET, 50);
    } finally {
      await first.context.close();
    }

    // Phiên mạng mới: có mạng, không giữ request nào.
    const second = await launchPersistentApp(
      testInfo,
      profileDir,
      randomUUID(),
    );
    try {
      await installAudioRecorder(second.page);
      await openLearningPath(second.page);
      await expect(downloadButton(second.page, GREET)).toHaveText(
        'Tải audio (2,4 MB)',
      );
      await expect(
        offlineAudioBlock(second.page, GREET).getByText(/Đang tải/),
      ).toHaveCount(0);

      await goOffline(second.context, second.page);
      await openLessonByUrl(second.page, GREET_LESSON_ID);
      for (const [index, path] of downloadedBeforeClose.entries()) {
        await expectQuestion(second.page, index + 1, GREET_TOTAL);
        await expectListenPlays(second.page, path);
        await passSpeakQuestion(second.page);
      }
    } finally {
      await second.context.close();
    }
  });
});
