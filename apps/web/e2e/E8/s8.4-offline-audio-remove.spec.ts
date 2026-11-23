import { expect, test, type Page } from '@playwright/test';

import {
  GREET_DOWNLOAD_LABEL,
  removedMessage,
} from './offline-audio-errors.helpers';
import {
  GREET,
  GREET_AUDIO,
  GREET_LESSON_ID,
  blockText,
  clickDownload,
  downloadButton,
  expectDownloaded,
  expectDownloading,
  listenToGreetAudio,
  openLearningPath,
  readStatusLog,
  recordStatusLog,
  removeButton,
} from './offline-audio-download.helpers';
import {
  expectListenPlays,
  expectQuestion,
  installAudioRecorder,
  passSpeakQuestion,
} from './offline-audio-offline.helpers';
import {
  E2E_AUDIO,
  goOffline,
  offlineAudioBlock,
  openLessonByUrl,
  openOnceWithServiceWorker,
  releaseAudio,
  setAudioNetwork,
  unitTitle,
  useOfflineAudioFixture,
} from './offline-audio.helpers';

const FAMILY = unitTitle('family');
const FAMILY_LESSON_ID = 'e2e-family';
const FAMILY_DOWNLOAD_LABEL = 'Tải audio (1,1 MB)';
/** Bài "Gia đình": câu 1 audio chung Chào hỏi–Gia đình, câu 2 chung Gia đình–C, câu 3 chỉ thuộc "Gia đình". */
const FAMILY_ONLY_POSITION = 3;
const FAMILY_TOTAL = 3;
/** Audio "Chào hỏi" chưa có trên máy sau khi "Gia đình" tải xong (ba file chỉ thuộc "Chào hỏi"). */
const GREET_ONLY_AUDIO = GREET_AUDIO.slice(1);

/** Tải "Chào hỏi" khi có mạng và chờ khối thành "Đã tải audio (2,4 MB)". */
const downloadGreet = async (page: Page): Promise<void> => {
  await openLearningPath(page);
  await clickDownload(page, GREET);
  await expectDownloaded(page, GREET, '2,4 MB');
};

/** Khối "Chào hỏi" hiện "Đã xóa audio của chủ đề Chào hỏi." và có lại nút "Tải audio (2,4 MB)". */
const expectGreetRemoved = async (page: Page): Promise<void> => {
  await expect(blockText(page, GREET, removedMessage(GREET))).toBeVisible();
  await expect(downloadButton(page, GREET)).toHaveText(GREET_DOWNLOAD_LABEL);
  await expect(removeButton(page, GREET)).toHaveCount(0);
  await expect(
    offlineAudioBlock(page, GREET).getByText(/Đã tải audio/),
  ).toHaveCount(0);
};

/** Các mức "Đang tải N%" khối từng hiện, theo thứ tự. */
const downloadingPercents = (statuses: readonly string[]): number[] =>
  statuses.flatMap((status) => {
    const match = /^Đang tải (\d+)%$/.exec(status);
    return match ? [Number(match[1])] : [];
  });

test.describe('S8.4 Xóa audio đã tải', () => {
  test.beforeEach(async ({ context, page }) => {
    await useOfflineAudioFixture(context);
    await installAudioRecorder(page);
    await openOnceWithServiceWorker(page);
  });

  test('TC-S8.4-AC2-1: S8.4-AC2 Xóa audio đã tải', async ({ page }) => {
    const dialogs: string[] = [];
    page.on('dialog', async (dialog) => {
      dialogs.push(dialog.message());
      await dialog.dismiss();
    });
    await downloadGreet(page);

    await removeButton(page, GREET).click();

    await expectGreetRemoved(page);
    expect(dialogs, 'xóa không hỏi xác nhận').toEqual([]);
  });

  test('TC-S8.4-AC2-2: S8.4-AC2 Xóa audio đã tải (mở lại app)', async ({
    context,
    page,
  }) => {
    await downloadGreet(page);
    await removeButton(page, GREET).click();
    await expectGreetRemoved(page);

    await page.close();
    const reopened = await context.newPage();
    await openLearningPath(reopened);

    await expect(downloadButton(reopened, GREET)).toHaveText(
      GREET_DOWNLOAD_LABEL,
    );
    await expect(
      offlineAudioBlock(reopened, GREET).getByText(/Đã tải audio|Đang tải/),
    ).toHaveCount(0);
    await expect(removeButton(reopened, GREET)).toHaveCount(0);
  });

  test('TC-S8.4-AC2-3: S8.4-AC2 Xóa audio đã tải (đã nghe hết, không bấm tải)', async ({
    page,
  }) => {
    await listenToGreetAudio(page, GREET_AUDIO.length);
    await openLearningPath(page);
    await expectDownloaded(page, GREET, '2,4 MB');

    await removeButton(page, GREET).click();

    await expectGreetRemoved(page);
  });

  test('TC-S8.4-AC2-6: S8.4-AC2 Xóa không làm hỏng chủ đề khác đang tải', async ({
    context,
    page,
  }) => {
    await openLearningPath(page);
    await clickDownload(page, FAMILY);
    await expectDownloaded(page, FAMILY, '1,1 MB');
    await setAudioNetwork(page, { holdPaths: [...GREET_ONLY_AUDIO] });
    await recordStatusLog(page, GREET);
    await clickDownload(page, GREET);
    await expectDownloading(page, GREET, 25);

    await removeButton(page, FAMILY).click();

    await expect(blockText(page, FAMILY, removedMessage(FAMILY))).toBeVisible();
    await expect(downloadButton(page, FAMILY)).toHaveText(
      FAMILY_DOWNLOAD_LABEL,
    );
    await expectDownloading(page, GREET, 25);
    for (const path of GREET_ONLY_AUDIO) {
      await releaseAudio(page, path);
    }
    await expectDownloaded(page, GREET, '2,4 MB');
    const percents = downloadingPercents(await readStatusLog(page));
    expect(percents[0], 'tiến độ bắt đầu ở 25%').toBe(25);
    percents.forEach((percent, position) => {
      expect(
        percent,
        `tiến độ không lùi: ${percents.join(', ')}`,
      ).toBeGreaterThanOrEqual(percents[position - 1] ?? 0);
    });

    await goOffline(context, page);
    await openLessonByUrl(page, GREET_LESSON_ID);
    await expectQuestion(page, 1, GREET_AUDIO.length);
    await expectListenPlays(page, E2E_AUDIO.greetFamily.path);
  });

  test('TC-S8.4-AC2-8: S8.4-AC2 Tải lại sau khi xóa', async ({
    context,
    page,
  }) => {
    await downloadGreet(page);
    await removeButton(page, GREET).click();
    await expectGreetRemoved(page);

    await expect(clickDownload(page, GREET)).resolves.toBe(
      GREET_DOWNLOAD_LABEL,
    );

    await expectDownloaded(page, GREET, '2,4 MB');
    await expect(blockText(page, GREET, removedMessage(GREET))).toHaveCount(0);
    await goOffline(context, page);
    await openLessonByUrl(page, GREET_LESSON_ID);
    for (const [index, path] of GREET_AUDIO.entries()) {
      await expectQuestion(page, index + 1, GREET_AUDIO.length);
      await expectListenPlays(page, path);
      await passSpeakQuestion(page);
    }
  });

  test('TC-S8.4-AC2-9: S8.4-AC2 Xóa audio dùng chung thì chủ đề khác đã tải về chưa tải', async ({
    context,
    page,
  }) => {
    await downloadGreet(page);
    await clickDownload(page, FAMILY);
    await expectDownloaded(page, FAMILY, '1,1 MB');
    await expectDownloaded(page, GREET, '2,4 MB');

    await removeButton(page, GREET).click();

    await expectGreetRemoved(page);
    await expect(downloadButton(page, FAMILY)).toHaveText(
      FAMILY_DOWNLOAD_LABEL,
    );
    await expect(
      offlineAudioBlock(page, FAMILY).getByText(/Đã tải audio/),
    ).toHaveCount(0);
    await expect(
      offlineAudioBlock(page, FAMILY).getByText(/Đã xóa audio/),
    ).toHaveCount(0);

    await goOffline(context, page);
    await openLessonByUrl(page, FAMILY_LESSON_ID);
    for (let position = 1; position < FAMILY_ONLY_POSITION; position += 1) {
      await expectQuestion(page, position, FAMILY_TOTAL);
      await passSpeakQuestion(page);
    }
    await expectQuestion(page, FAMILY_ONLY_POSITION, FAMILY_TOTAL);
    await expectListenPlays(page, E2E_AUDIO.familyOnly.path);
  });

  test('TC-S8.4-AC2-16: S8.4-AC2 Nút xóa có tên kèm chủ đề', async ({
    page,
  }) => {
    await downloadGreet(page);

    await expect(
      page.getByRole('button', {
        name: `Xóa audio, chủ đề ${GREET}`,
        exact: true,
      }),
    ).toHaveCount(1);
  });
});
