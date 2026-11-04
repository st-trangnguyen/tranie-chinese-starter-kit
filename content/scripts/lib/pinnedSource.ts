import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { downloadBuffer } from '../font-subset/sourceFont';

/** Một file nguồn mở ghim theo commit, kiểm bằng SHA-256. */
export interface PinnedSource {
  readonly name: string;
  readonly url: string;
  readonly sha256: string;
  readonly license: string;
}

export const sha256Of = (bytes: Buffer): string =>
  createHash('sha256').update(bytes).digest('hex');

/**
 * Đọc file nguồn từ cache; thiếu hoặc sai checksum thì tải lại. Bản tải về sai checksum thì
 * throw và không ghi gì (nguồn đã đổi — cần ghim lại phiên bản).
 */
export async function loadPinnedSource(
  source: PinnedSource,
  cacheDir: string,
): Promise<string> {
  const path = join(cacheDir, source.name);
  if (existsSync(path)) {
    const cached = readFileSync(path);
    if (sha256Of(cached) === source.sha256) {
      return cached.toString('utf8');
    }
  }
  process.stdout.write(`content:fetch — tải ${source.url}\n`);
  const bytes = await downloadBuffer(source.url);
  const actual = sha256Of(bytes);
  if (actual !== source.sha256) {
    throw new Error(
      `${source.name} tải về có SHA-256 ${actual}, cần ${source.sha256}. ` +
        'Không ghi file; kiểm tra lại URL hoặc ghim phiên bản mới.',
    );
  }
  mkdirSync(cacheDir, { recursive: true });
  writeFileSync(path, bytes);
  return bytes.toString('utf8');
}
