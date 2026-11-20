import { readFile } from 'node:fs/promises';

import { expect, test, type Page } from '@playwright/test';

import { pathLessonStatuses } from '../E7/intro-lessons.helpers';

import {
  backupAlert,
  type BackupFixture,
  backupStatus,
  CORRUPTED_MESSAGE,
  fixturePath,
  importConfirmDialog,
  importFile,
  NEWER_VERSION_MESSAGE,
  NOT_BACKUP_MESSAGE,
} from './backup.helpers';
import {
  completedLessons,
  type DailyGoal,
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

test.use({ timezoneId: TIMEZONE });

/** Lớn hơn giới hạn 20 000 000 byte (design D10, test-cases `lon-hon-20mb`). */
const OVERSIZED_BYTES = 21_000_000;

/** Máy có bài 1 "Đã xong", mục tiêu `goal` phút; mở màn Cài đặt. */
const openSettingsWithLessonOne = async (
  page: Page,
  goal: DailyGoal = 15,
): Promise<void> => {
  await seedProgress(page, {
    settings: { dailyGoalMinutes: goal },
    lessonProgress: completedLessons([lessonId(0)]),
  });
  await openSettingsFromPath(page);
};

/** Màn báo lỗi `message`, không có hộp xác nhận, không báo thành công. */
const expectRejected = async (page: Page, message: string): Promise<void> => {
  await expect(backupAlert(page)).toContainText(message);
  await expect(importConfirmDialog(page)).toHaveCount(0);
  await expect(backupStatus(page)).toHaveText('');
};

/** Về màn Lộ trình: bài 1 vẫn "Đã xong", bài 2 "Đang mở", bài 3 "Đã khóa" (tiến độ không đổi). */
const expectOnlyLessonOneCompleted = async (page: Page): Promise<void> => {
  await backToPathLink(page).click();
  const statuses = pathLessonStatuses(page);
  await expect(statuses.nth(0)).toHaveText('Đã xong');
  await expect(statuses.nth(1)).toHaveText('Đang mở');
  await expect(statuses.nth(2)).toHaveText('Đã khóa');
};

const rejectedFixtures: readonly {
  id: string;
  title: string;
  fixture: BackupFixture;
  message: string;
}[] = [
  {
    id: 'TC-S8.5-AC2-1',
    title: 'S8.5-AC2 File không phải JSON bị từ chối',
    fixture: 'anh.png',
    message: NOT_BACKUP_MESSAGE,
  },
  {
    id: 'TC-S8.5-AC2-2',
    title: 'S8.5-AC2 File rỗng bị từ chối',
    fixture: 'rong.json',
    message: NOT_BACKUP_MESSAGE,
  },
  {
    id: 'TC-S8.5-AC2-3',
    title: 'S8.5-AC2 File JSON của nơi khác bị từ chối',
    fixture: 'json-noi-khac.json',
    message: NOT_BACKUP_MESSAGE,
  },
  {
    id: 'TC-S8.5-AC2-5',
    title: 'S8.5-AC2 File từ phiên bản app mới hơn bị từ chối',
    fixture: 'ban-moi-hon.json',
    message: NEWER_VERSION_MESSAGE,
  },
  {
    id: 'TC-S8.5-AC2-6',
    title: 'S8.5-AC2 File có một phần dữ liệu sai bị từ chối cả file',
    fixture: 'trang-thai-sai.json',
    message: CORRUPTED_MESSAGE,
  },
];

test.describe('S8.5 Nhập: kiểm tra file và thông báo lỗi', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: NOW });
  });

  for (const { id, title, fixture, message } of rejectedFixtures) {
    test(`${id}: ${title}`, async ({ page }) => {
      await openSettingsWithLessonOne(page);

      await importFile(page, fixturePath(fixture));

      await expectRejected(page, message);
      await expectOnlyLessonOneCompleted(page);
    });
  }

  test('TC-S8.5-AC2-4: S8.5-AC2 File lớn hơn 20 MB bị từ chối', async ({
    page,
  }) => {
    await openSettingsWithLessonOne(page);
    // File tiến độ hợp lệ đệm khoảng trắng tới quá 20 MB: chỉ kích thước làm nó bị từ chối.
    const validText = await readFile(fixturePath('hop-le-5-bai.json'), 'utf8');
    const buffer = Buffer.from(validText.padEnd(OVERSIZED_BYTES, ' '), 'utf8');
    expect(buffer.byteLength).toBeGreaterThan(20_000_000);

    await importFile(page, {
      name: 'lon-hon-20mb.json',
      mimeType: 'application/json',
      buffer,
    });

    await expectRejected(page, NOT_BACKUP_MESSAGE);
    await expectOnlyLessonOneCompleted(page);
  });

  test('TC-S8.5-AC2-7: S8.5-AC2 File có mục tiêu phút không hợp lệ bị từ chối', async ({
    page,
  }) => {
    await openSettingsWithLessonOne(page, 30);
    await expect(goalRadio(page, 30)).toBeChecked();

    await importFile(page, fixturePath('muc-tieu-45.json'));

    await expectRejected(page, CORRUPTED_MESSAGE);
    await expect(goalRadio(page, 30)).toBeChecked();
    // Mở lại màn Cài đặt (đọc lại từ máy): mục tiêu vẫn 30 phút.
    await backToPathLink(page).click();
    await openSettingsFromPath(page);
    await expect(goalRadio(page, 30)).toBeChecked();
  });
});
