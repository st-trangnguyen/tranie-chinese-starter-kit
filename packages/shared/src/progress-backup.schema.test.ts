import { describe, expect, it } from 'vitest';

import {
  PROGRESS_BACKUP_FORMAT,
  PROGRESS_BACKUP_FORMAT_VERSION,
  progressBackupEnvelopeSchema,
} from './progress-backup.schema';

describe('progressBackupEnvelopeSchema', () => {
  it.each<[string, unknown]>([
    ['object của nơi khác', { name: 'abc' }],
    ['mảng rỗng', []],
    ['null', null],
    ['số', 42],
    [
      'format sai chữ',
      {
        format: 'tranie-chinese-progres',
        formatVersion: PROGRESS_BACKUP_FORMAT_VERSION,
      },
    ],
    ['thiếu formatVersion', { format: PROGRESS_BACKUP_FORMAT }],
  ])('S8.5-AC2 File JSON của nơi khác bị từ chối: %s', (_label, value) => {
    expect(progressBackupEnvelopeSchema.safeParse(value).success).toBe(false);
  });

  it('S8.5-AC2 File JSON của nơi khác bị từ chối: vỏ đúng dấu nhận của app thì qua', () => {
    const result = progressBackupEnvelopeSchema.safeParse({
      format: PROGRESS_BACKUP_FORMAT,
      formatVersion: PROGRESS_BACKUP_FORMAT_VERSION,
    });

    expect(result.success).toBe(true);
  });
});
