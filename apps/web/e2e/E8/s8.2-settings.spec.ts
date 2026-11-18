import { expect, test } from '@playwright/test';

import { completeOnboarding, HOME_URL, seedProgress } from './home.helpers';
import {
  AUDIO_SPEED_GROUP_LABEL,
  backToPathLink,
  DAILY_GOAL_GROUP_LABEL,
  expectLearningPathScreen,
  expectSettingsScreen,
  expectStoredSetting,
  goalGroup,
  goalRadio,
  NORMAL_SPEED_LABEL,
  openSettingsFromPath,
  PINYIN_GROUP_LABEL,
  pinyinGroup,
  pinyinSwitch,
  saveErrorAlert,
  SLOW_SPEED_LABEL,
  speedGroup,
  speedRadio,
} from './settings.helpers';

test.describe('S8.2 Cài đặt', () => {
  test.describe('S8.2-AC1 mục tiêu mỗi ngày', () => {
    test('TC-S8.2-AC1-1: S8.2-AC1 Mở Cài đặt từ màn Lộ trình', async ({
      page,
    }) => {
      await completeOnboarding(page, 15);

      await openSettingsFromPath(page);

      await expect(
        page.getByRole('group', { name: DAILY_GOAL_GROUP_LABEL }),
      ).toBeVisible();
      await expect(
        page.getByRole('group', { name: AUDIO_SPEED_GROUP_LABEL }),
      ).toBeVisible();
      await expect(
        page.getByRole('group', { name: PINYIN_GROUP_LABEL }),
      ).toBeVisible();
      await expect(goalRadio(page, 15)).toBeChecked();
      await expect(speedRadio(page, NORMAL_SPEED_LABEL)).toBeChecked();
      await expect(pinyinSwitch(page)).toBeChecked();
      await expect(pinyinGroup(page)).toContainText('Bật');
    });

    test('TC-S8.2-AC1-5: S8.2-AC1 Quay về Lộ trình', async ({ page }) => {
      await completeOnboarding(page, 15);
      await openSettingsFromPath(page);

      await backToPathLink(page).click();

      await expectLearningPathScreen(page);
    });

    test('TC-S8.2-AC1-9: S8.2-AC1 Hiện mục tiêu đã chọn ở onboarding', async ({
      page,
    }) => {
      await completeOnboarding(page, 30);

      await openSettingsFromPath(page);

      const radios = goalGroup(page).getByRole('radio');
      await expect(radios).toHaveCount(3);
      await expect(goalRadio(page, 15)).toBeVisible();
      await expect(goalRadio(page, 30)).toBeVisible();
      await expect(goalRadio(page, 60)).toBeVisible();
      await expect(goalRadio(page, 30)).toBeChecked();
      await expect(goalRadio(page, 15)).not.toBeChecked();
      await expect(goalRadio(page, 60)).not.toBeChecked();
    });

    test('TC-S8.2-AC1-10: S8.2-AC1 Đổi mục tiêu thì giữ sau khi mở lại app', async ({
      page,
    }) => {
      await completeOnboarding(page, 15);
      await openSettingsFromPath(page);

      await goalRadio(page, 60).check();
      await expect(goalRadio(page, 60)).toBeChecked();
      await expectStoredSetting(page, 'dailyGoalMinutes', 60);
      await page.reload();

      await expectSettingsScreen(page);
      await expect(goalRadio(page, 60)).toBeChecked();
      await expect(goalRadio(page, 15)).not.toBeChecked();
      await expect(page.getByRole('button', { name: /Lưu/ })).toHaveCount(0);
    });

    test('TC-S8.2-AC1-12: S8.2-AC1 Đổi mục tiêu không hiện lại onboarding', async ({
      page,
    }) => {
      await completeOnboarding(page, 15);
      await openSettingsFromPath(page);

      await goalRadio(page, 60).check();
      await expect(goalRadio(page, 60)).toBeChecked();
      await expectStoredSetting(page, 'dailyGoalMinutes', 60);
      await page.reload();
      await page.goto('/');

      await expect(page).toHaveURL(HOME_URL);
      await expect(page.getByText(/Chào mừng đến/)).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Bắt đầu' })).toHaveCount(
        0,
      );
    });
  });

  test.describe('S8.2-AC2 tốc độ audio mặc định', () => {
    test('TC-S8.2-AC2-1: S8.2-AC2 Mặc định ban đầu là tốc độ thường', async ({
      page,
    }) => {
      await completeOnboarding(page, 15);

      await openSettingsFromPath(page);

      await expect(speedGroup(page).getByRole('radio')).toHaveCount(2);
      await expect(speedRadio(page, NORMAL_SPEED_LABEL)).toBeChecked();
      await expect(speedRadio(page, SLOW_SPEED_LABEL)).not.toBeChecked();
    });

    test('TC-S8.2-AC2-4: S8.2-AC2 Tốc độ mặc định giữ sau khi mở lại app', async ({
      page,
    }) => {
      await completeOnboarding(page, 15);
      await openSettingsFromPath(page);

      await speedRadio(page, SLOW_SPEED_LABEL).check();
      await expect(speedRadio(page, SLOW_SPEED_LABEL)).toBeChecked();
      await expectStoredSetting(page, 'defaultAudioSpeed', 'slow');
      await page.reload();

      await expectSettingsScreen(page);
      await expect(speedRadio(page, SLOW_SPEED_LABEL)).toBeChecked();
      await expect(speedRadio(page, NORMAL_SPEED_LABEL)).not.toBeChecked();
    });

    test('TC-S8.2-AC2-9: S8.2-AC2 Một tùy chọn đã lưu bị hỏng thì chỉ tùy chọn đó về mặc định', async ({
      page,
    }) => {
      await completeOnboarding(page, 15);
      await openSettingsFromPath(page);
      await goalRadio(page, 60).check();
      await expectStoredSetting(page, 'dailyGoalMinutes', 60);
      await pinyinSwitch(page).uncheck();
      await expectStoredSetting(page, 'isPinyinVisible', false);

      await seedProgress(page, { settings: { defaultAudioSpeed: 'fast' } });
      await openSettingsFromPath(page);

      await expect(speedRadio(page, NORMAL_SPEED_LABEL)).toBeChecked();
      await expect(speedRadio(page, SLOW_SPEED_LABEL)).not.toBeChecked();
      await expect(goalRadio(page, 60)).toBeChecked();
      await expect(pinyinSwitch(page)).not.toBeChecked();
      await expect(saveErrorAlert(page)).toHaveCount(0);
    });
  });

  test.describe('S8.2-AC3 hiện pinyin', () => {
    test('TC-S8.2-AC3-1: S8.2-AC3 Mặc định hiện pinyin', async ({ page }) => {
      await completeOnboarding(page, 15);

      await openSettingsFromPath(page);

      await expect(pinyinSwitch(page)).toBeChecked();
    });

    test('TC-S8.2-AC3-6: S8.2-AC3 Tùy chọn pinyin giữ sau khi mở lại app', async ({
      page,
    }) => {
      await completeOnboarding(page, 15);
      await openSettingsFromPath(page);

      await pinyinSwitch(page).uncheck();
      await expect(pinyinSwitch(page)).not.toBeChecked();
      await expectStoredSetting(page, 'isPinyinVisible', false);
      await page.reload();

      await expectSettingsScreen(page);
      await expect(pinyinSwitch(page)).not.toBeChecked();
      await expect(pinyinGroup(page)).toContainText('Tắt');
    });
  });
});
