import { audioIndexSchema } from '@csk/shared';

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
