import { describe, expect, it } from 'vitest';

import {
  PROGRESS_BACKUP_FORMAT,
  PROGRESS_BACKUP_FORMAT_VERSION,
  progressBackupEnvelopeSchema,
  progressBackupV1Schema,
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

/** File v1 hợp lệ: bài 2, bài 3 đã xong, đủ bốn field cài đặt. */
const buildValidV1File = (): Record<string, unknown> => ({
  format: PROGRESS_BACKUP_FORMAT,
  formatVersion: PROGRESS_BACKUP_FORMAT_VERSION,
  exportedOn: '2026-11-17',
  settings: {
    dailyGoalMinutes: 30,
    hasCompletedOnboarding: true,
    defaultAudioSpeed: 'slow',
    isPinyinVisible: false,
  },
  lessonProgress: [
    { lessonId: 'intro-02', status: 'completed' },
    { lessonId: 'intro-03', status: 'completed' },
  ],
  dailyStats: [{ date: '2026-11-17', studySeconds: 720, goalMinutes: 15 }],
});

const SETTINGS_WITHOUT_PINYIN = {
  dailyGoalMinutes: 30,
  hasCompletedOnboarding: true,
  defaultAudioSpeed: 'slow',
};

describe('progressBackupV1Schema', () => {
  it.each<[string, (file: Record<string, unknown>) => Record<string, unknown>]>(
    [
      [
        'bài 4 có trạng thái không tồn tại',
        (file) => ({
          ...file,
          lessonProgress: [
            { lessonId: 'intro-02', status: 'completed' },
            { lessonId: 'intro-03', status: 'completed' },
            { lessonId: 'intro-04', status: 'skipped' },
          ],
        }),
      ],
      [
        'cursor âm',
        (file) => ({
          ...file,
          lessonProgress: [
            { lessonId: 'intro-03', status: 'in-progress', cursor: -1 },
          ],
        }),
      ],
      [
        'studySeconds âm',
        (file) => ({
          ...file,
          dailyStats: [{ date: '2026-11-17', studySeconds: -5 }],
        }),
      ],
      [
        'goalMinutes 45 trong dailyStats',
        (file) => ({
          ...file,
          dailyStats: [
            { date: '2026-11-17', studySeconds: 720, goalMinutes: 45 },
          ],
        }),
      ],
      [
        'defaultAudioSpeed không có trong lựa chọn',
        (file) => ({
          ...file,
          settings: {
            ...SETTINGS_WITHOUT_PINYIN,
            defaultAudioSpeed: 'fast',
            isPinyinVisible: true,
          },
        }),
      ],
      [
        'thiếu isPinyinVisible',
        (file) => ({ ...file, settings: SETTINGS_WITHOUT_PINYIN }),
      ],
      [
        'trùng lessonId',
        (file) => ({
          ...file,
          lessonProgress: [
            { lessonId: 'intro-02', status: 'completed' },
            { lessonId: 'intro-02', status: 'in-progress', cursor: 1 },
          ],
        }),
      ],
      [
        'trùng date',
        (file) => ({
          ...file,
          dailyStats: [
            { date: '2026-11-17', studySeconds: 720 },
            { date: '2026-11-17', studySeconds: 60 },
          ],
        }),
      ],
      [
        'exportedOn không phải ngày có thật',
        (file) => ({ ...file, exportedOn: '2026-13-45' }),
      ],
      [
        'thiếu settings',
        (file) =>
          Object.fromEntries(
            Object.entries(file).filter(([key]) => key !== 'settings'),
          ),
      ],
    ],
  )(
    'S8.5-AC2 File có một phần dữ liệu sai bị từ chối cả file: %s',
    (_label, corrupt) => {
      const result = progressBackupV1Schema.safeParse(
        corrupt(buildValidV1File()),
      );

      expect(result.success).toBe(false);
    },
  );

  it(
    'S8.5-AC2 File có một phần dữ liệu sai bị từ chối cả file: ' +
      'file v1 đủ hợp lệ (cả bài lạ, ngày không có goalMinutes) thì qua',
    () => {
      const file = {
        ...buildValidV1File(),
        lessonProgress: [
          { lessonId: 'intro-02', status: 'completed' },
          { lessonId: 'khong-co-bai-nay', status: 'completed' },
          { lessonId: 'intro-03', status: 'in-progress', cursor: 3 },
        ],
        dailyStats: [
          { date: '2026-11-16', studySeconds: 300 },
          { date: '2026-11-17', studySeconds: 720, goalMinutes: 15 },
        ],
      };

      expect(progressBackupV1Schema.safeParse(file).success).toBe(true);
    },
  );
});
