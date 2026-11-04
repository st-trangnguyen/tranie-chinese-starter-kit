import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

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
];
