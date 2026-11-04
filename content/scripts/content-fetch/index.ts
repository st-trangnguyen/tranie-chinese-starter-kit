/**
 * `pnpm --filter @csk/content content:fetch` — tải nguồn mở đã ghim (cần mạng lần đầu), lọc
 * phần dùng cho HSK 1 vào `content/data-raw/*.json` (commit) và thêm từ còn thiếu vào
 * `content/authored/vi-meanings.yaml`. File gốc lưu ở `content/data-raw/.cache/` (gitignore).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { matchCvdictWithErhua, parseCvdict, withoutErhua } from './cvdict';
import { parseHskList } from './hskList';
import { CVDICT, HSK1_LIST, HSK1_MEANINGS } from './sources';
import { mergeViMeanings } from './viMeanings';
import { PATHS, repoPath } from '../lib/paths';
import { loadPinnedSource } from '../lib/pinnedSource';

const writeJson = (path: string, value: unknown): void => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
};

async function main(): Promise<void> {
  const [listText, meaningTsv, cvdictText] = await Promise.all(
    [HSK1_LIST, HSK1_MEANINGS, CVDICT].map((source) =>
      loadPinnedSource(source, PATHS.sourceCache),
    ),
  );

  const words = parseHskList(listText, meaningTsv);
  writeJson(PATHS.hskWords, words);

  const lookup = words.flatMap((word) => [
    word.hanzi,
    withoutErhua(word)?.hanzi ?? word.hanzi,
  ]);
  const cvdict = parseCvdict(cvdictText, new Set(lookup));
  const matches = new Map(
    words.map((word) => [word.id, matchCvdictWithErhua(word, cvdict)] as const),
  );
  writeJson(PATHS.cvdict, Object.fromEntries(matches));

  const existing = existsSync(PATHS.viMeanings)
    ? readFileSync(PATHS.viMeanings, 'utf8')
    : '';
  mkdirSync(dirname(PATHS.viMeanings), { recursive: true });
  writeFileSync(PATHS.viMeanings, mergeViMeanings(existing, words, matches));

  const unmatched = [...matches].filter(([, match]) => !match?.vi.length);
  process.stdout.write(
    `content:fetch — ${words.length} từ → ${repoPath(PATHS.hskWords)}; ` +
      `${unmatched.length} từ không có nghĩa CVDICT → điền tay trong ` +
      `${repoPath(PATHS.viMeanings)}\n`,
  );
}

await main();
