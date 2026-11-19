import { expect, test } from '@playwright/test';

import {
  answerCurrentQuestion,
  installAudioRecorder,
} from '../E7/intro-lessons.helpers';

import { completeOnboarding, seedProgress } from './home.helpers';
import {
  chooseSlowDefault,
  expectLessonAt,
  INTRO_01,
  INTRO_02,
  leaveLessonToPath,
  listenAndReadRate,
  NORMAL_RATE,
  openLessonFromPath,
  SLOW_RATE,
  slowToggle,
} from './settings-lesson.helpers';
import {
  NORMAL_SPEED_LABEL,
  openLearningPath,
  settingsLink,
  expectSettingsScreen,
  SLOW_SPEED_LABEL,
  speedRadio,
} from './settings.helpers';

test.describe('S8.2 Cài đặt: tốc độ audio khi mở bài', () => {
  test.beforeEach(async ({ page }) => {
    await installAudioRecorder(page);
    await completeOnboarding(page, 15);
    await openLearningPath(page);
  });

  test('TC-S8.2-AC2-2: S8.2-AC2 Chọn Chậm thì mở bài là phát chậm', async ({
    page,
  }) => {
    await chooseSlowDefault(page);

    await openLessonFromPath(page, 0);

    await expectLessonAt(page, INTRO_01, 1);
    await expect(slowToggle(page)).toHaveAttribute('aria-checked', 'true');
    expect(await listenAndReadRate(page)).toBe(SLOW_RATE);
  });

  test('TC-S8.2-AC2-5: S8.2-AC2 Tắt Nghe chậm trong bài không đổi Cài đặt', async ({
    page,
  }) => {
    await chooseSlowDefault(page);
    await openLessonFromPath(page, 0);
    await expect(slowToggle(page)).toHaveAttribute('aria-checked', 'true');

    await slowToggle(page).click();
    await expect(slowToggle(page)).toHaveAttribute('aria-checked', 'false');
    await leaveLessonToPath(page);
    await settingsLink(page).click();

    await expectSettingsScreen(page);
    await expect(speedRadio(page, SLOW_SPEED_LABEL)).toBeChecked();
    await expect(speedRadio(page, NORMAL_SPEED_LABEL)).not.toBeChecked();
  });

  test('TC-S8.2-AC2-10: S8.2-AC2 Mở bài mới thì theo tốc độ mặc định Chậm (mở lại chính bài ở câu 1)', async ({
    page,
  }) => {
    await chooseSlowDefault(page);
    await openLessonFromPath(page, 0);
    await slowToggle(page).click();
    await expect(slowToggle(page)).toHaveAttribute('aria-checked', 'false');
    await leaveLessonToPath(page);

    await openLessonFromPath(page, 0);

    await expectLessonAt(page, INTRO_01, 1);
    await expect(slowToggle(page)).toHaveAttribute('aria-checked', 'true');
    expect(await listenAndReadRate(page)).toBe(SLOW_RATE);
  });

  test('TC-S8.2-AC2-10: S8.2-AC2 Mở bài mới thì theo tốc độ mặc định Chậm (học tiếp ở câu 2)', async ({
    page,
  }) => {
    await chooseSlowDefault(page);
    await openLessonFromPath(page, 0);
    await slowToggle(page).click();
    await expect(slowToggle(page)).toHaveAttribute('aria-checked', 'false');
    await answerCurrentQuestion(page);
    await expectLessonAt(page, INTRO_01, 2);
    await expect(slowToggle(page)).toHaveAttribute('aria-checked', 'false');
    await leaveLessonToPath(page);

    await openLessonFromPath(page, 0);

    await expectLessonAt(page, INTRO_01, 2);
    await expect(slowToggle(page)).toHaveAttribute('aria-checked', 'true');
    expect(await listenAndReadRate(page)).toBe(SLOW_RATE);
  });

  test('TC-S8.2-AC2-10: S8.2-AC2 Mở bài mới thì theo tốc độ mặc định Chậm (sang bài khác)', async ({
    page,
  }) => {
    await chooseSlowDefault(page);
    await seedProgress(page, {
      lessonProgress: [{ lessonId: INTRO_01, status: 'completed' }],
    });
    await openLearningPath(page);
    await openLessonFromPath(page, 0);
    await expectLessonAt(page, INTRO_01, 1);
    await slowToggle(page).click();
    await expect(slowToggle(page)).toHaveAttribute('aria-checked', 'false');
    await leaveLessonToPath(page);

    await openLessonFromPath(page, 1);

    await expectLessonAt(page, INTRO_02, 1);
    await expect(slowToggle(page)).toHaveAttribute('aria-checked', 'true');
    expect(await listenAndReadRate(page)).toBe(SLOW_RATE);
  });

  test('TC-S4.4-AC2-1: S4.4-AC2 Mặc định phát tốc độ thường', async ({
    page,
  }) => {
    await openLessonFromPath(page, 0);

    await expectLessonAt(page, INTRO_01, 1);
    await expect(slowToggle(page)).toHaveAttribute('aria-checked', 'false');
    expect(await listenAndReadRate(page)).toBe(NORMAL_RATE);
  });

  test('TC-S4.4-AC2-5: S4.4-AC2 Mở bài mới thì về tốc độ thường', async ({
    page,
  }) => {
    await openLessonFromPath(page, 0);
    await slowToggle(page).click();
    await expect(slowToggle(page)).toHaveAttribute('aria-checked', 'true');
    await leaveLessonToPath(page);

    await openLessonFromPath(page, 0);

    await expectLessonAt(page, INTRO_01, 1);
    await expect(slowToggle(page)).toHaveAttribute('aria-checked', 'false');
  });
});
