import { describe, expect, it } from 'vitest';

import { formatAudioSize } from './offline-audio.utils';

describe('formatAudioSize', () => {
  it.each([
    [870_400, '850 KB'],
    [1_047_552, '1023 KB'],
  ])(
    'S8.4-AC1 Dung lượng dưới 1 MB hiện theo KB: %d byte → "%s"',
    (bytes, expected) => {
      expect(formatAudioSize(bytes)).toBe(expected);
    },
  );
});
