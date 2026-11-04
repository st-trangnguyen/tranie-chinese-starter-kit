/**
 * `pnpm content:check` — kiểm tra nội dung, chạy trong hook của agent và trong CI.
 * Lỗi → exit 1. Cảnh báo → chỉ in ra. Không cần mạng.
 *
 * S2.1 danh sách từ · S2.2 nghĩa · S2.3 bài YAML · S2.4 audio · S2.5 nét chữ · output khớp nguồn.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import {
  exitCodeOf,
  formatIssue,
  runChecks,
  type ContentCheck,
} from './checkRunner';
import {
  audioCheck,
  hskWordsCheck,
  lessonsCheck,
  outputInSyncCheck,
  strokesCheck,
  viMeaningsCheck,
} from './checks';
import { assembleContent } from '../content-build/assemble';
import { readBuildInputs } from '../content-build/inputs';
import { diffOutput } from '../content-build/output';
import { PATHS, repoPath } from '../lib/paths';

function buildChecks(): ContentCheck[] {
  const inputs = readBuildInputs();
  const build = assembleContent(inputs);
  return [
    hskWordsCheck(repoPath(PATHS.hskWords), inputs.hskEntries),
    viMeaningsCheck(
      repoPath(PATHS.viMeanings),
      inputs.hskEntries,
      inputs.meanings,
    ),
    lessonsCheck(build.lessonIssues),
    audioCheck(repoPath(PATHS.audioOut), build.audioJobs, (path) =>
      existsSync(join(PATHS.assets, path)),
    ),
    strokesCheck(repoPath(PATHS.lessons), build.missingStrokes),
    // Bài đang lỗi thì build chưa ra output đúng: chỉ báo lỗi gốc, không báo lệch output.
    ...(build.lessonIssues.some((issue) => issue.level === 'error')
      ? []
      : [
          outputInSyncCheck(
            repoPath(PATHS.contentOut),
            diffOutput(PATHS.contentOut, build.files),
          ),
        ]),
  ];
}

async function main(): Promise<void> {
  const checks = buildChecks();
  const report = await runChecks(checks);

  for (const issue of report.issues) {
    process.stdout.write(`${formatIssue(issue)}\n`);
  }
  process.stdout.write(
    `content:check — ${checks.length} check, ${report.errorCount} lỗi, ` +
      `${report.warningCount} cảnh báo\n`,
  );
  process.exitCode = exitCodeOf(report);
}

await main();
