import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

/** Bản LXGW WenKai được ghim: file gốc (~26 MB) không commit vào git, tải về khi cần. */
export const WENKAI_SOURCE = {
  url: 'https://github.com/lxgw/LxgwWenKai/releases/download/v1.530/LXGWWenKai-Regular.ttf',
  sha256: '2d73eea94ad808999d90c0000c239a84a33b09d4bc6ab6c5b8bbf1eda8a7fc8b',
} as const;

interface EnsureSourceFontOptions {
  readonly path: string;
  readonly sha256: string;
  readonly download: () => Promise<Buffer>;
}

const sha256Of = (bytes: Buffer): string =>
  createHash('sha256').update(bytes).digest('hex');

/**
 * Bảo đảm font gốc có trên đĩa và đúng checksum. Thiếu hoặc hỏng thì tải lại; checksum của bản
 * tải về sai thì throw và không ghi gì.
 */
export async function ensureSourceFont({
  path,
  sha256,
  download,
}: EnsureSourceFontOptions): Promise<void> {
  if (existsSync(path) && sha256Of(readFileSync(path)) === sha256) {
    return;
  }
  const bytes = await download();
  const actual = sha256Of(bytes);
  if (actual !== sha256) {
    throw new Error(
      `Font tải về có SHA-256 ${actual}, cần ${sha256}. Không ghi file; kiểm tra lại URL hoặc phiên bản.`,
    );
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, bytes);
}

/** Tải một URL thành Buffer bằng fetch có sẵn trong Node 22. */
export async function downloadBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Không tải được ${url}: HTTP ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}
