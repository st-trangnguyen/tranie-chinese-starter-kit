import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { BackupService } from './backup.service';

/** File mẫu e2e của S9.1 (asset task 8.1, design D10). */
const FIXTURE_DIR = join(
  __dirname,
  '../../../../e2e/E9/fixtures/progress-backup',
);

/** Đọc file mẫu thành chữ, như `File.text()` trả về khi người học chọn file. */
const readFixture = (name: string): string =>
  readFileSync(join(FIXTURE_DIR, name), 'utf8');

describe('File mẫu sao lưu tiến độ (e2e E9) khớp kết quả kiểm tra mong đợi', () => {
  it.each([
    'the-nihao.json',
    'the-tu-la.json',
    'chu-la.json',
    'chu-khong-net.json',
    'ban-truoc-s9-1.json',
  ])('%s → valid', (name) => {
    const service = new BackupService();

    expect(service.checkBackupText(readFixture(name)).status).toBe('valid');
  });

  it.each(['the-sai-chieu.json', 'the-trung.json', 'chu-trung.json'])(
    '%s → rejected (corrupted)',
    (name) => {
      const service = new BackupService();

      expect(service.checkBackupText(readFixture(name))).toEqual({
        status: 'rejected',
        reason: 'corrupted',
      });
    },
  );
});
