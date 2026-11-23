/** Helper e2e S8.4 cho lỗi tải và thông báo trong khối: câu thông báo, gây lỗi, điều hướng trong app. */
import { expect, type BrowserContext, type Page } from '@playwright/test';

import {
  GREET,
  GREET_AUDIO,
  blockText,
  clickDownload,
  downloadButton,
  expectDownloading,
  isInAudioCache,
  openLearningPath,
} from './offline-audio-download.helpers';
import {
  expectQuestion,
  passSpeakQuestion,
} from './offline-audio-offline.helpers';
import {
  OFFLINE_AUDIO_STAGE,
  goOffline,
  releaseAudio,
  setAudioNetwork,
  unitSection,
} from './offline-audio.helpers';

export const NEEDS_NETWORK = 'Cần có mạng để tải audio.';
export const DOWNLOAD_INCOMPLETE =
  'Tải chưa xong. Hãy kiểm tra mạng rồi thử lại.';
export const STORAGE_FULL =
  'Không đủ bộ nhớ để tải audio. Hãy xóa audio của chủ đề khác rồi thử lại.';
export const removedMessage = (title: string): string =>
  `Đã xóa audio của chủ đề ${title}.`;
export const GREET_DOWNLOAD_LABEL = 'Tải audio (2,4 MB)';
const INTRO_UNIT_TITLE = 'Pinyin và chữ Hán cơ bản';

/** Khối "Chào hỏi" hiện `message` và có lại nút "Tải audio (2,4 MB)", không còn "Đang tải". */
export const expectGreetFailed = async (
  page: Page,
  message: string,
): Promise<void> => {
  await expect(blockText(page, GREET, message)).toBeVisible();
  await expect(downloadButton(page, GREET)).toHaveText(GREET_DOWNLOAD_LABEL);
  await expect(blockText(page, GREET, message)).toHaveCount(1);
};

/**
 * Gây lỗi như TC-S8.4-AC1-38: mạng chậm (giữ mọi audio "Chào hỏi"), bấm tải, thả 2 file đầu; khi
 * khối hiện "Đang tải 50%" thì tắt mạng. Hai file sau vẫn bị giữ (bật mạng lại vẫn chậm).
 */
export const failGreetMidDownload = async (
  context: BrowserContext,
  page: Page,
): Promise<void> => {
  await setAudioNetwork(page, { holdPaths: [...GREET_AUDIO] });
  await openLearningPath(page);
  await clickDownload(page, GREET);
  await releaseAudio(page, GREET_AUDIO[0]);
  await releaseAudio(page, GREET_AUDIO[1]);
  await expectDownloading(page, GREET, 50);
  await goOffline(context, page);
  await expectGreetFailed(page, DOWNLOAD_INCOMPLETE);
};

/** Điều hướng trong app (không tải lại trang, app vẫn mở) tới `url`, kể cả bài đang khóa. */
export const navigateInApp = async (page: Page, url: string): Promise<void> => {
  await page.evaluate((target) => {
    window.history.pushState(null, '', target);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, url);
  await expect(page).toHaveURL(url);
};

/** Vào bài Nhập môn đầu bằng link trên bản đồ (điều hướng trong app). */
export const enterIntroLesson = async (page: Page): Promise<void> => {
  await unitSection(page, INTRO_UNIT_TITLE)
    .getByRole('listitem')
    .first()
    .getByRole('link')
    .click();
  await expect(page).toHaveURL(/\/lessons\/intro-/);
  await expect(
    page.getByRole('button', { name: /^Nghe/ }).first(),
  ).toBeVisible();
};

/** Quay lại màn Lộ trình bằng nút Back (không tải lại trang). */
export const backToLearningPath = async (page: Page): Promise<void> => {
  await page.goBack();
  await expect(
    page.getByRole('heading', { level: 2, name: OFFLINE_AUDIO_STAGE.title }),
  ).toBeVisible();
  await expect(unitSection(page, GREET)).toBeVisible();
};

/**
 * Đang ở bài "Chào hỏi" (câu 1): đi qua mọi câu, câu có vị trí (1-based) trong `positions` thì bấm
 * "Nghe mẫu" và chờ audio được lưu vào `audio-cache`; câu khác chỉ tự đánh giá.
 */
export const listenGreetQuestions = async (
  page: Page,
  positions: readonly number[],
): Promise<void> => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Bài Chào hỏi',
  );
  for (const [index, path] of GREET_AUDIO.entries()) {
    const position = index + 1;
    await expectQuestion(page, position, GREET_AUDIO.length);
    if (positions.includes(position)) {
      await page.getByRole('button', { name: 'Nghe mẫu', exact: true }).click();
      await expect
        .poll(() => isInAudioCache(page, path), {
          message: `${path} phải được lưu vào audio-cache sau khi nghe`,
        })
        .toBe(true);
    }
    await passSpeakQuestion(page);
  }
};
