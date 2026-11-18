import { describe, expect, it } from 'vitest';

import { formatAudioSize, toDownloadPercent } from './offline-audio.utils';

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

  it.each([
    [300, '1 KB'],
    [1, '1 KB'],
    [0, '1 KB'],
  ])(
    'S8.4-AC1 Dung lượng rất nhỏ hiện tối thiểu 1 KB: %d byte → "%s"',
    (bytes, expected) => {
      expect(formatAudioSize(bytes)).toBe(expected);
    },
  );

  it.each([
    [1_047_553, '1,0 MB'],
    [1_048_064, '1,0 MB'],
    [1_048_575, '1,0 MB'],
    [1_048_576, '1,0 MB'],
  ])(
    'S8.4-AC1 Dung lượng sát 1 MB hiện 1,0 MB: %d byte → "%s"',
    (bytes, expected) => {
      expect(formatAudioSize(bytes)).toBe(expected);
    },
  );

  it.each([
    [1_310_720, '1,3 MB'],
    [2_516_582, '2,4 MB'],
  ])(
    'S8.4-AC1 Dung lượng MB làm tròn lên khi chữ số tiếp theo là 5: %d byte → "%s"',
    (bytes, expected) => {
      expect(formatAudioSize(bytes)).toBe(expected);
    },
  );
});

describe('toDownloadPercent', () => {
  it.each([
    [1, 4, 25],
    [3, 4, 75],
  ])(
    'S8.4-AC1 Hiện tiến độ khi đang tải: %d/%d → %d phần trăm',
    (done, total, expected) => {
      expect(toDownloadPercent(done, total)).toBe(expected);
    },
  );
});
