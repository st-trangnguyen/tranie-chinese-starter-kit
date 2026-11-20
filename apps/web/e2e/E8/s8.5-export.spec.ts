import { expect, test, type Download } from '@playwright/test';

import { pathLessonStatuses } from '../E7/intro-lessons.helpers';

import {
  backupAlert,
  backupFileName,
  backupStatus,
  EXPORT_FAILED_MESSAGE,
  EXPORTED_MESSAGE,
  exportButton,
  exportProgress,
  readDownloadText,
} from './backup.helpers';
import { completeOnboarding, seedProgress, TIMEZONE } from './home.helpers';
import { expectLessonAt, openLessonFromPath } from './settings-lesson.helpers';
import {
  alertsOutsideBackup,
  backToPathLink,
  breakSettingsReads,
  openSettingsFromPath,
} from './settings.helpers';

test.use({ timezoneId: TIMEZONE });

/** Ngày trên máy trong mọi case của file này (test-cases TC-S8.5-AC1-6). */
const EXPORT_DAY = '2026-11-17';
const EXPORT_TIME = new Date(`${EXPORT_DAY}T10:00:00+07:00`);
const INTRO_01 = 'intro-01';
const INTRO_02 = 'intro-02';
/** Bài 2 đang dở ở câu 3 (cursor 0-based). */
const INTRO_02_CURSOR = 2;

test.describe('S8.5 Xuất tiến độ', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: EXPORT_TIME });
  });

  test('TC-S8.5-AC1-6: S8.5-AC1 Bấm Xuất tiến độ thì lưu được file', async ({
    page,
  }) => {
    await completeOnboarding(page, 15);
    await openSettingsFromPath(page);

    const download = await exportProgress(page);

    expect(download.suggestedFilename()).toBe('tranie-tien-do-2026-11-17.json');
    const text = await readDownloadText(download);
    const content: unknown = JSON.parse(text);
    expect(content).toEqual(
      expect.objectContaining({ exportedOn: EXPORT_DAY }),
    );
    await expect(backupStatus(page)).toHaveText(EXPORTED_MESSAGE);
  });

  test('TC-S8.5-AC1-8: S8.5-AC1 Báo đã xuất ngay khi trình duyệt nhận file', async ({
    page,
  }) => {
    await completeOnboarding(page, 15);
    await openSettingsFromPath(page);

    const download = await exportProgress(page);

    expect(download.suggestedFilename()).toBe(backupFileName(EXPORT_DAY));
    await expect(backupStatus(page)).toHaveText(EXPORTED_MESSAGE);
    await expect(backupAlert(page)).toHaveText('');
    await expect(alertsOutsideBackup(page)).toHaveCount(0);
  });

  test('TC-S8.5-AC1-10: S8.5-AC1 Xuất không làm đổi tiến độ', async ({
    page,
  }) => {
    await seedProgress(page, {
      settings: { dailyGoalMinutes: 15 },
      lessonProgress: [
        { lessonId: INTRO_01, status: 'completed' },
        { lessonId: INTRO_02, status: 'in-progress', cursor: INTRO_02_CURSOR },
      ],
    });
    await openSettingsFromPath(page);

    await exportProgress(page);
    await expect(backupStatus(page)).toHaveText(EXPORTED_MESSAGE);

    await backToPathLink(page).click();
    await expect(pathLessonStatuses(page).first()).toHaveText('Đã xong');
    await openLessonFromPath(page, 1);
    await expectLessonAt(page, INTRO_02, INTRO_02_CURSOR + 1);
  });

  test('TC-S8.5-AC1-11: S8.5-AC1 Chưa học gì vẫn xuất được', async ({
    page,
  }) => {
    await completeOnboarding(page, 15);
    await openSettingsFromPath(page);

    const download = await exportProgress(page);

    expect(download.suggestedFilename()).toBe(backupFileName(EXPORT_DAY));
    const content: unknown = JSON.parse(await readDownloadText(download));
    expect(content).toEqual(expect.objectContaining({ lessonProgress: [] }));
    await expect(backupStatus(page)).toHaveText(EXPORTED_MESSAGE);
  });

  test('TC-S8.5-AC1-13: S8.5-AC1 Không đọc được tiến độ thì báo lỗi', async ({
    page,
  }) => {
    await completeOnboarding(page, 15);
    await openSettingsFromPath(page);
    const downloads: Download[] = [];
    page.on('download', (download) => downloads.push(download));

    await breakSettingsReads(page);
    await exportButton(page).click();

    await expect(backupAlert(page)).toContainText(EXPORT_FAILED_MESSAGE);
    await expect(backupStatus(page)).toHaveText('');
    expect(downloads).toHaveLength(0);
  });
});
