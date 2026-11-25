import { describe, expect, it } from 'vitest';

import {
  PROGRESS_BACKUP_FORMAT,
  PROGRESS_BACKUP_FORMAT_VERSION,
  progressBackupEnvelopeSchema,
  progressBackupV1Schema,
  progressBackupV2Schema,
} from './progress-backup.schema';
import { parseSettings } from './progress.schema';

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
  formatVersion: 1,
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

describe('progressBackupV1Schema — mục tiêu phút trong cài đặt', () => {
  it.each<[string, unknown]>([
    ['45 phút', 45],
    ['0 phút', 0],
    ['chữ "30"', '30'],
  ])(
    'S8.5-AC2 File có mục tiêu phút không hợp lệ bị từ chối: settings.dailyGoalMinutes %s',
    (_label, dailyGoalMinutes) => {
      const file = buildValidV1File();
      const result = progressBackupV1Schema.safeParse({
        ...file,
        settings: {
          dailyGoalMinutes,
          hasCompletedOnboarding: true,
          defaultAudioSpeed: 'slow',
          isPinyinVisible: false,
        },
      });

      expect(result.success).toBe(false);
    },
  );

  it(
    'S8.5-AC2 File có mục tiêu phút không hợp lệ bị từ chối: ' +
      'đọc cài đặt từ DB vẫn khoan dung, 45 thành 15',
    () => {
      expect(parseSettings({ dailyGoalMinutes: 45 }).dailyGoalMinutes).toBe(15);
    },
  );
});

const SCENARIO_BAD_CARD =
  'S9.1-AC1 (bổ sung) File có thẻ sai bị từ chối cả file';

/** Thẻ "mới" hợp lệ (design D2). */
const buildNewCard = (
  wordId: string,
  facet: string,
): Record<string, unknown> => ({
  wordId,
  facet,
  state: 'new',
  due: Date.UTC(2026, 10, 23, 2),
  stability: 0,
  difficulty: 0,
  elapsedDays: 0,
  scheduledDays: 0,
  learningSteps: 0,
  reps: 0,
  lapses: 0,
});

/** File v2 hợp lệ: bài 2 đã xong, thẻ 你好 chiều nghĩa và nghe, chữ 你 đã viết. */
const buildValidV2File = (
  cards: readonly Record<string, unknown>[] = [
    buildNewCard('你好', 'meaning'),
    buildNewCard('你好', 'listening'),
  ],
): Record<string, unknown> => ({
  ...buildValidV1File(),
  formatVersion: 2,
  cards,
  writtenCharacters: ['你'],
});

const withoutDue = (card: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(card).filter(([key]) => key !== 'due'));

describe('progressBackupV2Schema — thẻ ôn tập trong file', () => {
  it(`${SCENARIO_BAD_CARD}: file v2 đủ hợp lệ thì qua, giữ thẻ và chữ đã viết`, () => {
    const result = progressBackupV2Schema.safeParse(buildValidV2File());

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      formatVersion: 2,
      cards: [
        buildNewCard('你好', 'meaning'),
        buildNewCard('你好', 'listening'),
      ],
      writtenCharacters: ['你'],
    });
  });

  it.each<[string, Record<string, unknown>]>([
    ['một thẻ có chiều "speaking"', buildNewCard('你好', 'speaking')],
    ['một thẻ thiếu due', withoutDue(buildNewCard('你好', 'listening'))],
  ])(`${SCENARIO_BAD_CARD}: %s → cả file bị từ chối`, (_label, badCard) => {
    const goodCard = buildNewCard('你好', 'meaning');

    expect(
      progressBackupV2Schema.safeParse(buildValidV2File([goodCard])).success,
    ).toBe(true);
    expect(
      progressBackupV2Schema.safeParse(buildValidV2File([goodCard, badCard]))
        .success,
    ).toBe(false);
  });
});

const SCENARIO_DUPLICATE_CARD =
  'S9.1-AC1 (bổ sung) File có hai thẻ trùng bị từ chối cả file';

describe('progressBackupV2Schema — thẻ trùng trong file', () => {
  it(`${SCENARIO_DUPLICATE_CARD}: hai thẻ 你好 chiều nghĩa (khác state) → cả file bị từ chối`, () => {
    const duplicateCard = {
      ...buildNewCard('你好', 'meaning'),
      state: 'review',
      reps: 1,
    };

    expect(
      progressBackupV2Schema.safeParse(
        buildValidV2File([buildNewCard('你好', 'meaning'), duplicateCard]),
      ).success,
    ).toBe(false);
  });

  it(`${SCENARIO_DUPLICATE_CARD}: 你好 chiều nghĩa và chiều nghe không trùng → qua`, () => {
    expect(
      progressBackupV2Schema.safeParse(
        buildValidV2File([
          buildNewCard('你好', 'meaning'),
          buildNewCard('你好', 'listening'),
        ]),
      ).success,
    ).toBe(true);
  });
});
