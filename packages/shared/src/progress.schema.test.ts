import { describe, expect, it } from 'vitest';

import {
  DAILY_GOAL_OPTIONS,
  DEFAULT_SETTINGS,
  dailyStatSchema,
  lessonProgressSchema,
  parseSettings,
} from './progress.schema';

describe('parseSettings', () => {
  it('returns the defaults for an empty record', () => {
    expect(parseSettings({})).toEqual(DEFAULT_SETTINGS);
  });

  it('keeps valid stored values', () => {
    expect(
      parseSettings({ dailyGoalMinutes: 60, hasCompletedOnboarding: true }),
    ).toEqual({ dailyGoalMinutes: 60, hasCompletedOnboarding: true });
  });

  it('falls back per field when a stored value is invalid', () => {
    expect(
      parseSettings({ dailyGoalMinutes: 45, hasCompletedOnboarding: true }),
    ).toEqual({ ...DEFAULT_SETTINGS, hasCompletedOnboarding: true });
  });

  it('ignores unknown keys and non-object input', () => {
    expect(parseSettings({ legacy: 1 })).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
  });

  it('offers exactly 15, 30 and 60 minutes', () => {
    expect(DAILY_GOAL_OPTIONS).toEqual([15, 30, 60]);
  });
});

describe('lessonProgressSchema', () => {
  it('should accept a completed or in-progress lesson', () => {
    expect(
      lessonProgressSchema.parse({ lessonId: 'intro-01', status: 'completed' }),
    ).toEqual({ lessonId: 'intro-01', status: 'completed' });
    expect(
      lessonProgressSchema.safeParse({
        lessonId: 'intro-02',
        status: 'in-progress',
      }).success,
    ).toBe(true);
  });

  it('should reject an unknown status', () => {
    expect(
      lessonProgressSchema.safeParse({ lessonId: 'intro-01', status: 'done' })
        .success,
    ).toBe(false);
  });

  it('should reject a missing or empty lessonId', () => {
    expect(
      lessonProgressSchema.safeParse({ status: 'completed' }).success,
    ).toBe(false);
    expect(
      lessonProgressSchema.safeParse({ lessonId: ' ', status: 'completed' })
        .success,
    ).toBe(false);
  });

  it('S3.3-AC2: should keep a valid cursor on the row', () => {
    expect(
      lessonProgressSchema.parse({
        lessonId: 'intro-01',
        status: 'in-progress',
        cursor: 3,
      }),
    ).toEqual({ lessonId: 'intro-01', status: 'in-progress', cursor: 3 });
    expect(
      lessonProgressSchema.parse({
        lessonId: 'intro-01',
        status: 'in-progress',
        cursor: 0,
      }).cursor,
    ).toBe(0);
  });

  it.each([
    ['negative', -1],
    ['non-integer', 1.5],
    ['string', '2'],
    ['null', null],
    ['object', { index: 2 }],
  ])(
    'S3.3-AC2: should drop a %s cursor but keep the row valid',
    (_label, cursor) => {
      const result = lessonProgressSchema.safeParse({
        lessonId: 'intro-01',
        status: 'in-progress',
        cursor,
      });

      expect(result.success).toBe(true);
      expect(result.data?.lessonId).toBe('intro-01');
      expect(result.data?.status).toBe('in-progress');
      expect(result.data?.cursor).toBeUndefined();
    },
  );

  it('S3.3-X2: should keep a completed status when its cursor is corrupt', () => {
    const result = lessonProgressSchema.safeParse({
      lessonId: 'intro-01',
      status: 'completed',
      cursor: -4,
    });

    expect(result.success).toBe(true);
    expect(result.data?.status).toBe('completed');
    expect(result.data?.cursor).toBeUndefined();
  });
});

describe('dailyStatSchema', () => {
  it('S8.1-AC2 Thời gian học đã lưu bị hỏng: nhận dòng hợp lệ, giữ phần lẻ của giây', () => {
    expect(
      dailyStatSchema.safeParse({ date: '2026-11-18', studySeconds: 130.5 })
        .success,
    ).toBe(true);
    expect(
      dailyStatSchema.safeParse({ date: '2026-11-18', studySeconds: 0 })
        .success,
    ).toBe(true);
  });

  it.each<[string, unknown]>([
    ['studySeconds âm', { date: '2026-11-18', studySeconds: -1 }],
    ['studySeconds là chuỗi', { date: '2026-11-18', studySeconds: 'abc' }],
    ['studySeconds là NaN', { date: '2026-11-18', studySeconds: Number.NaN }],
    [
      'studySeconds vô hạn',
      { date: '2026-11-18', studySeconds: Number.POSITIVE_INFINITY },
    ],
    ['thiếu studySeconds', { date: '2026-11-18' }],
    ['ngày sai dạng', { date: '18/11/2026', studySeconds: 60 }],
    ['ngày thiếu số 0', { date: '2026-1-8', studySeconds: 60 }],
  ])('S8.1-AC2 Thời gian học đã lưu bị hỏng: từ chối %s', (_label, row) => {
    expect(dailyStatSchema.safeParse(row).success).toBe(false);
  });
});

describe('dailyStatSchema — goalMinutes (S8.3)', () => {
  const DATE = '2026-11-17';

  it('S8.3-AC1 Ngày đã qua không có mục tiêu đọc được: giữ mục tiêu hợp lệ của ngày', () => {
    expect(
      dailyStatSchema.parse({
        date: DATE,
        studySeconds: 1200,
        goalMinutes: 30,
      }),
    ).toEqual({ date: DATE, studySeconds: 1200, goalMinutes: 30 });
  });

  it.each<[string, unknown]>([
    ['là chuỗi', 'abc'],
    ['ngoài 15/30/60', 45],
    ['là null', null],
  ])(
    'S8.3-AC1 Ngày đã qua không có mục tiêu đọc được: mục tiêu %s thành undefined, dòng vẫn dùng được',
    (_label, goalMinutes) => {
      const result = dailyStatSchema.safeParse({
        date: DATE,
        studySeconds: 1200,
        goalMinutes,
      });

      // `toEqual` coi field `undefined` như không có: không có mục tiêu đọc được.
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ date: DATE, studySeconds: 1200 });
    },
  );

  it('S8.3-AC1 Ngày đã qua không có mục tiêu đọc được: thiếu mục tiêu thì undefined', () => {
    const result = dailyStatSchema.safeParse({
      date: DATE,
      studySeconds: 1200,
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ date: DATE, studySeconds: 1200 });
  });
});
