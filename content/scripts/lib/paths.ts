import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Gốc repo; mọi đường dẫn của pipeline tính từ đây. */
export const ROOT = fileURLToPath(new URL('../../../', import.meta.url));

export const PATHS = {
  /** Bản đã lọc của nguồn mở — commit vào git. */
  hskWords: join(ROOT, 'content/data-raw/hsk1.words.json'),
  cvdict: join(ROOT, 'content/data-raw/cvdict.hsk1.json'),
  /** File gốc tải về (lớn) — gitignore. */
  sourceCache: join(ROOT, 'content/data-raw/.cache'),
  /** Phần người soạn sửa tay. */
  authored: join(ROOT, 'content/authored'),
  viMeanings: join(ROOT, 'content/authored/vi-meanings.yaml'),
  ttsOverrides: join(ROOT, 'content/authored/tts-overrides.yaml'),
  path: join(ROOT, 'content/authored/path.yaml'),
  lessons: join(ROOT, 'content/authored/lessons'),
  /** Output app dùng. */
  assets: join(ROOT, 'apps/web/src/assets'),
  contentOut: join(ROOT, 'apps/web/src/assets/content'),
  audioOut: join(ROOT, 'apps/web/src/assets/audio'),
  strokesOut: join(ROOT, 'apps/web/src/assets/content/strokes'),
} as const;

/** Đường dẫn tương đối từ gốc repo, để in ra terminal bấm mở được. */
export const repoPath = (absolute: string): string => relative(ROOT, absolute);
