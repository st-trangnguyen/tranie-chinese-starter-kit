import { expect, test } from '@playwright/test';

import {
  STORAGE_FULL,
  expectGreetFailed,
} from './offline-audio-errors.helpers';
import {
  GREET,
  GREET_AUDIO,
  clickDownload,
  isInAudioCache,
  openLearningPath,
} from './offline-audio-download.helpers';
import {
  announcer,
  simulateStorageFull,
  useOfflineAudioFixture,
} from './offline-audio.helpers';

/** File "Chào hỏi" mà bộ nhớ báo hết chỗ khi lưu (file thứ hai trong thứ tự tải). */
const FULL_PATH = GREET_AUDIO[1];

/*
 * Design D12: chặn service worker để `put` đã vá trong trang là lần ghi cache duy nhất (SW không lưu
 * file trước khi `put` của trang ném lỗi). Hai TC này chỉ kiểm thông báo và nút tải.
 */
test.describe('S8.4 Tải audio offline — không đủ bộ nhớ', () => {
  test.use({ serviceWorkers: 'block' });

  test.beforeEach(async ({ context, page }) => {
    await useOfflineAudioFixture(context);
    await simulateStorageFull(page, [FULL_PATH]);
    await openLearningPath(page);
    await clickDownload(page, GREET);
  });

  test('TC-S8.4-AC1-41: S8.4-AC1 Không đủ bộ nhớ', async ({ page }) => {
    await expectGreetFailed(page, STORAGE_FULL);
    expect(
      await isInAudioCache(page, FULL_PATH),
      'file báo hết bộ nhớ không được có trong audio-cache',
    ).toBe(false);
  });

  test('TC-S8.4-AC1-42: S8.4-AC1 Không đủ bộ nhớ (vùng thông báo)', async ({
    page,
  }) => {
    await expect(
      announcer(page).getByText(STORAGE_FULL, { exact: true }),
    ).toHaveCount(1);
  });
});
