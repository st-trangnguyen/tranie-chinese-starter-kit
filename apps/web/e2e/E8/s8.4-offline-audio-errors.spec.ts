import { expect, test, type BrowserContext, type Page } from '@playwright/test';

import {
  DOWNLOAD_INCOMPLETE,
  GREET_DOWNLOAD_LABEL,
  NEEDS_NETWORK,
  backToLearningPath,
  enterIntroLesson,
  expectGreetFailed,
  failGreetMidDownload,
} from './offline-audio-errors.helpers';
import {
  GREET,
  GREET_AUDIO,
  GREET_LESSON_ID,
  blockText,
  clickDownload,
  expectDownloaded,
  expectDownloading,
  openLearningPath,
  readStatusLog,
  recordStatusLog,
} from './offline-audio-download.helpers';
import {
  expectListenPlays,
  expectQuestion,
  installAudioRecorder,
  passSpeakQuestion,
} from './offline-audio-offline.helpers';
import {
  LEARNING_PATH_URL,
  announcer,
  goOffline,
  goOnline,
  offlineAudioBlock,
  openLessonByUrl,
  openOnceWithServiceWorker,
  releaseAudio,
  servedAudio,
  setAudioNetwork,
  useOfflineAudioFixture,
} from './offline-audio.helpers';

/** Mọi lượt server đã phục vụ audio của "Chào hỏi", theo thứ tự. */
const greetServed = async (page: Page): Promise<string[]> =>
  (await servedAudio(page)).filter((path) =>
    GREET_AUDIO.some((greetPath) => greetPath === path),
  );

/** Tắt mạng, mở màn Lộ trình rồi bấm "Tải audio (2,4 MB)" của "Chào hỏi" (TC-S8.4-AC1-34). */
const clickGreetWhileOffline = async (
  context: BrowserContext,
  page: Page,
): Promise<void> => {
  await goOffline(context, page);
  await page.goto(LEARNING_PATH_URL);
  await expect(clickDownload(page, GREET)).resolves.toBe(GREET_DOWNLOAD_LABEL);
};

test.describe('S8.4 Tải audio offline — báo lỗi khi tải không được', () => {
  test.beforeEach(async ({ context, page }) => {
    await useOfflineAudioFixture(context);
    await installAudioRecorder(page);
    await openOnceWithServiceWorker(page);
  });

  test('TC-S8.4-AC1-34: S8.4-AC1 Bấm tải khi không có mạng', async ({
    context,
    page,
  }) => {
    await clickGreetWhileOffline(context, page);

    await expectGreetFailed(page, NEEDS_NETWORK);
    await expect(
      offlineAudioBlock(page, GREET).getByText(/Đang tải/),
    ).toHaveCount(0);
  });

  test('TC-S8.4-AC1-35: S8.4-AC1 Bấm tải khi không có mạng (vùng thông báo)', async ({
    context,
    page,
  }) => {
    await clickGreetWhileOffline(context, page);

    await expect(
      announcer(page).getByText(NEEDS_NETWORK, { exact: true }),
    ).toHaveCount(1);
  });

  test('TC-S8.4-AC1-36: S8.4-AC1 Bấm tải khi không có mạng rồi có mạng lại', async ({
    context,
    page,
  }) => {
    await clickGreetWhileOffline(context, page);
    await expectGreetFailed(page, NEEDS_NETWORK);

    await goOnline(context, page);
    await clickDownload(page, GREET);

    await expectDownloaded(page, GREET, '2,4 MB');
    await expect(blockText(page, GREET, NEEDS_NETWORK)).toHaveCount(0);
  });

  test('TC-S8.4-AC1-38: S8.4-AC1 Mất mạng khi đang tải', async ({
    context,
    page,
  }) => {
    await failGreetMidDownload(context, page);

    await openLessonByUrl(page, GREET_LESSON_ID);
    for (const [index, path] of GREET_AUDIO.slice(0, 2).entries()) {
      await expectQuestion(page, index + 1, GREET_AUDIO.length);
      await expectListenPlays(page, path);
      await passSpeakQuestion(page);
    }
  });

  test('TC-S8.4-AC1-39: S8.4-AC1 Mất mạng khi đang tải (một file trả lỗi)', async ({
    page,
  }) => {
    await setAudioNetwork(page, { failPaths: [GREET_AUDIO[1]] });
    await openLearningPath(page);
    await clickDownload(page, GREET);

    await expectGreetFailed(page, DOWNLOAD_INCOMPLETE);
  });

  test('TC-S8.4-AC1-40: S8.4-AC1 Tải lại chỉ tải phần còn thiếu', async ({
    context,
    page,
  }) => {
    await failGreetMidDownload(context, page);
    const servedBefore = await greetServed(page);
    expect(servedBefore).toEqual(GREET_AUDIO.slice(0, 2));

    await goOnline(context, page);
    await recordStatusLog(page, GREET);
    await clickDownload(page, GREET);
    await expectDownloading(page, GREET, 50);
    await releaseAudio(page, GREET_AUDIO[2]);
    await expectDownloading(page, GREET, 75);
    await releaseAudio(page, GREET_AUDIO[3]);
    await expectDownloaded(page, GREET, '2,4 MB');

    expect(await readStatusLog(page)).toEqual([
      'Đang tải 50%',
      'Đang tải 75%',
      'Đã tải audio (2,4 MB)',
    ]);
    expect(
      (await greetServed(page)).slice(servedBefore.length),
      'chỉ 2 file còn thiếu được tải lại',
    ).toEqual(GREET_AUDIO.slice(2));
  });

  test('TC-S8.4-AC1-45: S8.4-AC1 Thông báo mất khi bấm nút kế tiếp', async ({
    context,
    page,
  }) => {
    await failGreetMidDownload(context, page);

    await goOnline(context, page);
    await clickDownload(page, GREET);

    await expect(
      offlineAudioBlock(page, GREET).getByText(/^Đang tải \d+%$/),
    ).toBeVisible();
    await expect(blockText(page, GREET, DOWNLOAD_INCOMPLETE)).toHaveCount(0);
  });

  test('TC-S8.4-AC1-46: S8.4-AC1 Thông báo còn khi không bấm gì trong khối', async ({
    context,
    page,
  }) => {
    await failGreetMidDownload(context, page);

    await enterIntroLesson(page);
    await backToLearningPath(page);

    await expectGreetFailed(page, DOWNLOAD_INCOMPLETE);
  });
});
