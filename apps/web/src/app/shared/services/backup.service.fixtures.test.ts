import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import type { BackupRejectReason } from '@shared/models/progress-backup.model';

import { BackupService } from './backup.service';

/** File mẫu e2e của S8.5 (asset task 1.2, design D10). */
const FIXTURE_DIR = join(
  __dirname,
  '../../../../e2e/E8/fixtures/progress-backup',
);

/** Đọc file mẫu thành chữ, như `File.text()` trả về khi người học chọn file. */
const readFixture = (name: string): string =>
  readFileSync(join(FIXTURE_DIR, name), 'utf8');

describe('File mẫu sao lưu tiến độ (e2e E8) khớp kết quả kiểm tra mong đợi', () => {
  it.each(['hop-le-5-bai.json', 'hop-le-3-bai-15-phut.json', 'bai-la.json'])(
    '%s → valid',
    (name) => {
      const service = new BackupService();

      expect(service.checkBackupText(readFixture(name)).status).toBe('valid');
    },
  );

  it.each<[string, BackupRejectReason]>([
    ['trang-thai-sai.json', 'corrupted'],
    ['muc-tieu-45.json', 'corrupted'],
    ['rong.json', 'not-backup'],
    ['json-noi-khac.json', 'not-backup'],
    ['anh.png', 'not-backup'],
    ['ban-moi-hon.json', 'newer-version'],
  ])('%s → rejected (%s)', (name, reason) => {
    const service = new BackupService();

    expect(service.checkBackupText(readFixture(name))).toEqual({
      status: 'rejected',
      reason,
    });
  });
});
