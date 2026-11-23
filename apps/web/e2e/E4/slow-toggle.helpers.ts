/** Helper e2e của công tắc "Nghe chậm" S4.4-AC3 (dấu tick, màu nhấn). */
import type { Locator, Page } from '@playwright/test';

import { slowToggle } from '../E8/settings-lesson.helpers';

export const slowToggleIcon = (page: Page): Locator =>
  slowToggle(page).locator('.audio-slow-toggle-icon');

export const slowToggleLabel = (page: Page): Locator =>
  slowToggle(page).locator('.audio-slow-toggle-label');

/** Dời con trỏ ra khỏi công tắc để màu đọc được không bị `:hover` chi phối. */
export const moveMouseAway = (page: Page): Promise<void> =>
  page.mouse.move(0, 0);

export interface SlowToggleColors {
  border: string;
  background: string;
  text: string;
  accent: string;
  accentSoft: string;
}

/**
 * Màu viền/nền/chữ của công tắc và giá trị `--csk-accent`, `--csk-accent-soft` trên `:root`. Mọi màu
 * đổi về sRGB `r, g, b, a` qua canvas (biến CSS trả hex thô, `getComputedStyle` trả `rgb(...)`).
 */
export const readSlowToggleColors = (page: Page): Promise<SlowToggleColors> =>
  slowToggle(page).evaluate((element) => {
    const toRgb = (color: string): string => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Không có canvas 2d.');
      }
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
      return `${r}, ${g}, ${b}, ${a}`;
    };
    const style = getComputedStyle(element);
    const root = getComputedStyle(document.documentElement);
    return {
      border: toRgb(style.borderTopColor),
      background: toRgb(style.backgroundColor),
      text: toRgb(style.color),
      accent: toRgb(root.getPropertyValue('--csk-accent').trim()),
      accentSoft: toRgb(root.getPropertyValue('--csk-accent-soft').trim()),
    };
  });

/**
 * Tỷ lệ tương phản giữa màu chữ (`color`) của `target` và nền phía sau nó. Nhận dấu tick
 * (`.audio-slow-toggle-icon`) hoặc nhãn (`.audio-slow-toggle-label`), không nhận chính công tắc. Nền
 * là `backgroundColor` của tổ tiên gần nhất (đi từ `parentElement` lên) có alpha > 0: lúc bật là
 * chính công tắc, lúc tắt là nền màn phía sau. Màu chuẩn hoá về sRGB qua canvas trước khi tính độ
 * sáng tương đối (WCAG 2.1).
 */
export const readContrastOnBackground = (target: Locator): Promise<number> =>
  target.evaluate((element) => {
    const toRgb = (color: string): [number, number, number, number] => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Không có canvas 2d.');
      }
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
      return [r, g, b, a];
    };
    const luminance = ([r, g, b]: [number, number, number, number]): number => {
      const channel = (value: number): number => {
        const c = value / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };
    const backgroundOf = (start: Element): string => {
      let node: Element | null = start.parentElement;
      while (node) {
        const color = getComputedStyle(node).backgroundColor;
        if (toRgb(color)[3] > 0) {
          return color;
        }
        node = node.parentElement;
      }
      return 'rgb(255, 255, 255)';
    };
    const foreground = luminance(toRgb(getComputedStyle(element).color));
    const background = luminance(toRgb(backgroundOf(element)));
    return (
      (Math.max(foreground, background) + 0.05) /
      (Math.min(foreground, background) + 0.05)
    );
  });

export interface MotionStyle {
  animationName: string;
  /** Thời lượng transition dài nhất, tính bằng giây. */
  maxTransitionSeconds: number;
  opacity: string;
  transform: string;
}

/**
 * Ngưỡng "tĩnh" cho transition, như `MAX_STATIC_TRANSITION_SECONDS` của S6.2: quy tắc giảm chuyển
 * động chung (`styles/tailwind/base/_base.css`) đặt `0.01ms`, nên 1e-5 s coi là không chuyển động.
 */
export const MAX_STATIC_TRANSITION_SECONDS = 0.00001;

const parseDurationSeconds = (value: string): number => {
  const trimmed = value.trim();
  const seconds = trimmed.endsWith('ms')
    ? Number.parseFloat(trimmed.slice(0, -2)) / 1000
    : Number.parseFloat(trimmed.slice(0, -1));
  if (!trimmed.endsWith('s') || Number.isNaN(seconds)) {
    throw new Error(`Không đọc được thời lượng transition: "${value}".`);
  }
  return seconds;
};

/** Kiểu chuyển động đã tính của `target` (dấu tick hoặc công tắc). */
export const readMotionStyle = async (
  target: Locator,
): Promise<MotionStyle> => {
  const style = await target.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      animationName: computed.animationName,
      transitionDuration: computed.transitionDuration,
      opacity: computed.opacity,
      transform: computed.transform,
    };
  });
  return {
    animationName: style.animationName,
    maxTransitionSeconds: Math.max(
      ...style.transitionDuration.split(',').map(parseDurationSeconds),
    ),
    opacity: style.opacity,
    transform: style.transform,
  };
};
