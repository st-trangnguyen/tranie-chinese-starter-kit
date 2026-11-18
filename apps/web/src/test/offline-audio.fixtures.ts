import type { AudioIndex } from '@csk/shared';

import type { OfflineAudioSnapshot } from '@shared/models/offline-audio.model';

export const HSK_STAGE_ID = 'hsk1';
export const HSK_UNIT_ID = 'hsk1-greetings';

export const AUDIO_A = 'audio/0000000000000001.mp3';
export const AUDIO_B = 'audio/0000000000000002.mp3';
export const AUDIO_C = 'audio/0000000000000003.mp3';
export const AUDIO_D = 'audio/0000000000000004.mp3';
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
