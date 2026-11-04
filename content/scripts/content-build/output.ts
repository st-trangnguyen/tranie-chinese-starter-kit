import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** File pipeline sinh ra trong `assets/content/` (bỏ `.gitkeep`), đường dẫn tương đối. */
export function listGeneratedFiles(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((name) => name.endsWith('.json'))
    .map((name) => name.split('\\').join('/'))
    .toSorted();
}

export interface OutputDiff {
  /** Thiếu hoặc khác nội dung so với kết quả build. */
  stale: string[];
  /** Có trên đĩa nhưng build không sinh ra. */
  extra: string[];
}

/** So file đang có với kết quả build để biết có cần chạy lại `content:build` không. */
export function diffOutput(
  dir: string,
  expected: ReadonlyMap<string, string>,
): OutputDiff {
  const actual = listGeneratedFiles(dir);
  const stale = [...expected].flatMap(([name, content]) => {
    const file = join(dir, name);
    return existsSync(file) && readFileSync(file, 'utf8') === content
      ? []
      : [name];
  });
  return { stale, extra: actual.filter((name) => !expected.has(name)) };
}
