import Path from 'path';

/**
 * Single source of truth for module aliases inside apps/web.
 * Imported by both vite.config.ts and vitest.config.ts so the two never drift.
 * Keep tsconfig.json "paths" in sync manually (JSON cannot import this file).
 * Other packages are imported by package name (`@csk/shared`), never by alias.
 */
export const alias = {
  '@app': Path.resolve(__dirname, './src/app'),
  '@config': Path.resolve(__dirname, './src/config'),
  '@shared': Path.resolve(__dirname, './src/app/shared'),
  '@core': Path.resolve(__dirname, './src/app/core'),
  '@assets': Path.resolve(__dirname, './src/assets'),
  '@test': Path.resolve(__dirname, './src/test'),
};
