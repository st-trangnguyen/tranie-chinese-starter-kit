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

describe('BackupService.checkBackupText — file từ phiên bản app mới hơn', () => {
  it.each([
    [
      'phiên bản kế tiếp, thân không đọc được',
      PROGRESS_BACKUP_FORMAT_VERSION + 1,
    ],
    ['phiên bản lẻ lớn hơn 1', 1.5],
  ])(
    'S8.5-AC2 File từ phiên bản app mới hơn bị từ chối: %s → newer-version',
    (_label, formatVersion) => {
      const service = new BackupService();
      const text = JSON.stringify({
        format: PROGRESS_BACKUP_FORMAT,
        formatVersion,
        settings: 'rác',
      });

      expect(service.checkBackupText(text)).toEqual({
        status: 'rejected',
        reason: 'newer-version',
      });
    },
  );

  it(
    'S8.5-AC2 File từ phiên bản app mới hơn bị từ chối: ' +
      'phiên bản hiện tại thân rác → không phải newer-version',
    () => {
      const service = new BackupService();
      const text = JSON.stringify({
        format: PROGRESS_BACKUP_FORMAT,
        formatVersion: PROGRESS_BACKUP_FORMAT_VERSION,
        settings: 'rác',
      });

      expect(service.checkBackupText(text)).not.toEqual({
        status: 'rejected',
        reason: 'newer-version',
      });
    },
  );
});
