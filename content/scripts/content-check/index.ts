/**
 * `pnpm content:check` — kiểm tra nội dung, chạy trong hook của agent và trong CI.
 * Lỗi → exit 1. Cảnh báo → chỉ in ra.
 *
 * Thêm check mới vào CHECKS (S2.1 danh sách từ, S2.2 nghĩa, S2.3 YAML bài, S2.5 nét chữ).
 */
import {
  exitCodeOf,
  formatIssue,
  runChecks,
  type ContentCheck,
} from './checkRunner';

const CHECKS: readonly ContentCheck[] = [];

async function main(): Promise<void> {
  const report = await runChecks(CHECKS);

  for (const issue of report.issues) {
    process.stdout.write(`${formatIssue(issue)}\n`);
  }
  process.stdout.write(
    `content:check — ${CHECKS.length} check, ${report.errorCount} lỗi, ` +
      `${report.warningCount} cảnh báo\n`,
  );
  process.exitCode = exitCodeOf(report);
}

await main();
