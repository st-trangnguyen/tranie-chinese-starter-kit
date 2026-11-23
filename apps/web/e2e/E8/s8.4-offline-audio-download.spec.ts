import { expect, test } from '@playwright/test';

import {
  GREET,
  blockText,
  clickDownload,
  downloadButton,
  expectDownloaded,
  listenToGreetAudio,
  openLearningPath,
  removeButton,
} from './offline-audio-download.helpers';
import {
  LEARNING_PATH_URL,
  goOffline,
  offlineAudioBlock,
  openOnceWithServiceWorker,
  unitSection,
  unitTitle,
  useOfflineAudioFixture,
} from './offline-audio.helpers';

const MIN_TOUCH_TARGET = 44;
const FAMILY = unitTitle('family');
const TOPIC_C = unitTitle('c');
const LOCKED = unitTitle('locked');

/** Chủ đề không dùng chung audio với "Chào hỏi" và nhãn tải ban đầu của chúng. */
const UNRELATED_LABELS = [
  [unitTitle('kb'), 'Tải audio (850 KB)'],
  [unitTitle('mb13'), 'Tải audio (1,3 MB)'],
  [unitTitle('near-mb'), 'Tải audio (1,0 MB)'],
] as const;

test.describe('S8.4 Tải audio offline — tải và trạng thái đã tải', () => {
  test.beforeEach(async ({ context, page }) => {
    await useOfflineAudioFixture(context);
    await openOnceWithServiceWorker(page);
  });

  test('TC-S8.4-AC1-6: S8.4-AC1 Đã tải thì hiện dung lượng và nút xóa', async ({
    page,
  }) => {
    await openLearningPath(page);
    await clickDownload(page, GREET);

    await expectDownloaded(page, GREET, '2,4 MB');
  });

  test('TC-S8.4-AC1-7: S8.4-AC1 Đã tải thì hiện dung lượng và nút xóa (375×812)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openLearningPath(page);
    await clickDownload(page, GREET);
    await expectDownloaded(page, GREET, '2,4 MB');

    const status = blockText(page, GREET, 'Đã tải audio (2,4 MB)');
    const button = removeButton(page, GREET);
    await button.scrollIntoViewIfNeeded();
    await expect(status).toBeInViewport({ ratio: 1 });
    await expect(button).toBeInViewport({ ratio: 1 });

    const statusBox = await status.boundingBox();
    const buttonBox = await button.boundingBox();
    expect(statusBox).not.toBeNull();
    expect(buttonBox).not.toBeNull();
    const isOverlapping =
      statusBox !== null &&
      buttonBox !== null &&
      statusBox.x < buttonBox.x + buttonBox.width &&
      buttonBox.x < statusBox.x + statusBox.width &&
      statusBox.y < buttonBox.y + buttonBox.height &&
      buttonBox.y < statusBox.y + statusBox.height;
    expect(isOverlapping).toBe(false);
    expect(buttonBox?.width ?? 0).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    expect(buttonBox?.height ?? 0).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);

    const hasHorizontalScroll = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(hasHorizontalScroll).toBe(false);
  });

  test('TC-S8.4-AC1-9: S8.4-AC1 Thiếu một phần audio thì là chưa tải', async ({
    page,
  }) => {
    await listenToGreetAudio(page, 3);
    await openLearningPath(page);

    await expect(downloadButton(page, GREET)).toHaveText('Tải audio (2,4 MB)');
    await expect(
      offlineAudioBlock(page, GREET).getByText(/Đã tải audio/),
    ).toHaveCount(0);
    await expect(removeButton(page, GREET)).toHaveCount(0);
  });

  test('TC-S8.4-AC1-10: S8.4-AC1 Đã nghe hết audio thì là đã tải', async ({
    page,
  }) => {
    await listenToGreetAudio(page, 4);
    await openLearningPath(page);

    await expectDownloaded(page, GREET, '2,4 MB');
  });

  test('TC-S8.4-AC1-15: S8.4-AC1 Bấm tải thì audio của chủ đề có trên máy', async ({
    page,
  }) => {
    await openLearningPath(page);
    await expect(downloadButton(page, FAMILY)).toHaveText('Tải audio (1,1 MB)');
    await expect(downloadButton(page, TOPIC_C)).toHaveText(
      /^Tải audio \(.+\)$/,
    );
    const topicCLabel = (
      await downloadButton(page, TOPIC_C).innerText()
    ).trim();

    await clickDownload(page, GREET);
    await expectDownloaded(page, GREET, '2,4 MB');

    await expect(downloadButton(page, FAMILY)).toHaveText('Tải audio (1,1 MB)');
    await expect(downloadButton(page, TOPIC_C)).toHaveText(topicCLabel);
    for (const [title, label] of UNRELATED_LABELS) {
      await expect(downloadButton(page, title)).toHaveText(label);
      await expect(
        offlineAudioBlock(page, title).getByText(/Đã tải audio|Đang tải/),
      ).toHaveCount(0);
    }
  });

  test('TC-S8.4-AC1-19: S8.4-AC1 Mở lại app vẫn thấy đã tải', async ({
    context,
    page,
  }) => {
    await openLearningPath(page);
    await clickDownload(page, GREET);
    await expectDownloaded(page, GREET, '2,4 MB');

    await page.close();
    const reopened = await context.newPage();
    await openLearningPath(reopened);

    await expectDownloaded(reopened, GREET, '2,4 MB');
  });

  test('TC-S8.4-AC1-20: S8.4-AC1 Mở lại app vẫn thấy đã tải (offline)', async ({
    context,
    page,
  }) => {
    await openLearningPath(page);
    await clickDownload(page, GREET);
    await expectDownloaded(page, GREET, '2,4 MB');

    await goOffline(context, page);
    await page.close();
    const reopened = await context.newPage();
    await reopened.goto(LEARNING_PATH_URL);

    await expectDownloaded(reopened, GREET, '2,4 MB');
  });

  test('TC-S8.4-AC1-21: S8.4-AC1 Chủ đề đang khóa vẫn tải được', async ({
    page,
  }) => {
    await openLearningPath(page);
    const section = unitSection(page, LOCKED);
    const lessonStatuses = section.getByRole('listitem');
    await expect(lessonStatuses).not.toHaveCount(0);
    await expect(section.getByRole('link', { name: /Bài/ })).toHaveCount(0);

    const label = await clickDownload(page, LOCKED);
    const size = label.replace(/^Tải audio \((.+)\)$/, '$1');

    await expectDownloaded(page, LOCKED, size);
    for (const item of await lessonStatuses.all()) {
      await expect(item).toContainText('Đã khóa');
    }
  });
});
