import { describe, expect, it } from 'vitest';

import {
  PROGRESS_BACKUP_FORMAT,
  PROGRESS_BACKUP_FORMAT_VERSION,
} from '@csk/shared';

import { BackupService } from './backup.service';

/** Tám byte đầu của mọi file PNG, cộng phần đầu khối IHDR. */
const PNG_BYTES = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49,
  0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06,
]);

/** Ảnh PNG đọc thành chữ, như `File.text()` trả về khi người học chọn một file ảnh. */
const PNG_AS_TEXT = new TextDecoder().decode(PNG_BYTES);

describe('BackupService.checkBackupText — file không phải JSON', () => {
  it.each([
    ['chữ thường', 'abc'],
    ['JSON dở dang', '{'],
    ['ảnh PNG đọc thành chữ', PNG_AS_TEXT],
  ])(
    'S8.5-AC2 File không phải JSON bị từ chối: %s → not-backup',
    (_label, text) => {
      const service = new BackupService();

      expect(service.checkBackupText(text)).toEqual({
        status: 'rejected',
        reason: 'not-backup',
      });
    },
  );
});

describe('BackupService.checkBackupText — file rỗng', () => {
  it.each([
    ['chuỗi rỗng', ''],
    ['chỉ có khoảng trắng và xuống dòng', '   \n'],
  ])('S8.5-AC2 File rỗng bị từ chối: %s → not-backup', (_label, text) => {
    const service = new BackupService();

    expect(service.checkBackupText(text)).toEqual({
      status: 'rejected',
      reason: 'not-backup',
    });
  });
});

describe('BackupService.checkBackupText — file JSON của nơi khác', () => {
  it.each([
    ['object của nơi khác', '{"name":"abc"}'],
    ['mảng rỗng', '[]'],
    ['null', 'null'],
    ['số', '42'],
    [
      'format sai chữ',
      JSON.stringify({
        format: 'tranie-chinese-progres',
        formatVersion: PROGRESS_BACKUP_FORMAT_VERSION,
      }),
    ],
    ['thiếu formatVersion', JSON.stringify({ format: PROGRESS_BACKUP_FORMAT })],
  ])(
    'S8.5-AC2 File JSON của nơi khác bị từ chối: %s → not-backup',
    (_label, text) => {
      const service = new BackupService();

      expect(service.checkBackupText(text)).toEqual({
        status: 'rejected',
        reason: 'not-backup',
      });
    },
  );
});
