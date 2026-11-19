import { expect, test } from '@playwright/test';

import {
  backupFileName,
  backupStatus,
  EXPORTED_MESSAGE,
  exportProgress,
  openOnceWithServiceWorker,
} from './backup.helpers';
import { completeOnboarding, NOW, TIMEZONE, TODAY } from './home.helpers';
import { openSettingsFromPath } from './settings.helpers';

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
});
