import { describe, expect, it } from 'vitest';

import { INTRO_STAGE_ID, audioIndexSchema } from './audio-index.schema';

const A = 'audio/0123456789abcdef.mp3';
const B = 'audio/fedcba9876543210.mp3';
const C = 'audio/00000000000000aa.mp3';

const VALID_INDEX = {
  units: {
    'hsk1-family': [A, B],
    'intro-strokes': [],
  },
  bytes: {
    [A]: 1_048_576,
    [B]: 0,
    [C]: 2048,
  },
  precached: [C],
};

const withBytes = (bytes: Record<string, unknown>): unknown => ({
  ...VALID_INDEX,
  bytes: { ...VALID_INDEX.bytes, ...bytes },
});

describe('audioIndexSchema', () => {
  const SCENARIO = 'S8.4-AC1 Chủ đề chưa tải có nút tải kèm dung lượng';

  it(`${SCENARIO}: nhận index hợp lệ (2 nhóm, 1 nhóm rỗng, precached có trong bytes)`, () => {
    const result = audioIndexSchema.safeParse(VALID_INDEX);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(VALID_INDEX);
  });

  it(`${SCENARIO}: từ chối số byte âm`, () => {
    expect(audioIndexSchema.safeParse(withBytes({ [A]: -1 })).success).toBe(
      false,
    );
  });

  it(`${SCENARIO}: từ chối số byte không nguyên`, () => {
    expect(audioIndexSchema.safeParse(withBytes({ [A]: 10.5 })).success).toBe(
      false,
    );
  });

  it(`${SCENARIO}: từ chối số byte dạng chuỗi`, () => {
    expect(audioIndexSchema.safeParse(withBytes({ [A]: '1024' })).success).toBe(
      false,
    );
  });

  it(`${SCENARIO}: từ chối path không dạng audio/<16 hex>.mp3`, () => {
    const badPaths = [
      'audio/0123456789ABCDEF.mp3',
      'audio/0123456789abcde.mp3',
      'audio/0123456789abcdef.wav',
      '/audio/0123456789abcdef.mp3',
      'sounds/0123456789abcdef.mp3',
    ];

    for (const bad of badPaths) {
      const inUnits = {
        ...VALID_INDEX,
        units: { 'hsk1-family': [bad] },
        bytes: { ...VALID_INDEX.bytes, [bad]: 10 },
      };
      const inBytes = withBytes({ [bad]: 10 });
      const inPrecached = {
        ...VALID_INDEX,
        bytes: { ...VALID_INDEX.bytes, [bad]: 10 },
        precached: [bad],
      };

      expect(audioIndexSchema.safeParse(inUnits).success, `units: ${bad}`).toBe(
        false,
      );
      expect(audioIndexSchema.safeParse(inBytes).success, `bytes: ${bad}`).toBe(
        false,
      );
      expect(
        audioIndexSchema.safeParse(inPrecached).success,
        `precached: ${bad}`,
      ).toBe(false);
    }
  });

  it(`${SCENARIO}: từ chối path trong units thiếu trong bytes`, () => {
    const index = {
      ...VALID_INDEX,
      units: {
        ...VALID_INDEX.units,
        'hsk1-food': ['audio/1111111111111111.mp3'],
      },
    };

    expect(audioIndexSchema.safeParse(index).success).toBe(false);
  });

  it(`${SCENARIO}: từ chối path trong precached thiếu trong bytes`, () => {
    const index = {
      ...VALID_INDEX,
      precached: [C, 'audio/2222222222222222.mp3'],
    };

    expect(audioIndexSchema.safeParse(index).success).toBe(false);
  });

  it(`${SCENARIO}: giai đoạn Nhập môn có id "intro"`, () => {
    expect(INTRO_STAGE_ID).toBe('intro');
  });
});
