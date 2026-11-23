import { expect, test, type Page } from '@playwright/test';

import {
  GREET,
  GREET_AUDIO,
  clickDownload,
  downloadButton,
  expectDownloaded,
  expectDownloading,
  isInAudioCache,
  listenToGreetAudio,
  openLearningPath,
  readStatusLog,
  recordStatusLog,
} from './offline-audio-download.helpers';
import {
  E2E_AUDIO,
  openOnceWithServiceWorker,
  releaseAudio,
  setAudioNetwork,
  unitSection,
  unitTitle,
  useOfflineAudioFixture,
} from './offline-audio.helpers';

const FAMILY = unitTitle('family');
const KB = unitTitle('kb');
const FAMILY_AUDIO = [
  E2E_AUDIO.greetFamily.path,
  E2E_AUDIO.familyC.path,
  E2E_AUDIO.familyOnly.path,
] as const;
const KB_AUDIO = [E2E_AUDIO.kb1.path, E2E_AUDIO.kb2.path] as const;
const INTRO_UNIT_TITLE = 'Pinyin và chữ Hán cơ bản';

/** Vào một bài Nhập môn bằng link trên bản đồ (điều hướng trong app, việc tải vẫn chạy). */
const enterIntroLesson = async (page: Page): Promise<void> => {
  await unitSection(page, INTRO_UNIT_TITLE)
    .getByRole('listitem')
    .first()
    .getByRole('link')
    .click();
  await expect(
    page.getByRole('button', { name: /^Nghe/ }).first(),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/lessons\/intro-/);
};

/** Quay lại màn Lộ trình bằng nút Back của trình duyệt (không tải lại trang). */
const backToLearningPath = async (page: Page): Promise<void> => {
  await page.goBack();
  await expect(unitSection(page, GREET)).toBeVisible();
};

const greetCachedCount = async (page: Page): Promise<number> => {
  const flags = await Promise.all(
    GREET_AUDIO.map((path) => isInAudioCache(page, path)),
  );
  return flags.filter(Boolean).length;
};

test.describe('S8.4 Tải audio offline — tiến độ tải', () => {
  test.beforeEach(async ({ context, page }) => {
    await useOfflineAudioFixture(context);
    await openOnceWithServiceWorker(page);
  });

  test('TC-S8.4-AC1-16: S8.4-AC1 Tải hai chủ đề cùng lúc', async ({ page }) => {
    await setAudioNetwork(page, { holdPaths: [...GREET_AUDIO, ...KB_AUDIO] });
    await openLearningPath(page);

    await clickDownload(page, GREET);
    await expectDownloading(page, GREET, 0);
    await clickDownload(page, KB);
    await expectDownloading(page, GREET, 0);
    await expectDownloading(page, KB, 0);

    await releaseAudio(page, GREET_AUDIO[0]);
    await expectDownloading(page, GREET, 25);
    await expectDownloading(page, KB, 0);

    await releaseAudio(page, KB_AUDIO[0]);
    await expectDownloading(page, KB, 50);
    await expectDownloading(page, GREET, 25);

    await releaseAudio(page, GREET_AUDIO[1]);
    await expectDownloading(page, GREET, 50);
    await releaseAudio(page, GREET_AUDIO[2]);
    await expectDownloading(page, GREET, 75);
    await expectDownloading(page, KB, 50);

    await releaseAudio(page, GREET_AUDIO[3]);
    await releaseAudio(page, KB_AUDIO[1]);
    await expectDownloaded(page, GREET, '2,4 MB');
    await expectDownloaded(page, KB, '850 KB');
  });

  test('TC-S8.4-AC1-22: S8.4-AC1 Hiện tiến độ khi đang tải', async ({
    page,
  }) => {
    await setAudioNetwork(page, { holdPaths: [...GREET_AUDIO] });
    await openLearningPath(page);
    await recordStatusLog(page, GREET);

    await clickDownload(page, GREET);
    for (const [index, path] of GREET_AUDIO.slice(0, 3).entries()) {
      await releaseAudio(page, path);
      await expectDownloading(page, GREET, (index + 1) * 25);
    }
    await releaseAudio(page, GREET_AUDIO[3]);
    await expectDownloaded(page, GREET, '2,4 MB');

    const log = await readStatusLog(page);
    expect(log.at(-1)).toBe('Đã tải audio (2,4 MB)');
    const percents = log
      .slice(0, -1)
      .map((text) => /^Đang tải (\d+)%$/.exec(text)?.[1])
      .map(Number);
    expect(percents).toEqual(expect.arrayContaining([25, 50, 75]));
    expect(percents).not.toContain(100);
    expect(percents).toEqual([...percents].sort((a, b) => a - b));
  });

  test('TC-S8.4-AC1-25: S8.4-AC1 Tiến độ làm tròn xuống', async ({ page }) => {
    await setAudioNetwork(page, { holdPaths: [...FAMILY_AUDIO] });
    await openLearningPath(page);
    await expect(downloadButton(page, FAMILY)).toHaveText('Tải audio (1,1 MB)');

    await clickDownload(page, FAMILY);
    await releaseAudio(page, FAMILY_AUDIO[0]);
    await expectDownloading(page, FAMILY, 33);
    await releaseAudio(page, FAMILY_AUDIO[1]);
    await expectDownloading(page, FAMILY, 66);
    await releaseAudio(page, FAMILY_AUDIO[2]);

    await expectDownloaded(page, FAMILY, '1,1 MB');
  });

  test('TC-S8.4-AC1-26: S8.4-AC1 Tiến độ tính cả file đã có từ trước', async ({
    page,
  }) => {
    await listenToGreetAudio(page, 2);
    await setAudioNetwork(page, { holdPaths: GREET_AUDIO.slice(2) });
    await openLearningPath(page);
    await expect(downloadButton(page, GREET)).toHaveText('Tải audio (2,4 MB)');
    await recordStatusLog(page, GREET);

    await clickDownload(page, GREET);
    await expectDownloading(page, GREET, 50);
    await releaseAudio(page, GREET_AUDIO[2]);
    await expectDownloading(page, GREET, 75);
    await releaseAudio(page, GREET_AUDIO[3]);

    await expectDownloaded(page, GREET, '2,4 MB');
    // Ngay khi bấm đã là 50% (2 file nghe trước đó), không đi qua 0% hay 25%.
    expect(await readStatusLog(page)).toEqual([
      'Đang tải 50%',
      'Đang tải 75%',
      'Đã tải audio (2,4 MB)',
    ]);
  });

  test('TC-S8.4-AC1-49: S8.4-AC1 Rời màn khi đang tải', async ({ page }) => {
    await setAudioNetwork(page, { holdPaths: [...GREET_AUDIO] });
    await openLearningPath(page);
    await clickDownload(page, GREET);
    await expectDownloading(page, GREET, 0);

    await enterIntroLesson(page);
    for (const path of GREET_AUDIO) {
      await releaseAudio(page, path);
    }
    await expect
      .poll(() => greetCachedCount(page), {
        message: 'việc tải phải chạy tiếp khi người học ở màn bài',
      })
      .toBe(GREET_AUDIO.length);

    await backToLearningPath(page);
    await expectDownloaded(page, GREET, '2,4 MB');
  });

  test('TC-S8.4-AC1-50: S8.4-AC1 Quay lại màn khi việc tải còn đang chạy', async ({
    page,
  }) => {
    await setAudioNetwork(page, { holdPaths: [...GREET_AUDIO] });
    await openLearningPath(page);
    await clickDownload(page, GREET);
    await expectDownloading(page, GREET, 0);

    await enterIntroLesson(page);
    await releaseAudio(page, GREET_AUDIO[0]);
    await releaseAudio(page, GREET_AUDIO[1]);
    await expect.poll(() => greetCachedCount(page)).toBe(2);

    await backToLearningPath(page);
    await expectDownloading(page, GREET, 50);

    await releaseAudio(page, GREET_AUDIO[2]);
    await releaseAudio(page, GREET_AUDIO[3]);
    await expectDownloaded(page, GREET, '2,4 MB');
  });
});
