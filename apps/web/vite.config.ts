import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import { createHtmlPlugin } from 'vite-plugin-html';
import { VitePWA } from 'vite-plugin-pwa';
import Path from 'path';

import { alias } from './aliases';

// Màu `bg` sáng của design system: nền splash và thanh trạng thái khi cài PWA.
const APP_BACKGROUND = '#F6F5EF';
const MAX_PRECACHE_FILE_BYTES = 5 * 1024 * 1024;

const PATHS = {
  output: Path.join(__dirname, './dist'),
  source: Path.join(__dirname, './src'),
  fixed: '/',
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname);

  return {
    root: PATHS.source,
    base: PATHS.fixed,
    publicDir: 'assets',
    envDir: __dirname,
    plugins: [
      react(),
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
          globPatterns: ['**/*.{js,css,html,woff2,svg,png,ico,json,mp3}'],
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
