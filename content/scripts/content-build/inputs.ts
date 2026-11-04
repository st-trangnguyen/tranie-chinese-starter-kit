import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import { z } from 'zod';

import type { BuildInputs } from './assemble';
import type { HskEntry } from '../content-fetch/hskList';
import { ttsOverridesSchema, viMeaningsSchema } from '../lib/authored.schema';
import { PATHS, repoPath } from '../lib/paths';
import { parseYamlFile, type YamlFile } from '../lib/yamlFile';

const hskEntriesSchema = z.array(
  z.object({
    id: z.string(),
    hanzi: z.string(),
    pinyin: z.string(),
    en: z.string(),
  }),
);

const require = createRequire(import.meta.url);
const STROKE_DIR = dirname(require.resolve('hanzi-writer-data/package.json'));

const readYaml = (path: string): YamlFile =>
  parseYamlFile(
    repoPath(path),
    existsSync(path) ? readFileSync(path, 'utf8') : '',
  );

function listYamlFiles(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((name) => /\.ya?ml$/.test(name))
    .toSorted()
    .map((name) => join(dir, name));
}

/** Dữ liệu hanzi-writer của một chữ (S2.5), giữ nguyên chuỗi JSON gốc. */
function strokeData(char: string): string | undefined {
  const file = join(STROKE_DIR, `${char}.json`);
  return existsSync(file) ? readFileSync(file, 'utf8').trim() : undefined;
}

/** Đọc toàn bộ đầu vào của pipeline. Dữ liệu ngoài đều qua zod trước khi dùng. */
export function readBuildInputs(): BuildInputs {
  const hskEntries: HskEntry[] = hskEntriesSchema.parse(
    JSON.parse(readFileSync(PATHS.hskWords, 'utf8')),
  );
  const meanings = viMeaningsSchema.parse(
    readYaml(PATHS.viMeanings).value ?? {},
  );
  const overrides = ttsOverridesSchema.parse(
    readYaml(PATHS.ttsOverrides).value ?? {},
  );
  return {
    hskEntries,
    meanings,
    overrides,
    path: readYaml(PATHS.path),
    lessons: listYamlFiles(PATHS.lessons).map(readYaml),
    strokeData,
  };
}
