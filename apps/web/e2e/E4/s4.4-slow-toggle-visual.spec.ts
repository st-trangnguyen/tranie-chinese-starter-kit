import { expect, test } from '@playwright/test';

import { completeOnboarding } from '../E8/home.helpers';
import {
  expectLessonAt,
  INTRO_01,
  slowToggle,
} from '../E8/settings-lesson.helpers';

import {
  MAX_STATIC_TRANSITION_SECONDS,
  moveMouseAway,
  readContrastOnBackground,
  readMotionStyle,
  readSlowToggleColors,
  slowToggleIcon,
  slowToggleLabel,
} from './slow-toggle.helpers';

/** Thời gian chờ màu ổn định sau `transition-colors` của công tắc. */
const COLOR_SETTLE_TIMEOUT_MS = 2_000;
/** Dấu tick là thành phần UI không phải chữ: WCAG 1.4.11. */
const MIN_ICON_CONTRAST = 3;
/** Chữ thường: WCAG 1.4.3. */
const MIN_TEXT_CONTRAST = 4.5;
/** "Ngay": dấu tick hiện/mất trong thời gian ngắn hơn mọi hiệu ứng mờ dần thông thường. */
const IMMEDIATE_TIMEOUT_MS = 100;
const CHECK_MARK = '✓';
const SLOW_LABEL = 'Nghe chậm';

test.describe('S4.4-AC3 Công tắc "Nghe chậm" ở thang xám, sáng và tối', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`TC-S4.4-AC3-9: S4.4-AC3 Phân biệt bật và tắt ở thang xám, giao diện sáng và tối (${colorScheme})`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await completeOnboarding(page, 15);
      await expectLessonAt(page, INTRO_01, 1);

      const toggle = slowToggle(page);
      const icon = slowToggleIcon(page);
      const label = slowToggleLabel(page);

      // Lúc tắt: không có dấu tick.
      await expect(toggle).toHaveAttribute('aria-checked', 'false');
      await expect(icon).toHaveCount(0);

      await toggle.click();
      await moveMouseAway(page);

      // Lúc bật: dấu tick hiện trước chữ.
      await expect(toggle).toHaveAttribute('aria-checked', 'true');
      await expect(icon).toBeVisible();
      await expect(icon).toHaveText(CHECK_MARK);
      await expect(label).toHaveText(SLOW_LABEL);
      const iconBox = await icon.boundingBox();
      const labelBox = await label.boundingBox();
      expect(iconBox).not.toBeNull();
      expect(labelBox).not.toBeNull();
      if (iconBox && labelBox) {
        expect(iconBox.x + iconBox.width).toBeLessThanOrEqual(labelBox.x);
      }

      // Tương phản theo độ sáng (giữ nguyên ở thang xám) với nền công tắc ≥ 3:1.
      let iconContrast = 0;
      await expect(async () => {
        iconContrast = await readContrastOnBackground(icon);
        expect(iconContrast).toBeGreaterThanOrEqual(MIN_ICON_CONTRAST);
      }).toPass({ timeout: COLOR_SETTLE_TIMEOUT_MS });
      // Ghi tỷ lệ đo được (TC-S4.4-AC3-9 yêu cầu).
      test.info().annotations.push({
        type: `icon-contrast-${colorScheme}`,
        description: iconContrast.toFixed(2),
      });
    });
  }

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`TC-S4.4-AC3-10: S4.4-AC3 Tương phản của dấu tick và chữ (${colorScheme})`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await completeOnboarding(page, 15);
      await expectLessonAt(page, INTRO_01, 1);

      const toggle = slowToggle(page);
      const icon = slowToggleIcon(page);
      const label = slowToggleLabel(page);

      // Lúc tắt: chữ so với nền màn phía sau (công tắc tắt không có nền riêng).
      await moveMouseAway(page);
      await expect(toggle).toHaveAttribute('aria-checked', 'false');
      let labelOffContrast = 0;
      await expect(async () => {
        labelOffContrast = await readContrastOnBackground(label);
        expect(labelOffContrast).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
      }).toPass({ timeout: COLOR_SETTLE_TIMEOUT_MS });

      await toggle.click();
      await moveMouseAway(page);
      await expect(toggle).toHaveAttribute('aria-checked', 'true');
      await expect(icon).toBeVisible();

      // Chờ `transition-colors` xong để đo đúng màu cuối của trạng thái bật.
      await expect(async () => {
        const colors = await readSlowToggleColors(page);
        expect(colors.text).toBe(colors.accent);
        expect(colors.background).toBe(colors.accentSoft);
      }).toPass({ timeout: COLOR_SETTLE_TIMEOUT_MS });

      // Lúc bật: dấu tick và chữ so với nền nhấn nhạt của công tắc.
      let iconContrast = 0;
      let labelOnContrast = 0;
      await expect(async () => {
        iconContrast = await readContrastOnBackground(icon);
        labelOnContrast = await readContrastOnBackground(label);
        expect(iconContrast).toBeGreaterThanOrEqual(MIN_ICON_CONTRAST);
        expect(labelOnContrast).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
      }).toPass({ timeout: COLOR_SETTLE_TIMEOUT_MS });

      test.info().annotations.push(
        {
          type: `label-off-contrast-${colorScheme}`,
          description: labelOffContrast.toFixed(2),
        },
        {
          type: `label-on-contrast-${colorScheme}`,
          description: labelOnContrast.toFixed(2),
        },
        {
          type: `icon-contrast-${colorScheme}`,
          description: iconContrast.toFixed(2),
        },
      );
    });
  }

  test('TC-S4.4-AC3-11: S4.4-AC3 Giảm chuyển động thì dấu tick hiện ngay', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await completeOnboarding(page, 15);
    await expectLessonAt(page, INTRO_01, 1);

    const toggle = slowToggle(page);
    const icon = slowToggleIcon(page);

    // Công tắc không chuyển màu dần khi giảm chuyển động.
    const toggleMotion = await readMotionStyle(toggle);
    expect(toggleMotion.maxTransitionSeconds).toBeLessThanOrEqual(
      MAX_STATIC_TRANSITION_SECONDS,
    );

    await toggle.click();
    await moveMouseAway(page);

    // Lúc bật: dấu tick hiện ngay, không trượt, mờ dần hay chuyển động.
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await expect(icon).toBeVisible({ timeout: IMMEDIATE_TIMEOUT_MS });
    const motion = await readMotionStyle(icon);
    expect(motion.animationName).toBe('none');
    expect(motion.maxTransitionSeconds).toBeLessThanOrEqual(
      MAX_STATIC_TRANSITION_SECONDS,
    );
    expect(motion.opacity).toBe('1');
    expect(motion.transform).toBe('none');
    // Màu bật hiện ngay (không đợi chuyển màu).
    const onColors = await readSlowToggleColors(page);
    expect(onColors.text).toBe(onColors.accent);
    expect(onColors.background).toBe(onColors.accentSoft);

    // Lúc tắt: dấu tick mất ngay, màu về trạng thái tắt ngay.
    await toggle.click();
    await moveMouseAway(page);
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await expect(icon).toHaveCount(0, { timeout: IMMEDIATE_TIMEOUT_MS });
    const offColors = await readSlowToggleColors(page);
    expect(offColors.background).not.toBe(offColors.accentSoft);
    expect(offColors.text).not.toBe(offColors.accent);
  });

  test('TC-S4.4-AC3-12: S4.4-AC3 Không giảm chuyển động thì dấu tick vẫn hiện ngay', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await completeOnboarding(page, 15);
    await expectLessonAt(page, INTRO_01, 1);

    const toggle = slowToggle(page);
    const icon = slowToggleIcon(page);

    await toggle.click();

    // Lúc bật: dấu tick hiện ngay, không mờ dần, trượt hay phóng to.
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await expect(icon).toBeVisible({ timeout: IMMEDIATE_TIMEOUT_MS });
    const motion = await readMotionStyle(icon);
    expect(motion.animationName).toBe('none');
    expect(motion.maxTransitionSeconds).toBeLessThanOrEqual(
      MAX_STATIC_TRANSITION_SECONDS,
    );
    expect(motion.opacity).toBe('1');
    expect(motion.transform).toBe('none');

    // Lúc tắt: dấu tick mất ngay (gỡ khỏi DOM, không có hiệu ứng rời đi).
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await expect(icon).toHaveCount(0, { timeout: IMMEDIATE_TIMEOUT_MS });
  });
});
