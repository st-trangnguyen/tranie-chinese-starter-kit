import { audioIndexSchema } from '@csk/shared';
import type { VitePWAOptions } from 'vite-plugin-pwa';

/*
 * Cấu hình cache audio của service worker (S8.4, design D3). `vite.config.ts` dùng file này nên
 * chỉ import tương đối và `@csk/shared` (vite.config không dùng alias `@core`).
 */

/** Glob precache khung app (font, i18n, nội dung). Không gồm mp3: audio precache theo index. */
export const PRECACHE_BASE_PATTERNS: readonly string[] = [
  '**/*.{js,css,html,woff2,svg,png,ico,json}',
];

/**
 * Đường dẫn audio Nhập môn cần precache, lấy từ `audio-index.json` (đường dẫn cụ thể, workbox
 * glob khớp đúng file). Index sai dạng thì throw để build dừng.
 */
export const listPrecachedAudioPatterns = (indexJson: unknown): string[] => {
  const result = audioIndexSchema.safeParse(indexJson);
  if (!result.success) {
    throw new Error(
      `audio-index.json không hợp lệ, không dựng được danh sách precache audio: ${result.error.message}`,
    );
  }
  return [...result.data.precached];
};

/**
 * Plugin `requestWillFetch` của route audio: bỏ header `Range` để mạng trả 200 đầy đủ, cache được
 * (206 không cache được). Hàm tự chứa: workbox-build chép `toString()` của nó vào `sw.js`.
 */
export const stripRangeRequest = async ({
  request,
}: {
  request: Request;
}): Promise<Request> =>
  new Request(request.url, { credentials: 'same-origin' });

/**
 * Plugin `handlerWillRespond` của route audio: request có `Range` mà response 200 thì dựng 206.
 * Hàm tự chứa: workbox-build chép `toString()` của nó vào `sw.js`.
 * RED 7.5: skeleton chưa có hành vi, GREEN 7.6 cài đặt.
 */
export const toPartialResponse = async ({
  response,
}: {
  request: Request;
  response: Response;
}): Promise<Response> => response;

/** Một mục `workbox.runtimeCaching` của vite-plugin-pwa (generateSW). */
export type AudioRuntimeCaching = NonNullable<
  NonNullable<VitePWAOptions['workbox']>['runtimeCaching']
>[number];

/** Route cache-first cho audio ngoài precache. RED 7.5: skeleton, GREEN 7.6 cài đặt. */
export const createAudioRuntimeCaching = (): AudioRuntimeCaching => ({
  urlPattern: /$^/,
  handler: 'NetworkOnly',
});
