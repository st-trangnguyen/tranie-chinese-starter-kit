/**
 * `pnpm --filter @csk/content content:build` — ghép danh sách HSK, nghĩa tiếng Việt, bài YAML
 * và lộ trình thành JSON trong `apps/web/src/assets/content/` (kèm dữ liệu nét chữ).
 * Không tạo mp3: chạy `content:audio` sau (cần mạng). Có lỗi nội dung thì không ghi gì.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { assembleContent } from './assemble';
import { readBuildInputs } from './inputs';
import { diffOutput } from './output';
import { formatIssue } from '../content-check/checkRunner';
import { PATHS, repoPath } from '../lib/paths';

function main(): void {
  const result = assembleContent(readBuildInputs());
  const errors = result.lessonIssues.filter((i) => i.level === 'error');
  result.lessonIssues.forEach((issue) =>
    process.stdout.write(`${formatIssue(issue)}\n`),
  );
  if (errors.length > 0) {
    process.stdout.write(
      `content:build — ${errors.length} lỗi, không ghi output\n`,
    );
    process.exitCode = 1;
    return;
  }

  const { extra } = diffOutput(PATHS.contentOut, result.files);
  extra.forEach((name) => rmSync(join(PATHS.contentOut, name)));
  result.files.forEach((content, name) => {
    const file = join(PATHS.contentOut, name);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
  });

  process.stdout.write(
    `content:build — ${result.files.size} file → ${repoPath(PATHS.contentOut)} ` +
      `(xoá ${extra.length} file cũ), ${result.audioJobs.length} audio cần có\n`,
  );
}

main();
