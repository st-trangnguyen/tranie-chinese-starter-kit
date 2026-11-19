/*
 * Cấu hình cache audio của service worker (S8.4, design D3). `vite.config.ts` dùng file này nên
 * chỉ import tương đối và `@csk/shared` (vite.config không dùng alias `@core`).
 *
 * RED skeleton (task 7.1): chưa có hành vi, GREEN 7.2 viết thật.
 */

/** Glob precache khung app (font, i18n, nội dung). */
export const PRECACHE_BASE_PATTERNS: readonly string[] = [
  '**/*.{js,css,html,woff2,svg,png,ico,json,mp3}',
];

/** Đường dẫn audio Nhập môn cần precache, lấy từ `audio-index.json`. */
export const listPrecachedAudioPatterns = (indexJson: unknown): string[] => {
  void indexJson;
  return [];
};
