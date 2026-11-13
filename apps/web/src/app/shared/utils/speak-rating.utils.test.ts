import { describe, expect, it } from 'vitest';

import { isRatingCorrect } from './speak-rating.utils';

describe('isRatingCorrect', () => {
  it('S5.2-AC2: "Đúng" tính là câu đúng', () => {
    expect(isRatingCorrect('correct')).toBe(true);
  });

  it('S5.2-AC2: "Gần đúng" không tính là câu đúng', () => {
    expect(isRatingCorrect('close')).toBe(false);
  });

  it('S5.2-AC2: "Chưa đúng" không tính là câu đúng', () => {
    expect(isRatingCorrect('not-yet')).toBe(false);
  });
});
