import { expect, test } from '@playwright/test';

import {
  downloadWithKeyboard,
  readAnnouncerSnapshots,
  readFocusLostCount,
  recordAnnouncer,
  recordFocusLoss,
  shiftTabToLessonLink,
  tabTo,
} from './offline-audio-a11y.helpers';
import {
  DOWNLOAD_INCOMPLETE,
  GREET_DOWNLOAD_LABEL,
  removedMessage,
} from './offline-audio-errors.helpers';
import {
  GREET,
  GREET_AUDIO,
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
  announcer,
  goOffline,
  offlineAudioBlock,
  openOnceWithServiceWorker,
  releaseAudio,
  servedAudio,
  setAudioNetwork,
  unitTitle,
  useOfflineAudioFixture,
} from './offline-audio.helpers';

const FAMILY = unitTitle('family');
const GREET_STARTED = `Đang tải audio chủ đề ${GREET}.`;
const finishedMessage = (title: string): string =>
  `Đã tải xong audio chủ đề ${title}.`;
const PROGRESS_SENTENCES = ['Đang tải 25%', 'Đang tải 50%', 'Đang tải 75%'];
/** Audio "Gia đình" ngoài audio chung với "Chào hỏi" (đã có trong `GREET_AUDIO`). */
const FAMILY_OWN_AUDIO = [E2E_AUDIO.familyC.path, E2E_AUDIO.familyOnly.path];

test.describe('S8.4 Tải audio offline — bàn phím, focus và vùng thông báo', () => {
  test.beforeEach(async ({ context, page }) => {
    await useOfflineAudioFixture(context);
    await openOnceWithServiceWorker(page);
  });

  test('TC-S8.4-AC1-56: S8.4-AC1 Tải bằng bàn phím và nghe được kết quả', async ({
    page,
  }) => {
    await setAudioNetwork(page, { holdPaths: [...GREET_AUDIO] });
    await openLearningPath(page);
    await recordAnnouncer(page);

    await downloadWithKeyboard(page, GREET);

    await expect(
      announcer(page).getByText(GREET_STARTED, { exact: true }),
    ).toHaveCount(1);
    for (const [index, path] of GREET_AUDIO.entries()) {
      await releaseAudio(page, path);
      if (index < GREET_AUDIO.length - 1) {
        await expectDownloading(page, GREET, (index + 1) * 25);
      }
    }
    await expectDownloaded(page, GREET, '2,4 MB');
    await expect(
      announcer(page).getByText(finishedMessage(GREET), { exact: true }),
    ).toHaveCount(1);

    const snapshots = await readAnnouncerSnapshots(page);
    const everAnnounced = snapshots.flat().join('\n');
    for (const sentence of PROGRESS_SENTENCES) {
      expect(everAnnounced).not.toContain(sentence);
    }
  });

  test('TC-S8.4-AC1-58: S8.4-AC1 Hai chủ đề báo cùng lúc thì đọc đủ cả hai', async ({
    page,
  }) => {
    await setAudioNetwork(page, {
      holdPaths: [...GREET_AUDIO, ...FAMILY_OWN_AUDIO],
    });
    await openLearningPath(page);
    await recordAnnouncer(page);
    await clickDownload(page, GREET);
    await clickDownload(page, FAMILY);

    // Mọi file trừ file cuối của mỗi chủ đề về trước.
    for (const path of [...GREET_AUDIO.slice(0, -1), E2E_AUDIO.familyC.path]) {
      await releaseAudio(page, path);
    }
    await expectDownloading(page, GREET, 75);
    await expect
      .poll(async () =>
        (await servedAudio(page)).includes(E2E_AUDIO.familyC.path),
      )
      .toBe(true);
    await expect(
      offlineAudioBlock(page, FAMILY).getByText(/^Đang tải [1-9]\d?%$/),
    ).toBeVisible();

    // Thả file cuối của hai chủ đề cách nhau dưới một giây.
    const startedAt = Date.now();
    await releaseAudio(page, E2E_AUDIO.greetOnly3.path);
    await releaseAudio(page, E2E_AUDIO.familyOnly.path);
    expect(Date.now() - startedAt).toBeLessThan(1000);

    await expectDownloaded(page, GREET, '2,4 MB');
    await expectDownloaded(page, FAMILY, '1,1 MB');
    const finished = [finishedMessage(GREET), finishedMessage(FAMILY)];
    for (const sentence of finished) {
      await expect(
        announcer(page).getByText(sentence, { exact: true }),
      ).toHaveCount(1);
    }

    // Khi câu xong thứ hai xuất hiện, câu xong thứ nhất vẫn còn trong vùng thông báo.
    const snapshots = await readAnnouncerSnapshots(page);
    const firstWithBoth = snapshots.findIndex((sentences) =>
      finished.every((sentence) => sentences.includes(sentence)),
    );
    expect(firstWithBoth).toBeGreaterThan(-1);
    const firstWithAny = snapshots.findIndex((sentences) =>
      finished.some((sentence) => sentences.includes(sentence)),
    );
    const firstSentence = finished.find((sentence) =>
      snapshots[firstWithAny]?.includes(sentence),
    );
    for (const sentences of snapshots.slice(firstWithAny, firstWithBoth + 1)) {
      expect(sentences).toContain(firstSentence);
    }
  });

  test('TC-S8.4-AC1-60: S8.4-AC1 Focus khi bắt đầu và khi tải xong', async ({
    page,
  }) => {
    await setAudioNetwork(page, { holdPaths: [...GREET_AUDIO] });
    await openLearningPath(page);
    await tabTo(page, downloadButton(page, GREET));
    await recordFocusLoss(page);

    await page.keyboard.press('Enter');

    for (const [index, path] of GREET_AUDIO.entries()) {
      await expect(
        blockText(page, GREET, `Đang tải ${index * 25}%`),
      ).toBeFocused();
      await releaseAudio(page, path);
    }
    await expectDownloaded(page, GREET, '2,4 MB');
    await expect(removeButton(page, GREET)).toBeFocused();
    expect(await readFocusLostCount(page)).toBe(0);
  });

  test('TC-S8.4-AC1-63: S8.4-AC1 Focus khi tải lỗi', async ({
    context,
    page,
  }) => {
    await setAudioNetwork(page, { holdPaths: [...GREET_AUDIO] });
    await openLearningPath(page);
    await downloadWithKeyboard(page, GREET);
    await releaseAudio(page, GREET_AUDIO[0]);
    await releaseAudio(page, GREET_AUDIO[1]);
    await expectDownloading(page, GREET, 50);

    await goOffline(context, page);

    await expect(blockText(page, GREET, DOWNLOAD_INCOMPLETE)).toBeVisible();
    await expect(downloadButton(page, GREET)).toHaveText(GREET_DOWNLOAD_LABEL);
    await expect(downloadButton(page, GREET)).toBeFocused();
    await expect(
      announcer(page).getByText(DOWNLOAD_INCOMPLETE, { exact: true }),
    ).toHaveCount(1);
  });

  test('TC-S8.4-AC1-64: S8.4-AC1 Không kéo focus khi người học đã đi chỗ khác', async ({
    page,
  }) => {
    await setAudioNetwork(page, { holdPaths: [...GREET_AUDIO] });
    await openLearningPath(page);
    await downloadWithKeyboard(page, GREET);
    await expectDownloading(page, GREET, 0);

    const lessonTitle = await shiftTabToLessonLink(page);
    const lessonLink = page
      .locator('a.learning-path-lesson-link')
      .filter({ hasText: lessonTitle });
    await expect(lessonLink).toBeFocused();
    for (const path of GREET_AUDIO) {
      await releaseAudio(page, path);
    }

    await expectDownloaded(page, GREET, '2,4 MB');
    await expect(lessonLink).toBeFocused();
  });

  test('TC-S8.4-AC2-19: S8.4-AC2 Focus và thông báo khi xóa bằng bàn phím', async ({
    page,
  }) => {
    await openLearningPath(page);
    await downloadWithKeyboard(page, GREET);
    await expectDownloaded(page, GREET, '2,4 MB');

    await tabTo(page, removeButton(page, GREET));
    await page.keyboard.press('Enter');

    await expect(downloadButton(page, GREET)).toHaveText(GREET_DOWNLOAD_LABEL);
    await expect(downloadButton(page, GREET)).toBeFocused();
    await expect(
      announcer(page).getByText(removedMessage(GREET), { exact: true }),
    ).toHaveCount(1);
  });
});
