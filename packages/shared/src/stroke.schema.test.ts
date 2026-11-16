import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  hanCharacterSchema,
  strokeDataSchema,
  strokeIndexSchema,
} from './stroke.schema';

const REN_PATH = fileURLToPath(
  new URL(
    '../../../apps/web/src/assets/content/strokes/人.json',
    import.meta.url,
  ),
);

function readRen(): unknown {
  return JSON.parse(readFileSync(REN_PATH, 'utf8'));
}

const VALID_STROKE_DATA = {
  strokes: ['M 0 0 L 10 10 Z', 'M 10 10 L 20 20 Z'],
  medians: [
    [
      [0, 0],
      [10, 10],
    ],
    [
      [10, 10],
      [20, 20],
    ],
  ],
};

describe('hanCharacterSchema (S6.1-AC1 nền)', () => {
  it.each(['人', '𠀀'])('S6.1-AC1: chấp nhận đúng một chữ Hán %j', (input) => {
    expect(hanCharacterSchema.safeParse(input).success).toBe(true);
  });

  it.each(['', 'a', 'abc', '你好', '人 '])('S6.1-AC1: từ chối %j', (input) => {
    expect(hanCharacterSchema.safeParse(input).success).toBe(false);
  });
});

describe('strokeDataSchema (S6.1-AC1 nền: dữ liệu nét hỏng hoặc sai cấu trúc)', () => {
  it('S6.1-AC1: chấp nhận dữ liệu thật của 人.json', () => {
    const result = strokeDataSchema.safeParse(readRen());
    expect(result.success).toBe(true);
    expect(result.data?.strokes).toHaveLength(2);
  });

  it('S6.1-AC1: chấp nhận dữ liệu tối thiểu hợp lệ', () => {
    expect(strokeDataSchema.safeParse(VALID_STROKE_DATA).success).toBe(true);
  });

  it('S6.1-AC1: từ chối khi thiếu strokes', () => {
    const { medians } = VALID_STROKE_DATA;
    expect(strokeDataSchema.safeParse({ medians }).success).toBe(false);
  });

  it('S6.1-AC1: từ chối khi strokes rỗng', () => {
    expect(
      strokeDataSchema.safeParse({ strokes: [], medians: [] }).success,
    ).toBe(false);
  });

  it('S6.1-AC1: từ chối khi số medians lệch số nét', () => {
    const data = {
      ...VALID_STROKE_DATA,
      medians: VALID_STROKE_DATA.medians.slice(0, 1),
    };
    expect(strokeDataSchema.safeParse(data).success).toBe(false);
  });

  it.each([
    ['ba số', [[0, 0, 0]]],
    ['một số', [[0]]],
    ['chuỗi', [['0', '0']]],
  ])(
    'S6.1-AC1: từ chối điểm median không phải cặp số (%s)',
    (_label, badMedian) => {
      const data = {
        ...VALID_STROKE_DATA,
        medians: [badMedian, VALID_STROKE_DATA.medians[1]],
      };
      expect(strokeDataSchema.safeParse(data).success).toBe(false);
    },
  );
});

describe('strokeIndexSchema (S6.1-AC1 nền)', () => {
  it('S6.1-AC1: chấp nhận danh sách chữ Hán không trùng', () => {
    expect(strokeIndexSchema.safeParse(['人', '你', '好', '𠀀']).success).toBe(
      true,
    );
  });

  it('S6.1-AC1: từ chối phần tử nhiều ký tự', () => {
    expect(strokeIndexSchema.safeParse(['人', '你好']).success).toBe(false);
  });

  it('S6.1-AC1: từ chối phần tử không phải chữ Hán', () => {
    expect(strokeIndexSchema.safeParse(['人', 'a']).success).toBe(false);
  });

  it('S6.1-AC1: từ chối phần tử trùng', () => {
    expect(strokeIndexSchema.safeParse(['人', '你', '人']).success).toBe(false);
  });
});
