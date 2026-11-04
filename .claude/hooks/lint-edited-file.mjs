#!/usr/bin/env node
/**
 * PostToolUse (Edit|Write): lint đúng file agent vừa sửa, gồm cả Dependency Rule.
 * Lỗi → exit 2 để Claude nhận lỗi và sửa ngay, không đợi tới cuối lượt.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const LINTABLE = /\.(ts|tsx|js|mjs)$/;
const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

const input = JSON.parse(readFileSync(0, 'utf8'));
const filePath = input.tool_input?.file_path ?? input.tool_response?.filePath;

if (typeof filePath !== 'string' || !LINTABLE.test(filePath)) {
  process.exit(0);
}

const rel = relative(projectDir, resolve(filePath));
if (rel.startsWith('..') || rel.includes('node_modules')) {
  process.exit(0);
}

const result = spawnSync(
  'pnpm',
  ['exec', 'eslint', '--max-warnings', '0', '--no-warn-ignored', rel],
  { cwd: projectDir, encoding: 'utf8' },
);

if (result.status !== 0) {
  process.stderr.write(
    `ESLint báo lỗi ở ${rel}:\n${result.stdout}${result.stderr}`,
  );
  process.exit(2);
}
