import { expect, test, type Page } from '@playwright/test';

import {
  pathLessonItems,
  pathLessonStatuses,
} from '../E7/intro-lessons.helpers';

import {
  backupAlert,
  backupSection,
  backupStatus,
  breakLessonProgressWrites,
  cancelButton,
  CONFIRM_WARNING,
  fixturePath,
  importConfirmDialog,
  IMPORT_FAILED_MESSAGE,
  IMPORTED_MESSAGE,
  importFile,
  overwriteButton,
} from './backup.helpers';
import {
  completedLessons,
  completeOnboarding,
  type DailyGoal,
  expectHomeScreen,
  expectTodayMinutes,
  lessonId,
  NOW,
  seedProgress,
  TIMEZONE,
} from './home.helpers';
import {
  backToPathLink,
  goalRadio,
  openSettingsFromPath,
} from './settings.helpers';
import { studiedDay } from './streak.helpers';

test.use({ timezoneId: TIMEZONE });

const TWENTY_MINUTES_SECONDS = 20 * 60;
const INTRO_LESSON_COUNT = 12;

/** Máy có bài 1…`count` "Đã xong", mục tiêu `goal` phút; mở màn Cài đặt. */
const openSettingsWithCompleted = async (
  page: Page,
  count: number,
  goal: DailyGoal = 15,
): Promise<void> => {
  const ids = Array.from({ length: count }, (_, index) => lessonId(index));
  await seedProgress(page, {
    settings: { dailyGoalMinutes: goal },
    lessonProgress: completedLessons(ids),
  });
  await openSettingsFromPath(page);
};

/** Về màn Lộ trình: trạng thái `expected` của các bài đầu theo thứ tự. */
const expectPathStatuses = async (
  page: Page,
  expected: readonly string[],
): Promise<void> => {
  await backToPathLink(page).click();
  const statuses = pathLessonStatuses(page);
  for (const [index, status] of expected.entries()) {
    await expect(statuses.nth(index)).toHaveText(status);
  }
};

const ONLY_LESSON_ONE = ['Đã xong', 'Đang mở', 'Đã khóa'];

/** Hộp đóng, không có thông báo nào trong mục. */
const expectClosedWithoutMessage = async (page: Page): Promise<void> => {
  await expect(importConfirmDialog(page)).toHaveCount(0);
  await expect(backupStatus(page)).toHaveText('');
  await expect(backupAlert(page)).toHaveText('');
};

test.describe('S8.5 Nhập: hộp xác nhận và ghi đè', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: NOW });
  });

  test('TC-S8.5-AC3-1: S8.5-AC3 File hợp lệ thì hiện hộp xác nhận', async ({
    page,
  }) => {
    await openSettingsWithCompleted(page, 1);

    await importFile(page, fixturePath('hop-le-5-bai.json'));

    const dialog = importConfirmDialog(page);
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('17/11/2026');
    await expect(dialog).toContainText('5 bài đã xong');
    await expect(dialog).toContainText(CONFIRM_WARNING);
    await expect(overwriteButton(page)).toBeVisible();
    await expect(cancelButton(page)).toBeVisible();
  });

  test('TC-S8.5-AC3-6: S8.5-AC3 Hủy thì không đổi gì', async ({ page }) => {
    await openSettingsWithCompleted(page, 1);
    await importFile(page, fixturePath('hop-le-5-bai.json'));
    await expect(importConfirmDialog(page)).toBeVisible();

    await cancelButton(page).click();

    await expectClosedWithoutMessage(page);
    await expectPathStatuses(page, ONLY_LESSON_ONE);
  });

  test('TC-S8.5-AC3-7: S8.5-AC3 Esc thì như Hủy', async ({ page }) => {
    await openSettingsWithCompleted(page, 1);
    await importFile(page, fixturePath('hop-le-5-bai.json'));
    await expect(importConfirmDialog(page)).toBeVisible();

    await page.keyboard.press('Escape');

    await expectClosedWithoutMessage(page);
    await expectPathStatuses(page, ONLY_LESSON_ONE);
  });

  test('TC-S8.5-AC3-10: S8.5-AC3 Ghi đè thì tiến độ đúng bằng file', async ({
    page,
  }) => {
    await openSettingsWithCompleted(page, 6, 60);
    await expect(goalRadio(page, 60)).toBeChecked();

    await importFile(page, fixturePath('hop-le-3-bai-15-phut.json'));
    await overwriteButton(page).click();

    await expect(backupStatus(page)).toHaveText(IMPORTED_MESSAGE);
    await expect(goalRadio(page, 15)).toBeChecked();
    await expectPathStatuses(page, [
      'Đã xong',
      'Đã xong',
      'Đã xong',
      'Đang mở',
      'Đã khóa',
      'Đã khóa',
    ]);
  });

  test('TC-S8.5-AC3-12: S8.5-AC3 Ghi đè xóa số phút học mà file không có', async ({
    page,
  }) => {
    await seedProgress(page, {
      settings: { dailyGoalMinutes: 15 },
      dailyStats: [studiedDay(0, TWENTY_MINUTES_SECONDS, 15)],
    });
    await expectHomeScreen(page);
    await expectTodayMinutes(page, 20, 15);
    await openSettingsFromPath(page);

    await importFile(page, fixturePath('hop-le-3-bai-15-phut.json'));
    await overwriteButton(page).click();
    await expect(backupStatus(page)).toHaveText(IMPORTED_MESSAGE);

    await page.goto('/');
    await expectHomeScreen(page);
    await expectTodayMinutes(page, 0, 15);
  });

  test('TC-S8.5-AC3-13: S8.5-AC3 Ghi lỗi giữa chừng thì giữ nguyên tiến độ cũ', async ({
    page,
  }) => {
    await openSettingsWithCompleted(page, 1, 30);
    await importFile(page, fixturePath('hop-le-5-bai.json'));
    await expect(importConfirmDialog(page)).toBeVisible();

    await breakLessonProgressWrites(page);
    await overwriteButton(page).click();

    await expect(backupAlert(page)).toContainText(IMPORT_FAILED_MESSAGE);
    await expect(backupStatus(page)).toHaveText('');
    await expect(goalRadio(page, 30)).toBeChecked();
    await expectPathStatuses(page, ONLY_LESSON_ONE);
    // Mở lại màn Cài đặt (đọc lại từ máy): mục tiêu vẫn 30 phút.
    await openSettingsFromPath(page);
    await expect(goalRadio(page, 30)).toBeChecked();
  });

  test('TC-S8.5-AC3-17: S8.5-AC3 Màn khác hiện tiến độ mới không cần tải lại', async ({
    page,
  }) => {
    await openSettingsWithCompleted(page, 1);

    await importFile(page, fixturePath('hop-le-5-bai.json'));
    await overwriteButton(page).click();
    await expect(backupStatus(page)).toHaveText(IMPORTED_MESSAGE);

    await expectPathStatuses(page, [
      'Đã xong',
      'Đã xong',
      'Đã xong',
      'Đã xong',
      'Đã xong',
      'Đang mở',
    ]);
  });

  test('TC-S8.5-AC3-18: S8.5-AC3 Bài không có trong app không ảnh hưởng lộ trình', async ({
    page,
  }) => {
    await completeOnboarding(page, 15);
    await openSettingsFromPath(page);

    await importFile(page, fixturePath('bai-la.json'));
    await expect(importConfirmDialog(page)).toContainText('có 1 bài đã xong');
    await overwriteButton(page).click();
    await expect(backupSection(page).getByRole('status')).toHaveText(
      IMPORTED_MESSAGE,
    );

    const rest = Array.from(
      { length: INTRO_LESSON_COUNT - 2 },
      () => 'Đã khóa',
    );
    await expectPathStatuses(page, ['Đã xong', 'Đang mở', ...rest]);
    await expect(pathLessonItems(page)).toHaveCount(INTRO_LESSON_COUNT);
    await expect(page.getByText('khong-co-bai-nay')).toHaveCount(0);
  });
});
