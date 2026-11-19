import { expect, test } from '@playwright/test';

import { pathLessonStatuses } from '../E7/intro-lessons.helpers';

import {
  backupAlert,
  backupFileName,
  backupStatus,
  CORRUPTED_MESSAGE,
  EXPORTED_MESSAGE,
  exportProgress,
  fixturePath,
  importConfirmDialog,
  IMPORTED_MESSAGE,
  importFile,
  openOnceWithServiceWorker,
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
import { backToPathLink, openSettingsFromPath } from './settings.helpers';

test.use({ timezoneId: TIMEZONE });

test.describe('S8.5 Sao lưu tiến độ khi không có mạng', () => {
  test('TC-S8.5-AC1-12: S8.5-AC1 Xuất khi không có mạng', async ({
    page,
    context,
  }) => {
    await page.clock.install({ time: NOW });
    await openOnceWithServiceWorker(page);
    await completeOnboarding(page, 15);

    await context.setOffline(true);
    await openSettingsFromPath(page);
    const download = await exportProgress(page);

    expect(download.suggestedFilename()).toBe(backupFileName(TODAY));
    await expect(backupStatus(page)).toHaveText(EXPORTED_MESSAGE);
  });

  test('TC-S8.5-AC2-8: S8.5-AC2 Nhập file lỗi khi không có mạng', async ({
    page,
    context,
  }) => {
    await page.clock.install({ time: NOW });
    await openOnceWithServiceWorker(page);
    await seedProgress(page, {
      settings: { dailyGoalMinutes: 15 },
      lessonProgress: completedLessons([lessonId(0)]),
    });

    await context.setOffline(true);
    await openSettingsFromPath(page);
    await importFile(page, fixturePath('trang-thai-sai.json'));

    await expect(backupAlert(page)).toContainText(CORRUPTED_MESSAGE);
    await expect(importConfirmDialog(page)).toHaveCount(0);

    await backToPathLink(page).click();
    await expect(pathLessonStatuses(page).first()).toHaveText('Đã xong');
  });

  test('TC-S8.5-AC3-14: S8.5-AC3 Nhập khi không có mạng', async ({
    page,
    context,
  }) => {
    await page.clock.install({ time: NOW });
    await openOnceWithServiceWorker(page);
    await seedProgress(page, {
      settings: { dailyGoalMinutes: 15 },
      lessonProgress: completedLessons([lessonId(0)]),
    });

    await context.setOffline(true);
    await openSettingsFromPath(page);
    await importFile(page, fixturePath('hop-le-5-bai.json'));
    await overwriteButton(page).click();

    await expect(backupStatus(page)).toHaveText(IMPORTED_MESSAGE);

    await backToPathLink(page).click();
    const statuses = pathLessonStatuses(page);
    for (let index = 0; index < 5; index += 1) {
      await expect(statuses.nth(index)).toHaveText('Đã xong');
    }
  });
});
