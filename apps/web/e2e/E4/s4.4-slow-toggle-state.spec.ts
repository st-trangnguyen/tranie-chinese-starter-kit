import { expect, test } from '@playwright/test';

import {
  expectVisibleFocusRing,
  tabUntilFocused,
} from '../E6/writing-practice.helpers';
import { answerCurrentQuestion } from '../E7/intro-lessons.helpers';
import { completeOnboarding } from '../E8/home.helpers';
import {
  expectLessonAt,
  INTRO_01,
  slowToggle,
} from '../E8/settings-lesson.helpers';

import {
  moveMouseAway,
  readSlowToggleColors,
  slowToggleIcon,
  slowToggleLabel,
} from './slow-toggle.helpers';

/** Thời gian chờ màu ổn định sau `transition-colors` của công tắc. */
const COLOR_SETTLE_TIMEOUT_MS = 2_000;
const CHECK_MARK = '✓';
const SLOW_LABEL = 'Nghe chậm';

test.describe('S4.4-AC3 Công tắc "Nghe chậm" báo trạng thái không chỉ bằng màu', () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page, 15);
    await expectLessonAt(page, INTRO_01, 1);
  });

  test('TC-S4.4-AC3-1: S4.4-AC3 Bật Nghe chậm thì hiện dấu tick trước chữ', async ({
    page,
  }) => {
    const toggle = slowToggle(page);
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await moveMouseAway(page);
    const offColors = await readSlowToggleColors(page);

    await toggle.click();
    await moveMouseAway(page);

    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    const icon = slowToggleIcon(page);
    const label = slowToggleLabel(page);
    await expect(icon).toBeVisible();
    await expect(icon).toHaveText(CHECK_MARK);
    await expect(label).toHaveText(SLOW_LABEL);

    const iconBox = await icon.boundingBox();
    const labelBox = await label.boundingBox();
    expect(iconBox).not.toBeNull();
    expect(labelBox).not.toBeNull();
    if (iconBox && labelBox) {
      // Bên trái chữ.
      expect(iconBox.x + iconBox.width).toBeLessThanOrEqual(labelBox.x);
      // Cùng hàng: tâm dọc của dấu tick nằm trong hộp chữ.
      const iconCenterY = iconBox.y + iconBox.height / 2;
      expect(iconCenterY).toBeGreaterThanOrEqual(labelBox.y);
      expect(iconCenterY).toBeLessThanOrEqual(labelBox.y + labelBox.height);
    }

    await expect(async () => {
      const onColors = await readSlowToggleColors(page);
      expect(onColors.border).toBe(onColors.accent);
      expect(onColors.background).toBe(onColors.accentSoft);
      expect(onColors.text).toBe(onColors.accent);
      expect(onColors.border).not.toBe(offColors.border);
      expect(onColors.background).not.toBe(offColors.background);
      expect(onColors.text).not.toBe(offColors.text);
    }).toPass({ timeout: COLOR_SETTLE_TIMEOUT_MS });
  });

  test('TC-S4.4-AC3-3: S4.4-AC3 Tắt thì không có dấu tick', async ({
    page,
  }) => {
    const toggle = slowToggle(page);

    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await expect(slowToggleIcon(page)).toHaveCount(0);
    await expect(toggle).toHaveText(SLOW_LABEL);
  });

  test('TC-S4.4-AC3-4: S4.4-AC3 Bật rồi tắt thì dấu tick biến mất', async ({
    page,
  }) => {
    const toggle = slowToggle(page);

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await expect(slowToggleIcon(page)).toBeVisible();

    await toggle.click();

    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await expect(slowToggleIcon(page)).toHaveCount(0);
    await expect(toggle).toHaveText(SLOW_LABEL);
  });

  test('TC-S4.4-AC3-5: S4.4-AC3 Bật bằng bàn phím cũng hiện dấu tick', async ({
    page,
  }) => {
    const toggle = slowToggle(page);
    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    await tabUntilFocused(page, toggle);
    await expect(toggle).toBeFocused();
    await expectVisibleFocusRing(toggle);

    await page.keyboard.press('Space');
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await expect(slowToggleIcon(page)).toBeVisible();
    await expect(slowToggleIcon(page)).toHaveText(CHECK_MARK);

    await page.keyboard.press('Space');
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await expect(slowToggleIcon(page)).toHaveCount(0);

    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await expect(slowToggleIcon(page)).toBeVisible();
    await expect(slowToggleIcon(page)).toHaveText(CHECK_MARK);
    await expect(toggle).toBeFocused();
  });

  test('TC-S4.4-AC3-6: S4.4-AC3 Dấu tick giữ qua các câu trong bài', async ({
    page,
  }) => {
    await slowToggle(page).click();
    await expect(slowToggle(page)).toHaveAttribute('aria-checked', 'true');
    await expect(slowToggleIcon(page)).toBeVisible();

    await answerCurrentQuestion(page);

    await expectLessonAt(page, INTRO_01, 2);
    await expect(slowToggle(page)).toHaveAttribute('aria-checked', 'true');
    await expect(slowToggleIcon(page)).toBeVisible();
    await expect(slowToggleIcon(page)).toHaveText(CHECK_MARK);
  });

  test('TC-S4.4-AC3-7: S4.4-AC3 Tên truy cập và trạng thái cho trình đọc màn hình', async ({
    page,
  }) => {
    const toggle = slowToggle(page);

    await expect(toggle).toHaveAccessibleName(SLOW_LABEL);
    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    await toggle.click();

    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await expect(toggle).toHaveAccessibleName(SLOW_LABEL);
  });
});
