import { defineConfig } from 'vitest/config';

/**
 * Runs every package's tests from the repo root in one process (watch mode,
 * merged coverage). Each project keeps its own vitest.config.ts, which is also
 * what `turbo run test:run` uses per package.
 */
export default defineConfig({
  test: {
    passWithNoTests: true,
    projects: ['apps/web', 'packages/shared', 'content'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'apps/web/src/**/*.{ts,tsx}',
        'packages/shared/src/**/*.ts',
        'content/scripts/**/*.ts',
      ],
      exclude: [
        '**/*.{test,spec}.{ts,tsx}',
        'apps/web/src/test/**',
        'apps/web/src/**/*.routes.ts',
        'apps/web/src/**/models/**',
        'apps/web/src/app/App.tsx',
      ],
    },
  },
});
