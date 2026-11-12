import { describe, expect, it } from 'vitest';

import { formatDuration } from './duration.utils';

describe('formatDuration', () => {
  it('S3.4-AC1: thời gian hiện theo phút và giây', () => {
    expect(formatDuration(125)).toBe('2:05');
    expect(formatDuration(3600)).toBe('60:00');
  });

  it('S3.4-AC1: thời gian dưới một phút hiện 0:ss', () => {
    expect(formatDuration(9)).toBe('0:09');
    expect(formatDuration(0)).toBe('0:00');
  });
});
