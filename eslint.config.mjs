import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

/**
 * Dependency Rule (CLAUDE.md §2) — mỗi nhánh ❌ thành một lệnh cấm import theo thư mục.
 * File test được miễn: test được phép mock service hoặc dựng DB thật.
 */
const APP = 'apps/web/src/app';
const TEST_FILES = ['**/*.{test,spec}.{ts,tsx}'];

const REACT_IMPORTS = {
  group: ['react', 'react/*', 'react-*', 'react-*/*', '@testing-library/react'],
  message:
    'Service phải chạy được ngoài React: không import React / router (CLAUDE.md §2).',
};
const DEXIE_IMPORTS = {
  group: ['dexie', '@core/helpers/db.helper', '**/helpers/db.helper'],
  message:
    'shared/services chỉ đọc/ghi qua ProgressStore, không dùng Dexie trực tiếp (CLAUDE.md §2).',
};
const SHARED_SERVICE_IMPORTS = {
  group: ['@shared/services/*', '**/shared/services/*'],
  message:
    'Gọi service qua hook của feature, không gọi trực tiếp (CLAUDE.md §2).',
};
const UPWARD_IMPORTS = {
  group: [
    '@app/pages/*',
    '**/pages/**',
    '@shared/components/*',
    '@shared/contexts/*',
  ],
  message:
    'Service không import UI (pages, components, contexts) (CLAUDE.md §2).',
};
const ANY_SERVICE_IMPORTS = {
  group: ['@shared/services/*', '@core/services/*', '**/services/*'],
  message:
    'Lớp này không gọi service. Nhận dữ liệu qua props / core/hooks (CLAUDE.md §2).',
};

const restrictImports = (files, patterns) => ({
  files,
  ignores: TEST_FILES,
  rules: { 'no-restricted-imports': ['error', { patterns }] },
});

// Khối sau ghi đè khối trước khi cùng khớp một file, nên thứ tự từ rộng đến hẹp.
const dependencyRules = [
  restrictImports(
    [`${APP}/shared/services/**`],
    [REACT_IMPORTS, DEXIE_IMPORTS, UPWARD_IMPORTS],
  ),
  restrictImports(
    [`${APP}/core/services/**`],
    [REACT_IMPORTS, SHARED_SERVICE_IMPORTS],
  ),
  // Ngoại lệ có chủ đích: i18n.service cắm plugin `initReactI18next` lúc khởi tạo.
  restrictImports(
    [`${APP}/core/services/i18n.service.ts`],
    [SHARED_SERVICE_IMPORTS],
  ),
  restrictImports(
    [
      `${APP}/pages/*/containers/**`,
      `${APP}/pages/*/components/**`,
      `${APP}/shared/components/**`,
    ],
    [SHARED_SERVICE_IMPORTS],
  ),
  restrictImports(
    [`${APP}/shared/components/exercises/**`],
    [ANY_SERVICE_IMPORTS],
  ),
  restrictImports([`${APP}/shared/utils/**`], [ANY_SERVICE_IMPORTS]),
];

/**
 * One flat config for the whole monorepo. Each package runs `eslint .` from its
 * own folder; ESLint finds this file by walking up from there.
 */
export default [
  {
    ignores: [
      '**/dist',
      '**/build',
      '**/coverage',
      '**/.turbo',
      '**/playwright-report',
      '**/test-results',
      'content/data-raw',
    ],
  },
  js.configs.recommended,
  ...typescriptEslint.configs['flat/recommended'],
  prettierRecommended,
  {
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // possible-errors
      'no-console': [1],

      // best-practices
      curly: [2],
      'default-case': [1],
      'default-case-last': [1],
      eqeqeq: [1, 'always'],
      'no-alert': [1],

      // variables
      'no-undef-init': [2],

      // stylistic-issues
      camelcase: [2, { properties: 'always' }],
      'no-nested-ternary': [1],
      'no-unneeded-ternary': [2],

      // es 6
      'no-duplicate-imports': [1],

      // prettier rules
      'prettier/prettier': 'warn',
    },
  },
  {
    // apps/web: browser + React.
    files: ['apps/web/src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    // Web App Manifest bắt buộc key snake_case (short_name, start_url, theme_color…).
    files: ['apps/web/vite.config.ts'],
    rules: {
      camelcase: [2, { properties: 'never' }],
    },
  },
  {
    // Test files and test infrastructure.
    files: [
      '**/*.{test,spec}.{ts,tsx}',
      'apps/web/src/test/**/*.{ts,tsx}',
      'apps/web/e2e/**/*.ts',
    ],
    languageOptions: {
      globals: { ...globals.vitest },
    },
    rules: {
      camelcase: 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  ...dependencyRules,
];
