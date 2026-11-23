import { expect, test, type Page } from '@playwright/test';

import {
  expectVisibleFocusRing,
  tabUntilFocused,
} from '../E6/writing-practice.helpers';

import {
  backupAlert,
  backupFileName,
  backupSection,
  BACKUP_SECTION_TITLE,
  backupStatus,
  cancelButton,
  expectInLiveRegion,
  EXPORTED_MESSAGE,
  exportButton,
  exportProgress,
  fixturePath,
  importButton,
  importConfirmDialog,
  IMPORTED_MESSAGE,
  importFile,
  NOT_BACKUP_MESSAGE,
  overwriteButton,
} from './backup.helpers';
import {
  completedLessons,
  completeOnboarding,
  lessonId,
  NOW,
  seedProgress,
  TIMEZONE,
  TODAY,
} from './home.helpers';
import { openSettingsFromPath } from './settings.helpers';

test.use({ timezoneId: TIMEZONE });

const MAX_FOCUS_STEPS = 4;

/** Focus đang ở trong hộp xác nhận (không lọt ra phần màn phía sau). */
const isFocusInDialog = (page: Page): Promise<boolean> =>
  importConfirmDialog(page).evaluate((dialog) =>
    dialog.contains(document.activeElement),
  );

test.describe('S8.5 Mục Sao lưu tiến độ trong màn Cài đặt', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: NOW });
  });

  test('TC-S8.5-AC1-1: S8.5-AC1 Màn Cài đặt có mục Sao lưu tiến độ', async ({
    page,
  }) => {
    await completeOnboarding(page, 15);
    await openSettingsFromPath(page);

    await expect(backupSection(page)).toBeVisible();
    await expect(
      backupSection(page).getByRole('heading', { name: BACKUP_SECTION_TITLE }),
    ).toBeVisible();
    await expect(exportButton(page)).toBeVisible();
    await expect(importButton(page)).toBeVisible();
  });

  test('TC-S8.5-AC1-4: S8.5-AC1 Hai nút dùng được bằng bàn phím', async ({
    page,
  }) => {
    await completeOnboarding(page, 15);
    await openSettingsFromPath(page);

    await tabUntilFocused(page, exportButton(page));
    await expectVisibleFocusRing(exportButton(page));

    const downloadPromise = page.waitForEvent('download');
    await page.keyboard.press('Enter');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(backupFileName(TODAY));
    await expect(backupStatus(page)).toHaveText(EXPORTED_MESSAGE);

    await page.keyboard.press('Tab');
    await expect(importButton(page)).toBeFocused();
    await expectVisibleFocusRing(importButton(page));
  });

  test('TC-S8.5-AC1-15: S8.5-AC1 Thông báo xuất được đọc cho trình đọc màn hình', async ({
    page,
  }) => {
    await completeOnboarding(page, 15);
    await openSettingsFromPath(page);
    // Vùng thông báo có sẵn (rỗng) trước khi đổi nội dung thì trình đọc màn hình mới đọc.
    await expect(backupStatus(page)).toHaveText('');

    await exportProgress(page);

    const message = backupSection(page).getByText(EXPORTED_MESSAGE, {
      exact: true,
    });
    await expect(message).toBeVisible();
    await expectInLiveRegion(message);
  });

  test('TC-S8.5-AC2-11: S8.5-AC2 Thông báo lỗi được đọc cho trình đọc màn hình', async ({
    page,
  }) => {
    await completeOnboarding(page, 15);
    await openSettingsFromPath(page);
    await expect(backupAlert(page)).toHaveText('');

    await importFile(page, fixturePath('anh.png'));

    const message = backupSection(page).getByText(NOT_BACKUP_MESSAGE);
    await expect(message).toBeVisible();
    await expectInLiveRegion(message);
    await expect(importConfirmDialog(page)).toHaveCount(0);
  });

  test('TC-S8.5-AC3-8: S8.5-AC3 Hộp xác nhận dùng được bằng bàn phím', async ({
    page,
  }) => {
    await seedProgress(page, {
      settings: { dailyGoalMinutes: 15 },
      lessonProgress: completedLessons([lessonId(0)]),
    });
    await openSettingsFromPath(page);

    await tabUntilFocused(page, importButton(page));
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.keyboard.press('Enter');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(fixturePath('hop-le-5-bai.json'));

    await expect(importConfirmDialog(page)).toBeVisible();
    await expect(cancelButton(page)).toBeFocused();
    await expectVisibleFocusRing(cancelButton(page));

    for (let step = 0; step < MAX_FOCUS_STEPS; step += 1) {
      await page.keyboard.press('Tab');
      expect(await isFocusInDialog(page)).toBe(true);
    }
    for (let step = 0; step < MAX_FOCUS_STEPS; step += 1) {
      await page.keyboard.press('Shift+Tab');
      expect(await isFocusInDialog(page)).toBe(true);
    }

    // Số lần Tab và Shift+Tab bằng nhau nên focus quay lại "Hủy".
    await expect(cancelButton(page)).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(importConfirmDialog(page)).toHaveCount(0);
    await expect(importButton(page)).toBeFocused();
  });

  test('TC-S8.5-AC3-16: S8.5-AC3 Thông báo thành công được đọc cho trình đọc màn hình', async ({
    page,
  }) => {
    await seedProgress(page, {
      settings: { dailyGoalMinutes: 15 },
      lessonProgress: completedLessons([lessonId(0)]),
    });
    await openSettingsFromPath(page);
    await expect(backupStatus(page)).toHaveText('');

    await importFile(page, fixturePath('hop-le-5-bai.json'));
    await overwriteButton(page).click();

    const message = backupSection(page).getByText(IMPORTED_MESSAGE, {
      exact: true,
    });
    await expect(message).toBeVisible();
    await expectInLiveRegion(message);
  });
});
