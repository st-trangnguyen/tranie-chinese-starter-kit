import { defineProject } from 'vitest/config';
import react from '@vitejs/plugin-react';
import Path from 'path';

import { alias } from './aliases';

/**
 * Standalone config for unit tests.
 *
 * It deliberately does NOT reuse vite.config.ts: that config sets `root` to
 * `src/`, which would make every test path resolve relative to `src/` instead
 * of the package root.
 */
export default defineProject({
  plugins: [react()],
  resolve: {
    alias: {
      ...alias,
      // Module ảo của vite-plugin-pwa không có khi chạy Vitest (xem src/test/mocks).
      'virtual:pwa-register/react': Path.resolve(
        __dirname,
        './src/test/mocks/pwaRegister.ts',
      ),
    },
  },
  // `src/config/environment.ts` reads process.env.APP_ENV, which only exists
  // because vite.config.ts defines it. Mirror that here.
  define: {
    'process.env.APP_ENV': JSON.stringify('test'),
  },
  test: {
    name: 'web',
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Scoped to src/ so e2e/ (Playwright) is never picked up by Vitest.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    css: false,
  },
});
