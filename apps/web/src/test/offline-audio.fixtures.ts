import type { AudioIndex } from '@csk/shared';

import type { OfflineAudioSnapshot } from '@shared/models/offline-audio.model';

export const HSK_STAGE_ID = 'hsk1';
export const HSK_UNIT_ID = 'hsk1-greetings';

export const AUDIO_A = 'audio/0000000000000001.mp3';
export const AUDIO_B = 'audio/0000000000000002.mp3';
export const AUDIO_C = 'audio/0000000000000003.mp3';
export const AUDIO_D = 'audio/0000000000000004.mp3';
export const AUDIO_E = 'audio/0000000000000005.mp3';
export const AUDIO_INTRO = 'audio/00000000000000ff.mp3';

// Tổng 4 audio của chủ đề HSK = 2 516 582 byte ("2,4 MB").
export const HSK_INDEX: AudioIndex = {
  units: {
    intro1: [AUDIO_INTRO],
    [HSK_UNIT_ID]: [AUDIO_A, AUDIO_B, AUDIO_C, AUDIO_D],
  },
  bytes: {
    [AUDIO_A]: 600_000,
    [AUDIO_B]: 700_000,
    [AUDIO_C]: 616_582,
    [AUDIO_D]: 600_000,
    [AUDIO_INTRO]: 50_000,
  },
  precached: [AUDIO_INTRO],
};

/** Chủ đề HSK thứ hai, dùng chung `AUDIO_C` với chủ đề "Chào hỏi". */
export const HSK_UNIT_2_ID = 'hsk1-family';

// Chủ đề thứ hai: `AUDIO_C` (dùng chung) + `AUDIO_E` = 1 016 582 byte.
export const HSK_TWO_UNITS_INDEX: AudioIndex = {
  units: {
    ...HSK_INDEX.units,
    [HSK_UNIT_2_ID]: [AUDIO_C, AUDIO_E],
  },
  bytes: {
    ...HSK_INDEX.bytes,
    [AUDIO_E]: 400_000,
  },
  precached: HSK_INDEX.precached,
};

// Chủ đề "Chào hỏi" dùng thêm một audio Nhập môn (`AUDIO_INTRO`, precached):
// 4 audio HSK + `AUDIO_INTRO` = 2 566 582 byte.
export const HSK_WITH_INTRO_AUDIO_INDEX: AudioIndex = {
  units: {
    ...HSK_INDEX.units,
    [HSK_UNIT_ID]: [AUDIO_A, AUDIO_B, AUDIO_INTRO, AUDIO_C, AUDIO_D],
  },
  bytes: HSK_INDEX.bytes,
  precached: HSK_INDEX.precached,
};

export function makeSnapshot(
  overrides: Partial<OfflineAudioSnapshot> = {},
): OfflineAudioSnapshot {
  return {
    index: HSK_INDEX,
    cachedPaths: new Set<string>(),
    downloadingUnitIds: new Set<string>(),
    messages: new Map(),
    announcements: [],
    ...overrides,
  };
}

/** Chủ đề Nhập môn thứ hai, không có audio nào (`[]` trong index). */
export const INTRO_EMPTY_UNIT_ID = 'intro2';

// Chủ đề "Gia đình" (HSK) và chủ đề Nhập môn thứ hai có danh sách audio rỗng (`[]`).
export const EMPTY_AUDIO_UNITS_INDEX: AudioIndex = {
  units: {
    ...HSK_INDEX.units,
    [HSK_UNIT_2_ID]: [],
    [INTRO_EMPTY_UNIT_ID]: [],
  },
  bytes: HSK_INDEX.bytes,
  precached: HSK_INDEX.precached,
};

// "Chào hỏi" = `AUDIO_A` + `AUDIO_B` + `AUDIO_C` (1 916 582 byte); "Gia đình" = `AUDIO_E` rồi `AUDIO_C`
// (dùng chung, tải sau cùng). Seed `AUDIO_A`, `AUDIO_B` thì "Chào hỏi" chỉ còn thiếu `AUDIO_C` của "Gia đình".
export const GREETINGS_MISSING_SHARED_INDEX: AudioIndex = {
  units: {
    intro1: [AUDIO_INTRO],
    [HSK_UNIT_ID]: [AUDIO_A, AUDIO_B, AUDIO_C],
    [HSK_UNIT_2_ID]: [AUDIO_E, AUDIO_C],
  },
  bytes: {
    ...HSK_INDEX.bytes,
    [AUDIO_E]: 400_000,
  },
  precached: HSK_INDEX.precached,
};
