#!/usr/bin/env node
/**
 * Stop: trước khi agent kết thúc lượt, chạy bộ check chuẩn (CLAUDE.md §8) nếu working tree
 * có thay đổi. Fail → exit 2: Claude nhận lỗi và phải sửa tiếp thay vì báo "đã xong".
 * Nếu đã bị chặn một lần (stop_hook_active) mà vẫn fail thì không chặn nữa, chỉ báo
 * người dùng — tránh vòng lặp vô hạn.
 */
import { execSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const CHECKS = ['typecheck', 'lint', 'test:run', 'content:check'];
const OUTPUT_TAIL_LINES = 60;
const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

const input = JSON.parse(readFileSync(0, 'utf8'));

const changes = execSync('git status --porcelain', {
  cwd: projectDir,
  encoding: 'utf8',
});
if (changes.trim() === '') {
  process.exit(0);
}

for (const check of CHECKS) {
  const result = spawnSync('pnpm', [check], {
    cwd: projectDir,
    encoding: 'utf8',
  });
  if (result.status === 0) {
    continue;
  }

  const output = `${result.stdout}${result.stderr}`.trim().split('\n');
  const tail = output.slice(-OUTPUT_TAIL_LINES).join('\n');

  if (input.stop_hook_active) {
    process.stdout.write(
      JSON.stringify({
        systemMessage: `pnpm ${check} vẫn fail sau khi agent đã sửa một lần.`,
      }),
    );
    process.exit(0);
  }

  process.stderr.write(
    `pnpm ${check} fail. Sửa trước khi kết thúc:\n${tail}\n`,
  );
  process.exit(2);
}
