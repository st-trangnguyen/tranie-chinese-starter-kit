/**
 * Cắt LXGW WenKai chỉ giữ chữ Hán có trong nội dung + giao diện (spec §7.1).
 * Chạy: `pnpm --filter @csk/content font:subset` — sau `content-build`.
 * Font gốc không nằm trong git: lần đầu chạy sẽ tải bản ghim trong WENKAI_SOURCE (cần mạng)
 * và kiểm tra SHA-256.
 */
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import subsetFont from 'subset-font';

import { collectHanzi } from './collectHanzi';
import { downloadBuffer, ensureSourceFont, WENKAI_SOURCE } from './sourceFont';
import { UI_HANZI } from './uiHanzi';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const SOURCE_FONT = join(ROOT, 'content/data-raw/fonts/LXGWWenKai-Regular.ttf');
const CONTENT_DIR = join(ROOT, 'apps/web/src/assets/content');
const OUTPUT_FONT = join(
  ROOT,
  'apps/web/src/assets/fonts/lxgw-wenkai.subset.woff2',
);

function readContentJson(dir: string): unknown[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .map((name): unknown => JSON.parse(readFileSync(join(dir, name), 'utf8')));
}

async function main(): Promise<void> {
  await ensureSourceFont({
    path: SOURCE_FONT,
    sha256: WENKAI_SOURCE.sha256,
    download: () => {
      process.stdout.write(
        `font:subset — tải font gốc từ ${WENKAI_SOURCE.url}\n`,
      );
      return downloadBuffer(WENKAI_SOURCE.url);
    },
  });

  const text = collectHanzi([UI_HANZI, ...readContentJson(CONTENT_DIR)]);
  const font = await subsetFont(readFileSync(SOURCE_FONT), text, {
    targetFormat: 'woff2',
  });

  mkdirSync(dirname(OUTPUT_FONT), { recursive: true });
  writeFileSync(OUTPUT_FONT, font);

  const sizeKb = statSync(OUTPUT_FONT).size / 1024;
  process.stdout.write(
    `font:subset — ${[...text].length} chữ → ${OUTPUT_FONT} (${sizeKb.toFixed(0)} KB)\n`,
  );
}

await main();
