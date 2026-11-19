import { defineConfig, loadEnv, runnerImport } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import { createHtmlPlugin } from 'vite-plugin-html';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'fs';
import Path from 'path';

import { alias } from './aliases';
import {
  OFFLINE_FIXTURE_PATHS,
  offlineFixturesPlugin,
} from './e2e/fixtures/offlineFixturesPlugin';
import type * as AudioCachingConfig from './src/app/core/modules/pwa/audio-caching.config';

// Màu `bg` sáng của design system: nền splash và thanh trạng thái khi cài PWA.
const APP_BACKGROUND = '#F6F5EF';
const MAX_PRECACHE_FILE_BYTES = 5 * 1024 * 1024;

const PATHS = {
  output: Path.join(__dirname, './dist'),
  source: Path.join(__dirname, './src'),
  fixed: '/',
  audioIndex: Path.join(__dirname, './src/assets/content/audio-index.json'),
  audioCachingConfig: Path.join(
    __dirname,
    './src/app/core/modules/pwa/audio-caching.config.ts',
  ),
};

const readJson = (file: string): unknown =>
  JSON.parse(readFileSync(file, 'utf8'));

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, __dirname);
  /*
   * Nạp qua module runner của Vite thay vì import tĩnh: bundler config của Vite để `@csk/shared`
   * là external và Node không chạy được mã nguồn TS của package đó (import không đuôi).
   */
  const { module: audioCaching } = await runnerImport<
    typeof AudioCachingConfig
  >(PATHS.audioCachingConfig, { root: __dirname, logLevel: 'error' });
  const {
    createAudioRuntimeCaching,
    listPrecachedAudioPatterns,
    PRECACHE_BASE_PATTERNS,
  } = audioCaching;
  // S8.4: chỉ precache audio Nhập môn; audio HSK tải theo chủ đề hoặc khi phát.
  const precachedAudio = [
    ...listPrecachedAudioPatterns(readJson(PATHS.audioIndex)),
    ...(mode === 'e2e' ? [OFFLINE_FIXTURE_PATHS.audio] : []),
  ];

  return {
    root: PATHS.source,
    base: PATHS.fixed,
    publicDir: 'assets',
    envDir: __dirname,
    plugins: [
      react(),
      // Chỉ bản build cho Playwright (`--mode e2e`): thêm nội dung + audio mẫu để kiểm offline.
      mode === 'e2e' && offlineFixturesPlugin(),
      tailwindcss(),
      svgr(),
      createHtmlPlugin({
        minify: true,
        /**
         * After writing entry here, you will not need to add script tags in `index.html`, the original tags need to be deleted
         * @default /app/App.tsx
         */
        entry: '/app/App.tsx',
        template: 'index.html',
      }),
      VitePWA({
        // S1.4: có bản mới thì hỏi người học, không tự tải lại.
        registerType: 'prompt',
        injectRegister: false,
        includeAssets: [
          'icons/favicon.ico',
          'icons/app-logo.svg',
          'icons/apple-touch-icon-180x180.png',
        ],
        manifest: {
          id: '/',
          name: 'Tranie Chinese',
          short_name: 'Tranie',
          description: 'Học tiếng Trung từ Pinyin tới HSK, chạy offline.',
          lang: 'vi',
          dir: 'ltr',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          theme_color: APP_BACKGROUND,
          background_color: APP_BACKGROUND,
          icons: [
            { src: 'icons/pwa-64x64.png', sizes: '64x64', type: 'image/png' },
            {
              src: 'icons/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'icons/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'icons/maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // S1.2: precache toàn bộ khung app, font, i18n, nội dung và audio Nhập môn.
          globPatterns: [...PRECACHE_BASE_PATTERNS, ...precachedAudio],
          // S8.4: audio ngoài precache lưu vào `audio-cache` khi phát hoặc tải theo chủ đề.
          runtimeCaching: [createAudioRuntimeCaching()],
          navigateFallback: 'index.html',
          maximumFileSizeToCacheInBytes: MAX_PRECACHE_FILE_BYTES,
          cleanupOutdatedCaches: true,
        },
      }),
    ],
    define: {
      'process.env.APP_ENV': JSON.stringify(env.VITE_APP_ENV),
    },
    resolve: {
      alias,
    },
    build: {
      outDir: PATHS.output,
    },
  };
});
