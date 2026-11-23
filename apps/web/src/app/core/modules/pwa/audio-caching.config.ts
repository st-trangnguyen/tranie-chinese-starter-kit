import { audioIndexSchema } from '@csk/shared';
import type { VitePWAOptions } from 'vite-plugin-pwa';

import { AUDIO_CACHE_NAME } from '../../constants/audio.constants';

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
 * Không `Range`, đã là 206, hoặc `Range` không đọc được thì giữ nguyên response.
 * Hàm tự chứa: workbox-build chép `toString()` của nó vào `sw.js`.
 */
export const toPartialResponse = async ({
  request,
  response,
}: {
  request: Request;
  response: Response;
}): Promise<Response> => {
  const range = request.headers.get('Range');
  if (range === null || response.status !== 200) {
    return response;
  }
  const match = /^bytes=(\d+)-(\d*)$/.exec(range.trim());
  if (match === null) {
    return response;
  }
  const body = await response.clone().arrayBuffer();
  const start = Number(match[1]);
  const end = Math.min(
    match[2] ? Number(match[2]) : body.byteLength - 1,
    body.byteLength - 1,
  );
  if (start > end) {
    return response;
  }
  const headers = new Headers(response.headers);
  headers.set('Content-Range', `bytes ${start}-${end}/${body.byteLength}`);
  headers.set('Content-Length', String(end - start + 1));
  return new Response(body.slice(start, end + 1), {
    status: 206,
    statusText: 'Partial Content',
    headers,
  });
};

/** Một mục `workbox.runtimeCaching` của vite-plugin-pwa (generateSW). */
export type AudioRuntimeCaching = NonNullable<
  NonNullable<VitePWAOptions['workbox']>['runtimeCaching']
>[number];

/**
 * Route cache-first cho audio ngoài precache. `rangeRequests` cắt 206 khi trúng cache;
 * `toPartialResponse` lo lần trượt cache đầu tiên (mạng trả 200 vì `stripRangeRequest`).
 */
export const createAudioRuntimeCaching = (): AudioRuntimeCaching => ({
  urlPattern: /\/audio\/.+\.mp3$/,
  handler: 'CacheFirst',
  options: {
    cacheName: AUDIO_CACHE_NAME,
    cacheableResponse: { statuses: [200] },
    rangeRequests: true,
    plugins: [
      {
        requestWillFetch: stripRangeRequest,
        handlerWillRespond: toPartialResponse,
      },
    ],
  },
});
