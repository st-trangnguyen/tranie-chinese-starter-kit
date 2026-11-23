/** Helper e2e S8.4 cho a11y: đi bằng bàn phím, ghi lại vùng thông báo và lần focus rơi về đầu trang. */
import { expect, type Locator, type Page } from '@playwright/test';

import { downloadButton } from './offline-audio-download.helpers';
import { ANNOUNCER_LABEL } from './offline-audio.helpers';

declare global {
  interface Window {
    cskAnnouncerSnapshots?: string[][];
    cskFocusLostCount?: number;
  }
}

const MAX_TABS = 120;

/** Nhấn Tab (hoặc Shift+Tab) tới khi `target` nhận focus; không tới được thì fail. */
export const tabTo = async (
  page: Page,
  target: Locator,
  isBackward = false,
): Promise<void> => {
  const key = isBackward ? 'Shift+Tab' : 'Tab';
  for (let step = 0; step < MAX_TABS; step += 1) {
    if (
      await target.evaluate((element) => element === document.activeElement)
    ) {
      return;
    }
    await page.keyboard.press(key);
  }
  await expect(target).toBeFocused();
};

/** Nhấn Shift+Tab tới khi focus nằm ở link một bài trên bản đồ; trả về tiêu đề bài đó. */
export const shiftTabToLessonLink = async (page: Page): Promise<string> => {
  for (let step = 0; step < MAX_TABS; step += 1) {
    await page.keyboard.press('Shift+Tab');
    const title = await page.evaluate(() => {
      const active = document.activeElement;
      return active instanceof HTMLAnchorElement &&
        active.classList.contains('learning-path-lesson-link')
        ? (active.querySelector('.learning-path-lesson-title')?.textContent ??
            '')
        : null;
    });
    if (title) {
      return title;
    }
  }
  throw new Error('Không Tab tới được link bài nào trên bản đồ.');
};

/** Tab tới nút tải của chủ đề `title` rồi nhấn Enter; trả về chữ trên nút. */
export const downloadWithKeyboard = async (
  page: Page,
  title: string,
  isBackward = false,
): Promise<string> => {
  const button = downloadButton(page, title);
  await expect(button).toHaveCount(1);
  const label = (await button.innerText()).trim();
  await tabTo(page, button, isBackward);
  await page.keyboard.press('Enter');
  return label;
};

/** Dung lượng trong nhãn "Tải audio (<dung lượng>)". */
export const sizeOf = (label: string): string =>
  label.replace(/^Tải audio \((.+)\)$/, '$1');

/**
 * Ghi lại danh sách câu trong vùng thông báo sau mỗi lần DOM đổi (không lặp liên tiếp). Gọi khi
 * màn Lộ trình đang mở; đọc bằng `readAnnouncerSnapshots`.
 */
export const recordAnnouncer = async (page: Page): Promise<void> => {
  await page.evaluate((label) => {
    const snapshots: string[][] = [];
    window.cskAnnouncerSnapshots = snapshots;
    const capture = (): void => {
      const region = document.querySelector(
        `[role="status"][aria-label="${label}"]`,
      );
      const sentences = [...(region?.children ?? [])].map(
        (child) => child.textContent?.trim() ?? '',
      );
      if (sentences.join('\n') !== snapshots.at(-1)?.join('\n')) {
        snapshots.push(sentences);
      }
    };
    capture();
    new MutationObserver(capture).observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }, ANNOUNCER_LABEL);
};

export const readAnnouncerSnapshots = (page: Page): Promise<string[][]> =>
  page.evaluate(() =>
    (window.cskAnnouncerSnapshots ?? []).map((sentences) => [...sentences]),
  );

/**
 * Đếm số lần, sau một lần DOM đổi, focus nằm ở `body` (về đầu trang). Gọi sau khi đã focus một
 * phần tử; đọc bằng `readFocusLostCount`. Layout effect chuyển focus chạy trước callback này.
 */
export const recordFocusLoss = async (page: Page): Promise<void> => {
  await page.evaluate(() => {
    window.cskFocusLostCount = 0;
    new MutationObserver(() => {
      const active = document.activeElement;
      if (!active || active === document.body) {
        window.cskFocusLostCount = (window.cskFocusLostCount ?? 0) + 1;
      }
    }).observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  });
};

export const readFocusLostCount = (page: Page): Promise<number> =>
  page.evaluate(() => window.cskFocusLostCount ?? 0);
