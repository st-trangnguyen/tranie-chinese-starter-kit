/** Helper e2e S8.4 (design D12): nội dung mẫu, điều khiển mạng audio, khối audio trên bản đồ. */
import { randomUUID } from 'crypto';
import {
  expect,
  type BrowserContext,
  type Locator,
  type Page,
} from '@playwright/test';
import { z } from 'zod';

import {
  FIXTURE_COOKIE,
  OFFLINE_AUDIO_LESSONS,
  SESSION_COOKIE,
  fixtureCookieValue,
  type OfflineAudioVariant,
} from '../fixtures/offlineAudioFixtures';
import {
  AUDIO_NETWORK_API,
  type AudioNetworkRules,
} from '../fixtures/offlineAudioNetworkPlugin';

export {
  E2E_AUDIO,
  INTRO_SENTENCE_IDS,
  OFFLINE_AUDIO_STAGE,
  unitTitle,
} from '../fixtures/offlineAudioFixtures';
export type { AudioNetworkRules } from '../fixtures/offlineAudioNetworkPlugin';

export const LEARNING_PATH_URL = '/learning-paths';
export const ANNOUNCER_LABEL = 'Thông báo audio offline';
const COOKIE_SCOPE = { domain: 'localhost', path: '/' } as const;

/**
 * Bật nội dung mẫu và phiên điều khiển mạng riêng cho context. Gọi **trước** lần mở trang đầu:
 * service worker precache lần cài đầu lấy bản gộp mẫu.
 */
export const useOfflineAudioFixture = async (
  context: BrowserContext,
  variant: OfflineAudioVariant = 'default',
): Promise<void> => {
  await context.addCookies([
    {
      name: FIXTURE_COOKIE,
      value: fixtureCookieValue(variant),
      ...COOKIE_SCOPE,
    },
    { name: SESSION_COOKIE, value: randomUUID(), ...COOKIE_SCOPE },
  ]);
};

/**
 * Đặt luật mạng cho mọi `/audio/*` của phiên (cả request do service worker gửi). Field vắng mặt
 * giữ giá trị cũ; `delayMs` làm chậm từng file, `holdPaths` giữ tới khi `releaseAudio`,
 * `failPaths` trả 503, `isOffline` hủy kết nối. Gọi qua `page.request` nên chạy cả khi trang offline.
 */
export const setAudioNetwork = async (
  page: Page,
  rules: AudioNetworkRules,
): Promise<void> => {
  const response = await page.request.post(AUDIO_NETWORK_API, { data: rules });
  expect(response.ok(), await response.text()).toBe(true);
};

/** Thả các request đang giữ của `path` (`audio/<file>.mp3`); request sau đó của path này đi thẳng. */
export const releaseAudio = async (page: Page, path: string): Promise<void> => {
  const response = await page.request.post(`${AUDIO_NETWORK_API}/release`, {
    data: { path },
  });
  expect(response.ok(), await response.text()).toBe(true);
};

const servedLogSchema = z.object({ served: z.array(z.string()) });

/**
 * Mọi lượt server đã phục vụ audio trong phiên, theo thứ tự, dạng `audio/<file>.mp3`. Gồm cả audio
 * Nhập môn SW precache lúc cài: lọc theo path cần kiểm (ví dụ path trong `E2E_AUDIO`).
 */
export const servedAudio = async (page: Page): Promise<string[]> => {
  const response = await page.request.get(`${AUDIO_NETWORK_API}/log`);
  expect(response.ok(), await response.text()).toBe(true);
  return servedLogSchema.parse(await response.json()).served;
};

/** Tắt mạng: middleware hủy request audio (cả của SW) rồi trình duyệt offline. */
export const goOffline = async (
  context: BrowserContext,
  page: Page,
): Promise<void> => {
  await setAudioNetwork(page, { isOffline: true });
  await context.setOffline(true);
};

/** Bật lại mạng (ngược với `goOffline`). */
export const goOnline = async (
  context: BrowserContext,
  page: Page,
): Promise<void> => {
  await context.setOffline(false);
  await setAudioNetwork(page, { isOffline: false });
};

/** Lần tải đầu chưa được service worker điều khiển: tải lại để SW nắm trang (mẫu E1/S1.2). */
export const openOnceWithServiceWorker = async (page: Page): Promise<void> => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
};

/** Chủ đề (`<section>` lồng trong giai đoạn) có tiêu đề `title`. */
export const unitSection = (page: Page, title: string): Locator =>
  page.locator('main section section').filter({
    has: page.getByRole('heading', { level: 3, name: title, exact: true }),
  });

/** Khối audio offline của chủ đề `title`; không có khối thì đếm được 0. */
export const offlineAudioBlock = (page: Page, title: string): Locator =>
  unitSection(page, title).locator('.offline-audio');

/** Vùng thông báo audio offline (trình đọc màn hình tự đọc). */
export const announcer = (page: Page): Locator =>
  page.getByRole('status', { name: ANNOUNCER_LABEL });

/**
 * Giả lập hết bộ nhớ: `Cache.prototype.put` ném `QuotaExceededError` cho các path chỉ định. Gọi trước
 * khi mở trang. Chỉ đúng khi context chặn SW (`serviceWorkers: 'block'`, design D12).
 */
export const simulateStorageFull = async (
  page: Page,
  paths: readonly string[],
): Promise<void> => {
  await page.addInitScript((fullPaths: readonly string[]) => {
    const originalPut = Cache.prototype.put;
    Cache.prototype.put = function put(request, response) {
      const url = new URL(
        request instanceof Request ? request.url : String(request),
        location.href,
      );
      if (fullPaths.some((path) => url.pathname === `/${path}`)) {
        return Promise.reject(
          new DOMException('Hết bộ nhớ (e2e)', 'QuotaExceededError'),
        );
      }
      return originalPut.call(this, request, response);
    };
  }, paths);
};

/** Mở bài (kể cả bài đang khóa) bằng URL, chờ tiêu đề bài hiện. */
export const openLessonByUrl = async (
  page: Page,
  lessonId: string,
): Promise<void> => {
  const lesson = OFFLINE_AUDIO_LESSONS.find((item) => item.id === lessonId);
  await page.goto(`/lessons/${lessonId}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    lesson?.title ?? /.+/,
  );
};
