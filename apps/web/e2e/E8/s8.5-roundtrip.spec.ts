import {
  expect,
  test,
  type Browser,
  type BrowserContext,
  type BrowserContextOptions,
  type Page,
} from '@playwright/test';

import { pathLessonStatuses } from '../E7/intro-lessons.helpers';

import {
  backupStatus,
  exportProgress,
  IMPORTED_MESSAGE,
  importConfirmDialog,
  importFile,
  overwriteButton,
  serveBackupPath,
  SKIP_AHEAD_TEST_LESSON_ID,
} from './backup.helpers';
import {
  completedLessons,
  completeOnboarding,
  expectHomeScreen,
  expectTodayMinutes,
  lessonId,
  NOW,
  seedProgress,
  TIMEZONE,
} from './home.helpers';
import {
  expectLessonAt,
  hidePinyinInSettings,
  openLessonFromPath,
} from './settings-lesson.helpers';
import {
  backToPathLink,
  goalRadio,
  openLearningPath,
  openSettingsFromPath,
  pinyinSwitch,
} from './settings.helpers';
import { expectStreak, reachedDay, studiedDay } from './streak.helpers';

/** Bài 3 đang dở ở câu 4 (cursor 0-based). */
const INTRO_03_CURSOR = 3;
/** Học 12 phút hôm nay (test-cases TC-S8.5-AC1-19). */
const TWELVE_MINUTES_SECONDS = 12 * 60;
/** Trạng thái vượt cấp (design D10): k = 3 (chủ đề C), N = 2 bài. */
const SKIP_AHEAD_COMPLETED_IDS = [
  lessonId(0),
  lessonId(4),
  SKIP_AHEAD_TEST_LESSON_ID,
];
const SKIP_AHEAD_STATUSES = [
  'Đã xong',
  'Đang mở',
  'Đã khóa',
  'Đã khóa',
  'Đã xong',
  'Đã xong',
  'Đang mở',
  'Đã khóa',
];

const contexts: BrowserContext[] = [];

/** Một "máy": phiên trình duyệt riêng (IndexedDB tách biệt), đồng hồ ở `NOW`. */
const openMachine = async (
  browser: Browser,
  options: BrowserContextOptions = {},
): Promise<Page> => {
  const context = await browser.newContext({
    timezoneId: TIMEZONE,
    ...options,
  });
  contexts.push(context);
  const page = await context.newPage();
  await page.clock.install({ time: NOW });
  return page;
};

/** Ở màn Cài đặt máy B: nhập file `path`, bấm "Ghi đè", chờ báo đã nhập. */
const importAndOverwrite = async (page: Page, path: string): Promise<void> => {
  await importFile(page, path);
  await overwriteButton(page).click();
  await expect(backupStatus(page)).toHaveText(IMPORTED_MESSAGE);
};

/** Máy A ở màn Cài đặt: bấm "Xuất tiến độ", trả về đường dẫn file đã lưu. */
const exportFromSettings = async (page: Page): Promise<string> => {
  const download = await exportProgress(page);
  return download.path();
};

/** Máy A tạo trạng thái vượt cấp (lộ trình 4 chủ đề), ghi lại màn Lộ trình, rồi xuất file. */
const exportSkipAheadFromMachineA = async (
  browser: Browser,
): Promise<string> => {
  const machineA = await openMachine(browser, { serviceWorkers: 'block' });
  await serveBackupPath(machineA);
  await seedProgress(machineA, {
    settings: { dailyGoalMinutes: 15 },
    lessonProgress: completedLessons(SKIP_AHEAD_COMPLETED_IDS),
  });
  await openLearningPath(machineA);
  await expect(pathLessonStatuses(machineA)).toHaveText(SKIP_AHEAD_STATUSES);
  await openSettingsFromPath(machineA);
  return exportFromSettings(machineA);
};

const openNewLearnerOnBackupPath = async (browser: Browser): Promise<Page> => {
  const machineB = await openMachine(browser, { serviceWorkers: 'block' });
  await serveBackupPath(machineB);
  await completeOnboarding(machineB, 15);
  await openSettingsFromPath(machineB);
  return machineB;
};

test.afterEach(async () => {
  await Promise.all(contexts.splice(0).map((context) => context.close()));
});

test.describe('S8.5 Xuất ở máy này, nhập ở máy khác', () => {
  test('TC-S8.5-AC1-16: S8.5-AC1 Xuất ở máy này, nhập ở máy khác thì có đúng tiến độ', async ({
    browser,
  }) => {
    const machineA = await openMachine(browser);
    await seedProgress(machineA, {
      settings: { dailyGoalMinutes: 30 },
      lessonProgress: [
        ...completedLessons([lessonId(0), lessonId(1)]),
        {
          lessonId: lessonId(2),
          status: 'in-progress',
          cursor: INTRO_03_CURSOR,
        },
      ],
    });
    await openSettingsFromPath(machineA);
    await expect(goalRadio(machineA, 30)).toBeChecked();
    const backupPath = await exportFromSettings(machineA);

    const machineB = await openMachine(browser);
    await completeOnboarding(machineB, 15);
    await openSettingsFromPath(machineB);
    await expect(goalRadio(machineB, 15)).toBeChecked();
    await importAndOverwrite(machineB, backupPath);

    await expect(goalRadio(machineB, 30)).toBeChecked();
    await expect(goalRadio(machineB, 15)).not.toBeChecked();
    await backToPathLink(machineB).click();
    const statuses = pathLessonStatuses(machineB);
    await expect(statuses.nth(0)).toHaveText('Đã xong');
    await expect(statuses.nth(1)).toHaveText('Đã xong');
    await openLessonFromPath(machineB, 2);
    await expectLessonAt(machineB, lessonId(2), INTRO_03_CURSOR + 1);
  });

  test('TC-S8.5-AC1-19: S8.5-AC1 File có số phút đã học từng ngày', async ({
    browser,
  }) => {
    const machineA = await openMachine(browser);
    await seedProgress(machineA, {
      settings: { dailyGoalMinutes: 15 },
      dailyStats: [studiedDay(0, TWELVE_MINUTES_SECONDS, 15)],
    });
    await expectHomeScreen(machineA);
    await expectTodayMinutes(machineA, 12, 15);
    await openSettingsFromPath(machineA);
    const backupPath = await exportFromSettings(machineA);

    const machineB = await openMachine(browser);
    await completeOnboarding(machineB, 15);
    // Onboarding xong thì vào bài đầu; mở Trang chủ để thấy máy B chưa học phút nào.
    await machineB.goto('/');
    await expectHomeScreen(machineB);
    await expectTodayMinutes(machineB, 0, 15);
    await openSettingsFromPath(machineB);
    await importAndOverwrite(machineB, backupPath);

    await machineB.goto('/');
    await expectHomeScreen(machineB);
    await expectTodayMinutes(machineB, 12, 15);
  });

  test('TC-S8.5-AC1-20: S8.5-AC1 File có chủ đề đã qua bằng kiểm tra vượt cấp', async ({
    browser,
  }) => {
    const backupPath = await exportSkipAheadFromMachineA(browser);

    const machineB = await openNewLearnerOnBackupPath(browser);
    await importAndOverwrite(machineB, backupPath);

    await backToPathLink(machineB).click();
    await expect(pathLessonStatuses(machineB)).toHaveText(SKIP_AHEAD_STATUSES);
  });

  test('TC-S8.5-AC1-21: S8.5-AC1 Chuỗi ngày học giữ đúng nhờ mục tiêu của từng ngày', async ({
    browser,
  }) => {
    const machineA = await openMachine(browser);
    await seedProgress(machineA, {
      settings: { dailyGoalMinutes: 30 },
      dailyStats: [reachedDay(-1, 15)],
    });
    await expectHomeScreen(machineA);
    await expectStreak(machineA, 1);
    await openSettingsFromPath(machineA);
    await expect(goalRadio(machineA, 30)).toBeChecked();
    const backupPath = await exportFromSettings(machineA);

    const machineB = await openMachine(browser);
    await completeOnboarding(machineB, 15);
    await openSettingsFromPath(machineB);
    await importAndOverwrite(machineB, backupPath);

    await machineB.goto('/');
    await expectHomeScreen(machineB);
    await expectStreak(machineB, 1);
  });

  test('TC-S8.5-AC1-22: S8.5-AC1 File có lựa chọn hiện pinyin', async ({
    browser,
  }) => {
    const machineA = await openMachine(browser);
    await completeOnboarding(machineA, 15);
    await hidePinyinInSettings(machineA);
    const backupPath = await exportFromSettings(machineA);

    const machineB = await openMachine(browser);
    await completeOnboarding(machineB, 15);
    await openSettingsFromPath(machineB);
    await expect(pinyinSwitch(machineB)).toBeChecked();
    await importAndOverwrite(machineB, backupPath);

    await expect(pinyinSwitch(machineB)).not.toBeChecked();
  });

  test('TC-S8.5-AC3-5: S8.5-AC3 Số bài đã xong gồm bài qua bằng kiểm tra vượt cấp', async ({
    browser,
  }) => {
    const backupPath = await exportSkipAheadFromMachineA(browser);

    const machineB = await openNewLearnerOnBackupPath(browser);
    await importFile(machineB, backupPath);

    // 1 bài của chủ đề 1 + N = 2 bài của chủ đề thứ k.
    await expect(importConfirmDialog(machineB)).toContainText(
      'có 3 bài đã xong',
    );
  });
});
