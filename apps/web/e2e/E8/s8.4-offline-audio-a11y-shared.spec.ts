import { expect, test, type Page } from '@playwright/test';

import {
  downloadWithKeyboard,
  readFocusLostCount,
  recordFocusLoss,
  sizeOf,
  tabTo,
} from './offline-audio-a11y.helpers';
import {
  blockText,
  downloadButton,
  expectDownloaded,
  isInAudioCache,
  openLearningPath,
  removeButton,
} from './offline-audio-download.helpers';
import {
  expectQuestion,
  passSpeakQuestion,
} from './offline-audio-offline.helpers';
import {
  E2E_AUDIO,
  offlineAudioBlock,
  openLessonByUrl,
  openOnceWithServiceWorker,
  releaseAudio,
  servedAudio,
  setAudioNetwork,
  unitTitle,
  useOfflineAudioFixture,
} from './offline-audio.helpers';

const FAMILY = unitTitle('family');
const TOPIC_C = unitTitle('c');
const FAMILY_LESSON_ID = 'e2e-family';
/** Audio "Gia đình" theo thứ tự câu trong bài (cũng là thứ tự tải). */
const FAMILY_AUDIO = [
  E2E_AUDIO.greetFamily.path,
  E2E_AUDIO.familyC.path,
  E2E_AUDIO.familyOnly.path,
] as const;

/** Khối C hiện "Đã tải audio (<size>)" không có nút xóa, dòng đó đang giữ focus. */
const expectCDownloadedFocusedOnStatus = async (
  page: Page,
  size: string,
): Promise<void> => {
  const status = blockText(page, TOPIC_C, `Đã tải audio (${size})`);
  await expect(status).toBeVisible();
  await expect(removeButton(page, TOPIC_C)).toHaveCount(0);
  await expect(downloadButton(page, TOPIC_C)).toHaveCount(0);
  await expect(status).toBeFocused();
};

/**
 * Nghe các câu "Gia đình" ở vị trí (1-based) `positions` trong bài (đang khóa, mở bằng URL): audio
 * được service worker lưu vào `audio-cache`, nên có trên máy trước khi bấm tải.
 */
const listenFamilyQuestions = async (
  page: Page,
  positions: readonly number[],
): Promise<void> => {
  await openLessonByUrl(page, FAMILY_LESSON_ID);
  for (const [index, path] of FAMILY_AUDIO.entries()) {
    const position = index + 1;
    await expectQuestion(page, position, FAMILY_AUDIO.length);
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

const familyStillDownloading = (page: Page) =>
  expect(
    offlineAudioBlock(page, FAMILY).getByText(/^Đang tải \d+%$/),
  ).toBeVisible();

test.describe('S8.4 Tải audio offline — focus khi audio dùng chung đổi trạng thái', () => {
  test.beforeEach(async ({ context, page }) => {
    await useOfflineAudioFixture(context);
    await openOnceWithServiceWorker(page);
  });

  test('TC-S8.4-AC1-62: S8.4-AC1 Tải xong mà không có nút xóa thì focus tới dòng đã tải', async ({
    page,
  }) => {
    await setAudioNetwork(page, { holdPaths: [...FAMILY_AUDIO] });
    await openLearningPath(page);
    await downloadWithKeyboard(page, FAMILY);
    const sizeC = sizeOf(await downloadWithKeyboard(page, TOPIC_C));
    await expect(
      offlineAudioBlock(page, TOPIC_C).getByText(/^Đang tải \d+%$/),
    ).toBeFocused();
    await recordFocusLoss(page);

    await releaseAudio(page, E2E_AUDIO.familyC.path);

    await expectCDownloadedFocusedOnStatus(page, sizeC);
    await familyStillDownloading(page);
    expect(await readFocusLostCount(page)).toBe(0);
  });

  test('TC-S8.4-AC1-65: S8.4-AC1 Nút tải đang focus biến mất vì chủ đề tự thành đã tải', async ({
    page,
  }) => {
    // Audio chung Gia đình–C về sau cùng: hai file còn lại của "Gia đình" đã có trên máy (nghe
    // trong bài), audio chung bị giữ. Tải theo thứ tự câu nên đây là cách cho nó về cuối.
    await setAudioNetwork(page, { holdPaths: [E2E_AUDIO.familyC.path] });
    await listenFamilyQuestions(page, [1, 3]);
    await openLearningPath(page);
    await downloadWithKeyboard(page, FAMILY);
    await familyStillDownloading(page);
    const cButton = downloadButton(page, TOPIC_C);
    const sizeC = sizeOf((await cButton.innerText()).trim());
    await tabTo(page, cButton);
    await recordFocusLoss(page);

    await releaseAudio(page, E2E_AUDIO.familyC.path);

    await expectDownloaded(page, TOPIC_C, sizeC);
    await expect(removeButton(page, TOPIC_C)).toBeFocused();
    await expectDownloaded(page, FAMILY, '1,1 MB');
    expect(await readFocusLostCount(page)).toBe(0);
  });

  test('TC-S8.4-AC1-66: S8.4-AC1 Nút tải đang focus biến mất vì chủ đề tự thành đã tải (khi chủ đề kia còn đang tải)', async ({
    page,
  }) => {
    await setAudioNetwork(page, { holdPaths: [...FAMILY_AUDIO] });
    await openLearningPath(page);
    await downloadWithKeyboard(page, FAMILY);
    const cButton = downloadButton(page, TOPIC_C);
    const sizeC = sizeOf((await cButton.innerText()).trim());
    await tabTo(page, cButton);
    // Tải theo thứ tự câu: audio chung với "Chào hỏi" về trước, rồi audio chung Gia đình–C, file
    // riêng "Gia đình" còn bị giữ.
    await releaseAudio(page, E2E_AUDIO.greetFamily.path);
    await expect
      .poll(async () =>
        (await servedAudio(page)).includes(E2E_AUDIO.greetFamily.path),
      )
      .toBe(true);
    await expect(cButton).toBeFocused();
    await recordFocusLoss(page);

    await releaseAudio(page, E2E_AUDIO.familyC.path);

    await expectCDownloadedFocusedOnStatus(page, sizeC);
    await familyStillDownloading(page);
    expect(await readFocusLostCount(page)).toBe(0);
  });
});
