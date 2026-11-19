/** Helper e2e S8.4 cho luồng tải audio: nút trong khối, nghe audio trong bài, nhật ký trạng thái. */
import { expect, type Locator, type Page } from '@playwright/test';

import {
  E2E_AUDIO,
  LEARNING_PATH_URL,
  OFFLINE_AUDIO_STAGE,
  offlineAudioBlock,
  openLessonByUrl,
  unitSection,
  unitTitle,
} from './offline-audio.helpers';

declare global {
  interface Window {
    cskOfflineAudioStatusLog?: string[];
  }
}

export const GREET = unitTitle('greet');
export const GREET_LESSON_ID = 'e2e-greet';
/** Audio "Chào hỏi" theo thứ tự câu trong bài (cũng là thứ tự tải). */
export const GREET_AUDIO = [
  E2E_AUDIO.greetFamily.path,
  E2E_AUDIO.greetOnly1.path,
  E2E_AUDIO.greetOnly2.path,
  E2E_AUDIO.greetOnly3.path,
] as const;
export const AUDIO_CACHE = 'audio-cache';
const DOWNLOAD_TEXT = /^Tải audio/;
const REMOVE_TEXT = /^Xóa audio/;

/** Mở màn Lộ trình bằng URL, chờ giai đoạn mẫu hiện. */
export const openLearningPath = async (page: Page): Promise<void> => {
  await page.goto(LEARNING_PATH_URL);
  await expect(
    page.getByRole('heading', { level: 2, name: OFFLINE_AUDIO_STAGE.title }),
  ).toBeVisible();
};

export const downloadButton = (page: Page, title: string): Locator =>
  unitSection(page, title).getByRole('button', { name: DOWNLOAD_TEXT });

export const removeButton = (page: Page, title: string): Locator =>
  unitSection(page, title).getByRole('button', { name: REMOVE_TEXT });

/** Dòng chữ trong khối audio của chủ đề có đúng `text`. */
export const blockText = (page: Page, title: string, text: string): Locator =>
  offlineAudioBlock(page, title).getByText(text, { exact: true });

/** Khối hiện "Đã tải audio (<size>)" kèm nút "Xóa audio", không còn nút tải hay "Đang tải". */
export const expectDownloaded = async (
  page: Page,
  title: string,
  size: string,
): Promise<void> => {
  await expect(blockText(page, title, `Đã tải audio (${size})`)).toBeVisible();
  await expect(removeButton(page, title)).toHaveText('Xóa audio');
  await expect(downloadButton(page, title)).toHaveCount(0);
  await expect(
    offlineAudioBlock(page, title).getByText(/Đang tải/),
  ).toHaveCount(0);
};

/** Khối hiện "Đang tải <percent>%", không có nút tải hay nút xóa. */
export const expectDownloading = async (
  page: Page,
  title: string,
  percent: number,
): Promise<void> => {
  await expect(blockText(page, title, `Đang tải ${percent}%`)).toBeVisible();
  await expect(downloadButton(page, title)).toHaveCount(0);
  await expect(removeButton(page, title)).toHaveCount(0);
};

/** Bấm "Tải audio" của chủ đề, trả về chữ trên nút (dạng "Tải audio (<size>)"). */
export const clickDownload = async (
  page: Page,
  title: string,
): Promise<string> => {
  const button = downloadButton(page, title);
  await expect(button).toHaveCount(1);
  const label = (await button.innerText()).trim();
  await button.click();
  return label;
};

/** `audio/<file>.mp3` có trong cache `audio-cache` (Cache Storage của origin). */
export const isInAudioCache = (page: Page, path: string): Promise<boolean> =>
  page.evaluate(
    async ([cacheName, url]) => {
      const cache = await caches.open(cacheName);
      return (await cache.match(url)) !== undefined;
    },
    [AUDIO_CACHE, `/${path}`] as const,
  );

/**
 * Mở bài "Chào hỏi" bằng URL và nghe `count` câu đầu: bấm "Nghe mẫu", chờ audio của câu được lưu
 * vào `audio-cache` (qua service worker), tự đánh giá rồi sang câu kế.
 */
export const listenToGreetAudio = async (
  page: Page,
  count: number,
): Promise<void> => {
  await openLessonByUrl(page, GREET_LESSON_ID);
  for (const [index, path] of GREET_AUDIO.slice(0, count).entries()) {
    await expect(
      page.getByText(`Câu ${index + 1} / ${GREET_AUDIO.length}`, {
        exact: true,
      }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Nghe mẫu', exact: true }).click();
    await expect
      .poll(() => isInAudioCache(page, path), {
        message: `${path} phải được lưu vào ${AUDIO_CACHE} sau khi nghe`,
      })
      .toBe(true);
    await page
      .getByRole('group', { name: 'Tự đánh giá phát âm' })
      .getByRole('button', { name: 'Đúng', exact: true })
      .click();
    await page.getByRole('button', { name: 'Tiếp tục' }).click();
  }
};

/**
 * Ghi lại mọi chữ trạng thái ("Đang tải …", "Đã tải audio …") khối của chủ đề `title` từng hiện,
 * không lặp liên tiếp. Gọi khi màn Lộ trình đang mở; đọc bằng `readStatusLog`.
 */
export const recordStatusLog = async (
  page: Page,
  title: string,
): Promise<void> => {
  await page.evaluate((unitTitleText) => {
    const log: string[] = [];
    window.cskOfflineAudioStatusLog = log;
    const capture = (): void => {
      const section = [
        ...document.querySelectorAll('main section section'),
      ].find(
        (element) =>
          element.querySelector('h3')?.textContent?.trim() === unitTitleText,
      );
      const text = section
        ?.querySelector('.offline-audio-status')
        ?.textContent?.trim();
      if (text && log.at(-1) !== text) {
        log.push(text);
      }
    };
    capture();
    new MutationObserver(capture).observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }, title);
};

export const readStatusLog = (page: Page): Promise<string[]> =>
  page.evaluate(() => [...(window.cskOfflineAudioStatusLog ?? [])]);
