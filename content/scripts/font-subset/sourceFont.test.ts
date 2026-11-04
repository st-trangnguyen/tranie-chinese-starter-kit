import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { ensureSourceFont } from './sourceFont';

const BYTES = Buffer.from('fake font bytes');
const SHA256 = createHash('sha256').update(BYTES).digest('hex');

function tempFontPath(): string {
  return join(mkdtempSync(join(tmpdir(), 'csk-font-')), 'nested', 'Font.ttf');
}

describe('ensureSourceFont', () => {
  it('should not download when the font is already on disk', async () => {
    const path = tempFontPath();
    await ensureSourceFont({
      path,
      sha256: SHA256,
      download: async () => BYTES,
    });
    let calls = 0;

    await ensureSourceFont({
      path,
      sha256: SHA256,
      download: async () => {
        calls += 1;
        return BYTES;
      },
    });

    expect(calls).toBe(0);
  });

  it('should download and write the font when it is missing', async () => {
    const path = tempFontPath();

    await ensureSourceFont({
      path,
      sha256: SHA256,
      download: async () => BYTES,
    });

    expect(readFileSync(path)).toEqual(BYTES);
  });

  it('should throw and write nothing when the checksum does not match', async () => {
    const path = tempFontPath();

    await expect(
      ensureSourceFont({
        path,
        sha256: SHA256,
        download: async () => Buffer.from('tampered'),
      }),
    ).rejects.toThrow(/SHA-256/);
    expect(existsSync(path)).toBe(false);
  });

  it('should re-download when the file on disk is corrupted', async () => {
    const path = tempFontPath();
    await ensureSourceFont({
      path,
      sha256: SHA256,
      download: async () => BYTES,
    });
    writeFileSync(path, 'truncated');

    await ensureSourceFont({
      path,
      sha256: SHA256,
      download: async () => BYTES,
    });

    expect(readFileSync(path)).toEqual(BYTES);
  });
});
