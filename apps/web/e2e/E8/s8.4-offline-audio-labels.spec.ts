import { expect, test, type Locator, type Page } from '@playwright/test';

import {
  LEARNING_PATH_URL,
  OFFLINE_AUDIO_STAGE,
  offlineAudioBlock,
  unitSection,
  unitTitle,
  useOfflineAudioFixture,
} from './offline-audio.helpers';

/** Chủ đề Nhập môn thật (có audio, nằm trong precache). */
const INTRO_UNIT_TITLE = 'Pinyin và chữ Hán cơ bản';
const GREET = unitTitle('greet');
const DOWNLOAD_TEXT = /^Tải audio/;
const MAX_TABS = 80;
const MIN_TOUCH_TARGET = 44;

const openLearningPath = async (page: Page): Promise<void> => {
  await page.goto(LEARNING_PATH_URL);
  await expect(
    page.getByRole('heading', { level: 2, name: OFFLINE_AUDIO_STAGE.title }),
  ).toBeVisible();
};

const downloadButtons = (page: Page, title: string): Locator =>
  unitSection(page, title).getByRole('button', { name: DOWNLOAD_TEXT });

const removeButtons = (page: Page, title: string): Locator =>
  unitSection(page, title).getByRole('button', { name: /^Xóa audio/ });

const isFocused = (locator: Locator): Promise<boolean> =>
  locator.evaluate((element) => element === document.activeElement);

const expectDownloadLabel = async (
  page: Page,
  title: string,
  size: string,
): Promise<void> => {
  const buttons = downloadButtons(page, title);
  await expect(buttons).toHaveCount(1);
  await expect(buttons).toHaveText(`Tải audio (${size})`);
};

const expectAvailableOffline = async (
  page: Page,
  title: string,
): Promise<void> => {
  await expect(offlineAudioBlock(page, title)).toHaveText(
    'Audio có sẵn offline',
  );
  await expect(downloadButtons(page, title)).toHaveCount(0);
  await expect(removeButtons(page, title)).toHaveCount(0);
};

const expectNoAudioBlock = async (page: Page, title: string): Promise<void> => {
  const section = unitSection(page, title);
  await expect(section).toBeVisible();
  await expect(offlineAudioBlock(page, title)).toHaveCount(0);
  await expect(section.getByText('Audio có sẵn offline')).toHaveCount(0);
  await expect(section.getByText(/Đã tải audio/)).toHaveCount(0);
  await expect(downloadButtons(page, title)).toHaveCount(0);
  await expect(removeButtons(page, title)).toHaveCount(0);
};

test.describe('S8.4 Tải audio offline — nhãn và dung lượng', () => {
  test.beforeEach(async ({ context }) => {
    await useOfflineAudioFixture(context);
  });

  test('TC-S8.4-AC1-1: S8.4-AC1 Chủ đề chưa tải có nút tải kèm dung lượng', async ({
    page,
  }) => {
    await openLearningPath(page);

    const section = unitSection(page, GREET);
    await expectDownloadLabel(page, GREET, '2,4 MB');
    await expect(section.getByText(/Đang tải/)).toHaveCount(0);
    await expect(section.getByText(/Đã tải audio/)).toHaveCount(0);
    await expect(removeButtons(page, GREET)).toHaveCount(0);

    const heading = section.getByRole('heading', { level: 3, name: GREET });
    const headingBox = await heading.boundingBox();
    const buttonBox = await downloadButtons(page, GREET).boundingBox();
    expect(headingBox).not.toBeNull();
    expect(buttonBox).not.toBeNull();
    expect(buttonBox?.y ?? 0).toBeGreaterThanOrEqual(
      (headingBox?.y ?? 0) + (headingBox?.height ?? 0),
    );
  });

  test('TC-S8.4-AC1-2: S8.4-AC1 Chủ đề chưa tải có nút tải kèm dung lượng (375×812)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openLearningPath(page);

    const button = downloadButtons(page, GREET);
    await button.scrollIntoViewIfNeeded();
    await expect(button).toHaveText('Tải audio (2,4 MB)');
    await expect(button).toBeInViewport({ ratio: 1 });

    const box = await button.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);

    const isTextClipped = await button.evaluate(
      (element) =>
        element.scrollWidth > element.clientWidth ||
        element.scrollHeight > element.clientHeight,
    );
    expect(isTextClipped).toBe(false);

    const hasHorizontalScroll = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(hasHorizontalScroll).toBe(false);
  });

  test('TC-S8.4-AC1-4: S8.4-AC1 Khối audio nằm trên link kiểm tra vượt cấp', async ({
    page,
  }) => {
    await openLearningPath(page);

    const section = unitSection(page, GREET);
    const heading = section.getByRole('heading', { level: 3, name: GREET });
    const button = downloadButtons(page, GREET);
    const placementLink = section.getByRole('link', {
      name: 'Kiểm tra vượt cấp',
    });
    await expect(button).toHaveText('Tải audio (2,4 MB)');
    await expect(placementLink).toBeVisible();

    const headingBox = await heading.boundingBox();
    const buttonBox = await button.boundingBox();
    const linkBox = await placementLink.boundingBox();
    expect(buttonBox?.y ?? 0).toBeGreaterThan(headingBox?.y ?? 0);
    expect(linkBox?.y ?? 0).toBeGreaterThan(buttonBox?.y ?? 0);

    // Tab từ đầu trang: nút tải nhận focus trước link kiểm tra vượt cấp.
    const focusedOrder: string[] = [];
    for (let step = 0; step < MAX_TABS && focusedOrder.length < 2; step += 1) {
      await page.keyboard.press('Tab');
      if (!focusedOrder.includes('button') && (await isFocused(button))) {
        focusedOrder.push('button');
      }
      if (!focusedOrder.includes('link') && (await isFocused(placementLink))) {
        focusedOrder.push('link');
      }
    }
    expect(focusedOrder).toEqual(['button', 'link']);
  });

  test('TC-S8.4-AC1-11: S8.4-AC1 Dung lượng dưới 1 MB hiện theo KB', async ({
    page,
  }) => {
    await openLearningPath(page);
    await expectDownloadLabel(page, unitTitle('kb'), '850 KB');
  });

  test('TC-S8.4-AC1-12: S8.4-AC1 Dung lượng rất nhỏ hiện tối thiểu 1 KB', async ({
    page,
  }) => {
    await openLearningPath(page);
    await expectDownloadLabel(page, unitTitle('small'), '1 KB');
  });

  test('TC-S8.4-AC1-13: S8.4-AC1 Dung lượng sát 1 MB hiện 1,0 MB', async ({
    page,
  }) => {
    await openLearningPath(page);
    await expectDownloadLabel(page, unitTitle('near-mb'), '1,0 MB');
  });

  test('TC-S8.4-AC1-14: S8.4-AC1 Dung lượng MB làm tròn lên khi chữ số tiếp theo là 5', async ({
    page,
  }) => {
    await openLearningPath(page);
    await expectDownloadLabel(page, unitTitle('mb13'), '1,3 MB');
  });

  test('TC-S8.4-AC1-27: S8.4-AC1 Chủ đề Nhập môn có sẵn offline', async ({
    page,
  }) => {
    await openLearningPath(page);
    await expectAvailableOffline(page, INTRO_UNIT_TITLE);
  });

  test('TC-S8.4-AC1-31: S8.4-AC1 Chủ đề HSK chỉ dùng audio Nhập môn', async ({
    page,
  }) => {
    await openLearningPath(page);
    await expectAvailableOffline(page, unitTitle('intro-only'));
  });

  test('TC-S8.4-AC1-32: S8.4-AC1 Chủ đề không có audio', async ({ page }) => {
    await openLearningPath(page);
    await expectNoAudioBlock(page, unitTitle('no-audio'));
  });

  test('TC-S8.4-AC1-33: S8.4-AC1 Chủ đề Nhập môn không có audio thì không có khối', async ({
    page,
    context,
  }) => {
    await useOfflineAudioFixture(context, 'intro-empty');
    await openLearningPath(page);

    await expectNoAudioBlock(page, unitTitle('intro-empty'));
    await expectAvailableOffline(page, INTRO_UNIT_TITLE);
  });

  test('TC-S8.4-AC1-53: S8.4-AC1 Nút tải có tên kèm chủ đề', async ({
    page,
  }) => {
    await openLearningPath(page);

    const button = page.getByRole('button', {
      name: 'Tải audio (2,4 MB), chủ đề Chào hỏi',
      exact: true,
    });
    await expect(button).toHaveCount(1);
    const visibleText = (await button.innerText()).trim();
    await expect(button).toHaveAccessibleName(
      new RegExp(`^${visibleText.replace(/[()]/g, '\\$&')}`),
    );
    expect(visibleText).toBe('Tải audio (2,4 MB)');
  });
});
