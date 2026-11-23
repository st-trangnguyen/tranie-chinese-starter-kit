import { expect, type Locator, type Page, test } from '@playwright/test';

import { pathLessonItems, readBuiltLesson } from '../E7/intro-lessons.helpers';

import {
  completeOnboarding,
  lessonProgress,
  seedProgress,
} from './home.helpers';
import {
  alertsOutsideBackup,
  backToPathLink,
  breakSettingsReads,
  breakSettingsWrites,
  expectLearningPathScreen,
  expectSettingsScreen,
  expectStoredSetting,
  goalRadio,
  NORMAL_SPEED_LABEL,
  openLearningPath,
  openSettingsFromPath,
  pinyinSwitch,
  restoreSettingsWrites,
  SAVE_ERROR_MESSAGE,
  saveErrorAlert,
  settingsLink,
  SLOW_SPEED_LABEL,
  speedRadio,
} from './settings.helpers';

const SLOW_TOGGLE_LABEL = 'Nghe chậm';
const INTRO_01 = 'intro-01';
const INTRO_02 = 'intro-02';
/** Câu "nói" `intro-02-nihao` là câu thứ 8 (cursor 7) của `intro-02`. */
const NIHAO_CURSOR = 7;

const slowToggle = (page: Page): Locator =>
  page.getByRole('switch', { name: SLOW_TOGGLE_LABEL });

const expectSaveError = async (page: Page): Promise<void> => {
  await expect(saveErrorAlert(page)).toHaveCount(1);
  await expect(saveErrorAlert(page)).toHaveText(SAVE_ERROR_MESSAGE);
};

const expectDefaultSettings = async (page: Page): Promise<void> => {
  await expect(goalRadio(page, 15)).toBeChecked();
  await expect(goalRadio(page, 30)).not.toBeChecked();
  await expect(goalRadio(page, 60)).not.toBeChecked();
  await expect(speedRadio(page, NORMAL_SPEED_LABEL)).toBeChecked();
  await expect(speedRadio(page, SLOW_SPEED_LABEL)).not.toBeChecked();
  await expect(pinyinSwitch(page)).toBeChecked();
};

/** Ở màn Cài đặt: chọn 60 phút, Chậm, tắt pinyin; chờ cả ba đã lưu. */
const chooseNonDefaultSettings = async (page: Page): Promise<void> => {
  await goalRadio(page, 60).check();
  await expectStoredSetting(page, 'dailyGoalMinutes', 60);
  await speedRadio(page, SLOW_SPEED_LABEL).check();
  await expectStoredSetting(page, 'defaultAudioSpeed', 'slow');
  await pinyinSwitch(page).uncheck();
  await expectStoredSetting(page, 'isPinyinVisible', false);
};

const expectNihaoSpeakScreen = async (page: Page): Promise<void> => {
  const total = readBuiltLesson(INTRO_02).exercises.length;
  await expect(page).toHaveURL(new RegExp(`/lessons/${INTRO_02}$`));
  await expect(lessonProgress(page)).toHaveAccessibleName(
    `Câu ${NIHAO_CURSOR + 1} / ${total}`,
  );
  await expect(page.getByText('你好！', { exact: true })).toBeVisible();
  await expect(page.getByText('nǐ hǎo!', { exact: true })).toBeVisible();
  await expect(page.getByText('Xin chào!', { exact: true })).toBeVisible();
  await expect(alertsOutsideBackup(page)).toHaveCount(0);
};

test.describe('S8.2 Cài đặt: không lưu được / không đọc được', () => {
  test.describe('S8.2-AC1 mục tiêu mỗi ngày', () => {
    test('TC-S8.2-AC1-13: S8.2-AC1 Không lưu được thì báo lỗi và giữ giá trị cũ', async ({
      page,
    }) => {
      await completeOnboarding(page, 15);
      await openSettingsFromPath(page);
      await expect(goalRadio(page, 15)).toBeChecked();
      await breakSettingsWrites(page);

      await goalRadio(page, 30).click();

      await expectSaveError(page);
      await expect(goalRadio(page, 15)).toBeChecked();
      await expect(goalRadio(page, 30)).not.toBeChecked();
    });

    test('TC-S8.2-AC1-15: S8.2-AC1 Lưu được lại thì thông báo lỗi biến mất', async ({
      page,
    }) => {
      await completeOnboarding(page, 15);
      await openSettingsFromPath(page);
      await breakSettingsWrites(page);
      await goalRadio(page, 30).click();
      await expectSaveError(page);
      await expect(goalRadio(page, 15)).toBeChecked();

      await restoreSettingsWrites(page);
      await goalRadio(page, 30).click();

      await expect(saveErrorAlert(page)).toHaveCount(0);
      await expect(goalRadio(page, 30)).toBeChecked();
      await expectStoredSetting(page, 'dailyGoalMinutes', 30);
      await page.reload();

      await expectSettingsScreen(page);
      await expect(goalRadio(page, 30)).toBeChecked();
      await expect(goalRadio(page, 15)).not.toBeChecked();
      await expect(saveErrorAlert(page)).toHaveCount(0);
    });

    test('TC-S8.2-AC1-18: S8.2-AC1 Lỗi lặp lại chỉ có một thông báo', async ({
      page,
    }) => {
      await completeOnboarding(page, 15);
      await openSettingsFromPath(page);
      await breakSettingsWrites(page);

      await goalRadio(page, 30).click();
      await expectSaveError(page);
      await goalRadio(page, 60).click();

      await expectSaveError(page);
      await expect(page.getByText(SAVE_ERROR_MESSAGE)).toHaveCount(1);
      await expect(goalRadio(page, 15)).toBeChecked();
      await expect(goalRadio(page, 60)).not.toBeChecked();
    });

    test('TC-S8.2-AC1-21, TC-S8.2-AC1-22: S8.2-AC1 Không đọc được cài đặt thì màn Cài đặt hiện mặc định', async ({
      page,
    }) => {
      await completeOnboarding(page, 15);
      await openSettingsFromPath(page);
      await chooseNonDefaultSettings(page);
      await backToPathLink(page).click();
      await expectLearningPathScreen(page);
      await breakSettingsReads(page);

      // TC-S8.2-AC1-21
      await settingsLink(page).click();

      await expectSettingsScreen(page);
      await expectDefaultSettings(page);
      await expect(saveErrorAlert(page)).toHaveCount(0);

      // TC-S8.2-AC1-22
      await breakSettingsWrites(page);
      await goalRadio(page, 30).click();

      await expectSaveError(page);
      await expect(goalRadio(page, 15)).toBeChecked();
      await expect(goalRadio(page, 30)).not.toBeChecked();

      await page.reload();

      await expectSettingsScreen(page);
      await expectDefaultSettings(page);
    });
  });

  test.describe('S8.2-AC2 tốc độ audio mặc định', () => {
    test('TC-S8.2-AC2-7: S8.2-AC2 Không lưu được tốc độ thì giữ tốc độ cũ', async ({
      page,
    }) => {
      await completeOnboarding(page, 15);
      await openSettingsFromPath(page);
      await expect(speedRadio(page, NORMAL_SPEED_LABEL)).toBeChecked();
      await breakSettingsWrites(page);

      await speedRadio(page, SLOW_SPEED_LABEL).click();

      await expectSaveError(page);
      await expect(speedRadio(page, NORMAL_SPEED_LABEL)).toBeChecked();
      await expect(speedRadio(page, SLOW_SPEED_LABEL)).not.toBeChecked();
    });

    test('TC-S8.2-AC2-12: S8.2-AC2 Không đọc được cài đặt thì bài vẫn mở với tốc độ thường và hiện pinyin', async ({
      page,
    }) => {
      await completeOnboarding(page, 15);
      await openSettingsFromPath(page);
      await speedRadio(page, SLOW_SPEED_LABEL).check();
      await expectStoredSetting(page, 'defaultAudioSpeed', 'slow');
      await pinyinSwitch(page).uncheck();
      await expectStoredSetting(page, 'isPinyinVisible', false);
      await seedProgress(page, {
        settings: { defaultAudioSpeed: 'slow', isPinyinVisible: false },
        lessonProgress: [
          { lessonId: INTRO_01, status: 'completed' },
          { lessonId: INTRO_02, status: 'in-progress', cursor: NIHAO_CURSOR },
        ],
      });
      await openLearningPath(page);
      await breakSettingsReads(page);

      await pathLessonItems(page).nth(0).getByRole('link').click();

      const intro01Total = readBuiltLesson(INTRO_01).exercises.length;
      await expect(page).toHaveURL(new RegExp(`/lessons/${INTRO_01}$`));
      await expect(lessonProgress(page)).toHaveAccessibleName(
        `Câu 1 / ${intro01Total}`,
      );
      // Câu 1 là chọn thanh của 八 (chỉ nghe, không hiện chữ).
      await expect(
        page.getByRole('group', { name: 'Chọn thanh của âm tiết vừa nghe' }),
      ).toBeVisible();
      await expect(slowToggle(page)).toHaveAttribute('aria-checked', 'false');
      await expect(alertsOutsideBackup(page)).toHaveCount(0);

      await page.goBack();
      await expectLearningPathScreen(page);
      await pathLessonItems(page).nth(1).getByRole('link').click();

      await expectNihaoSpeakScreen(page);

      await page.reload();

      await expect(page.getByRole('button', { name: 'Bắt đầu' })).toHaveCount(
        0,
      );
      await expectNihaoSpeakScreen(page);
    });
  });

  test.describe('S8.2-AC3 hiện pinyin', () => {
    test('TC-S8.2-AC3-10: S8.2-AC3 Không lưu được pinyin thì công tắc về trạng thái cũ', async ({
      page,
    }) => {
      await completeOnboarding(page, 15);
      await openSettingsFromPath(page);
      await expect(pinyinSwitch(page)).toBeChecked();
      await breakSettingsWrites(page);

      await pinyinSwitch(page).click();

      await expectSaveError(page);
      await expect(pinyinSwitch(page)).toBeChecked();
    });
  });
});
