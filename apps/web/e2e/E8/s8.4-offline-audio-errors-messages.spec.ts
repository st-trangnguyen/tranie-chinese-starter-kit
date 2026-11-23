import { expect, test } from '@playwright/test';

import {
  DOWNLOAD_INCOMPLETE,
  GREET_DOWNLOAD_LABEL,
  NEEDS_NETWORK,
  listenGreetQuestions,
  navigateInApp,
  removedMessage,
} from './offline-audio-errors.helpers';
import {
  GREET,
  GREET_LESSON_ID,
  blockText,
  clickDownload,
  downloadButton,
  expectDownloaded,
  expectDownloading,
  openLearningPath,
  removeButton,
} from './offline-audio-download.helpers';
import {
  E2E_AUDIO,
  LEARNING_PATH_URL,
  goOffline,
  openLessonByUrl,
  openOnceWithServiceWorker,
  releaseAudio,
  setAudioNetwork,
  unitTitle,
  useOfflineAudioFixture,
} from './offline-audio.helpers';

const FAMILY = unitTitle('family');
/** Audio chung "Chào hỏi" – "Gia đình" (câu 1 bài "Chào hỏi"). */
const SHARED_AUDIO = E2E_AUDIO.greetFamily.path;

test.describe('S8.4 Tải audio offline — thông báo trong khối của chủ đề', () => {
  test.beforeEach(async ({ context, page }) => {
    await useOfflineAudioFixture(context);
    await openOnceWithServiceWorker(page);
  });

  test('TC-S8.4-AC1-44: S8.4-AC1 Thông báo của mỗi chủ đề độc lập', async ({
    context,
    page,
  }) => {
    await openLearningPath(page);
    await clickDownload(page, FAMILY);
    await expectDownloaded(page, FAMILY, '1,1 MB');

    await goOffline(context, page);
    await clickDownload(page, GREET);
    await expect(blockText(page, GREET, NEEDS_NETWORK)).toBeVisible();
    await removeButton(page, FAMILY).click();

    await expect(blockText(page, FAMILY, removedMessage(FAMILY))).toBeVisible();
    await expect(blockText(page, GREET, NEEDS_NETWORK)).toBeVisible();
    await expect(downloadButton(page, GREET)).toHaveText(GREET_DOWNLOAD_LABEL);
    await expect(blockText(page, GREET, removedMessage(FAMILY))).toHaveCount(0);
    await expect(blockText(page, FAMILY, NEEDS_NETWORK)).toHaveCount(0);
  });

  test('TC-S8.4-AC1-47: S8.4-AC1 Thông báo mất khi trạng thái đổi mà không bấm gì', async ({
    page,
  }) => {
    // Audio chung về sau cùng: 3 file riêng đã có trên máy (nghe trong bài), file chung bị giữ.
    await setAudioNetwork(page, { holdPaths: [SHARED_AUDIO] });
    await openLessonByUrl(page, GREET_LESSON_ID);
    await listenGreetQuestions(page, [2, 3, 4]);
    await openLearningPath(page);

    await clickDownload(page, GREET);
    await expectDownloading(page, GREET, 75);
    await setAudioNetwork(page, { failPaths: [SHARED_AUDIO] });
    await releaseAudio(page, SHARED_AUDIO);
    await expect(blockText(page, GREET, DOWNLOAD_INCOMPLETE)).toBeVisible();

    await setAudioNetwork(page, { failPaths: [] });
    await clickDownload(page, FAMILY);
    await expectDownloaded(page, FAMILY, '1,1 MB');

    await expectDownloaded(page, GREET, '2,4 MB');
    await expect(blockText(page, GREET, DOWNLOAD_INCOMPLETE)).toHaveCount(0);
  });

  test('TC-S8.4-AC1-48: S8.4-AC1 Thông báo mất khi trạng thái đổi mà không bấm gì (nghe lại đủ)', async ({
    page,
  }) => {
    await openLearningPath(page);
    await clickDownload(page, GREET);
    await expectDownloaded(page, GREET, '2,4 MB');
    await removeButton(page, GREET).click();
    await expect(blockText(page, GREET, removedMessage(GREET))).toBeVisible();

    // App vẫn mở: vào bài "Chào hỏi" (đang khóa, không có link) bằng điều hướng trong app.
    await navigateInApp(page, `/lessons/${GREET_LESSON_ID}`);
    await listenGreetQuestions(page, [1, 2, 3, 4]);
    await navigateInApp(page, LEARNING_PATH_URL);

    await expectDownloaded(page, GREET, '2,4 MB');
    await expect(blockText(page, GREET, removedMessage(GREET))).toHaveCount(0);
  });
});
