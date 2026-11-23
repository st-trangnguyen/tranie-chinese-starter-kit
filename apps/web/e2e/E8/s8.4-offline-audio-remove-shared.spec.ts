import { expect, test, type Page } from '@playwright/test';

import {
  DOWNLOAD_INCOMPLETE,
  removedMessage,
} from './offline-audio-errors.helpers';
import {
  blockText,
  clickDownload,
  downloadButton,
  expectDownloaded,
  expectDownloading,
  openLearningPath,
  removeButton,
} from './offline-audio-download.helpers';
import { INTRO_UNIT_TITLE } from './offline-audio-offline.helpers';
import {
  E2E_AUDIO,
  goOffline,
  offlineAudioBlock,
  openOnceWithServiceWorker,
  releaseAudio,
  setAudioNetwork,
  unitTitle,
  useOfflineAudioFixture,
} from './offline-audio.helpers';

const FAMILY = unitTitle('family');
const TOPIC_C = unitTitle('c');
const ROUNDS = [
  unitTitle('round-1'),
  unitTitle('round-2'),
  unitTitle('round-3'),
] as const;
const PAIRS = [unitTitle('pair-1'), unitTitle('pair-2')] as const;
/** Audio "Gia đình" chưa có trên máy khi C đã tải (audio chung Gia đình–C đã có). */
const FAMILY_MISSING_AUDIO = [
  E2E_AUDIO.greetFamily.path,
  E2E_AUDIO.familyOnly.path,
] as const;

/** Nhãn nút tải hiện tại của các chủ đề (dạng "Tải audio (<dung lượng>)"). */
const readDownloadLabels = async (
  page: Page,
  titles: readonly string[],
): Promise<Map<string, string>> => {
  const labels = new Map<string, string>();
  for (const title of titles) {
    await expect(downloadButton(page, title)).toHaveText(/^Tải audio \(.+\)$/);
    labels.set(title, (await downloadButton(page, title).innerText()).trim());
  }
  return labels;
};

const labelOf = (
  labels: ReadonlyMap<string, string>,
  title: string,
): string => {
  const label = labels.get(title);
  if (label === undefined) {
    throw new Error(`Chưa đọc nhãn tải của "${title}".`);
  }
  return label;
};

/** Dung lượng trong nhãn "Tải audio (<dung lượng>)". */
const sizeOf = (label: string): string =>
  label.replace(/^Tải audio \((.+)\)$/, '$1');

/** Khối của `title` có lại đúng nút tải ban đầu, không còn "Đã tải audio" hay nút xóa. */
const expectNotDownloaded = async (
  page: Page,
  title: string,
  label: string,
): Promise<void> => {
  await expect(downloadButton(page, title)).toHaveText(label);
  await expect(removeButton(page, title)).toHaveCount(0);
  await expect(
    offlineAudioBlock(page, title).getByText(/Đã tải audio/),
  ).toHaveCount(0);
};

/** Khối của `title` hiện "Đã xóa audio của chủ đề <title>." và nút tải ban đầu. */
const expectRemoved = async (
  page: Page,
  title: string,
  label: string,
): Promise<void> => {
  await expect(blockText(page, title, removedMessage(title))).toBeVisible();
  await expectNotDownloaded(page, title, label);
};

/** Khối hiện "Đã tải audio (<size>)" nhưng không có nút "Xóa audio" (cũng không có nút tải). */
const expectDownloadedWithoutRemove = async (
  page: Page,
  title: string,
  size: string,
): Promise<void> => {
  await expect(blockText(page, title, `Đã tải audio (${size})`)).toBeVisible();
  await expect(removeButton(page, title)).toHaveCount(0);
  await expect(downloadButton(page, title)).toHaveCount(0);
};

test.describe('S8.4 Xóa audio dùng chung giữa các chủ đề', () => {
  test.beforeEach(async ({ context, page }) => {
    await useOfflineAudioFixture(context);
    await openOnceWithServiceWorker(page);
    await openLearningPath(page);
  });

  test('TC-S8.4-AC2-10: S8.4-AC2 Chủ đề dùng chung audio vòng tròn vẫn xóa được', async ({
    page,
  }) => {
    const labels = await readDownloadLabels(page, ROUNDS);
    const [round1, round2, round3] = ROUNDS;
    await clickDownload(page, round1);
    await expectDownloaded(page, round1, sizeOf(labelOf(labels, round1)));
    await clickDownload(page, round2);
    await expectDownloaded(page, round2, sizeOf(labelOf(labels, round2)));

    for (const title of ROUNDS) {
      await expectDownloaded(page, title, sizeOf(labelOf(labels, title)));
    }
    await removeButton(page, round1).click();

    await expectRemoved(page, round1, labelOf(labels, round1));
    await expectNotDownloaded(page, round2, labelOf(labels, round2));
    await expectNotDownloaded(page, round3, labelOf(labels, round3));
  });

  test('TC-S8.4-AC2-11: S8.4-AC2 Hai chủ đề cùng bộ audio vẫn xóa được', async ({
    page,
  }) => {
    const labels = await readDownloadLabels(page, PAIRS);
    const [pair1, pair2] = PAIRS;
    await clickDownload(page, pair1);

    for (const title of PAIRS) {
      await expectDownloaded(page, title, sizeOf(labelOf(labels, title)));
    }
    await removeButton(page, pair1).click();

    await expectRemoved(page, pair1, labelOf(labels, pair1));
    await expectNotDownloaded(page, pair2, labelOf(labels, pair2));
  });

  test('TC-S8.4-AC2-12: S8.4-AC2 Chủ đề đã tải luôn có nút xóa khi không có chủ đề nào đang tải', async ({
    page,
  }) => {
    const labels = await readDownloadLabels(page, PAIRS);
    const [pair1, pair2] = PAIRS;
    await clickDownload(page, pair2);
    await expectDownloaded(page, pair2, sizeOf(labelOf(labels, pair2)));

    await expectDownloaded(page, pair1, sizeOf(labelOf(labels, pair1)));
  });

  test('TC-S8.4-AC2-13: S8.4-AC2 Chủ đề đã tải luôn có nút xóa khi không có chủ đề nào đang tải (audio Nhập môn)', async ({
    page,
  }) => {
    const labels = await readDownloadLabels(page, [FAMILY, TOPIC_C]);
    await clickDownload(page, FAMILY);
    await expectDownloaded(page, FAMILY, sizeOf(labelOf(labels, FAMILY)));

    await expectDownloaded(page, TOPIC_C, sizeOf(labelOf(labels, TOPIC_C)));
    await removeButton(page, TOPIC_C).click();

    await expectRemoved(page, TOPIC_C, labelOf(labels, TOPIC_C));
    await expectNotDownloaded(page, FAMILY, labelOf(labels, FAMILY));
    await expect(offlineAudioBlock(page, INTRO_UNIT_TITLE)).toHaveText(
      'Audio có sẵn offline',
    );
  });

  test('TC-S8.4-AC2-14: S8.4-AC2 Audio đang được chủ đề khác tải thì tạm chưa có nút xóa', async ({
    page,
  }) => {
    const labels = await readDownloadLabels(page, [TOPIC_C]);
    const sizeC = sizeOf(labelOf(labels, TOPIC_C));
    await clickDownload(page, TOPIC_C);
    await expectDownloaded(page, TOPIC_C, sizeC);
    await setAudioNetwork(page, { holdPaths: [...FAMILY_MISSING_AUDIO] });

    await clickDownload(page, FAMILY);
    await expectDownloading(page, FAMILY, 33);

    await expectDownloadedWithoutRemove(page, TOPIC_C, sizeC);
    for (const path of FAMILY_MISSING_AUDIO) {
      await releaseAudio(page, path);
    }
    await expectDownloaded(page, FAMILY, '1,1 MB');
    await expectDownloaded(page, TOPIC_C, sizeC);
  });

  test('TC-S8.4-AC2-15: S8.4-AC2 Audio đang được chủ đề khác tải thì tạm chưa có nút xóa (mất mạng)', async ({
    context,
    page,
  }) => {
    const labels = await readDownloadLabels(page, [TOPIC_C]);
    const sizeC = sizeOf(labelOf(labels, TOPIC_C));
    await clickDownload(page, TOPIC_C);
    await expectDownloaded(page, TOPIC_C, sizeC);
    await setAudioNetwork(page, { holdPaths: [...FAMILY_MISSING_AUDIO] });
    await clickDownload(page, FAMILY);
    await expectDownloading(page, FAMILY, 33);
    await expectDownloadedWithoutRemove(page, TOPIC_C, sizeC);

    await goOffline(context, page);

    await expect(blockText(page, FAMILY, DOWNLOAD_INCOMPLETE)).toBeVisible();
    await expect(downloadButton(page, FAMILY)).toHaveText(/^Tải audio/);
    await expectDownloaded(page, TOPIC_C, sizeC);
  });
});
