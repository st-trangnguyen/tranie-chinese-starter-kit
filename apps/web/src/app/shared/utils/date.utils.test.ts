import { describe, expect, it } from 'vitest';

import {
  previousLocalDateKey,
  startOfNextLocalDay,
  toLocalDateKey,
} from './date.utils';

describe('date.utils — ranh giới ngày theo giờ máy', () => {
  it('S8.1-AC2 Học qua nửa đêm chia cho hai ngày: khóa ngày lấy theo giờ máy', () => {
    expect(toLocalDateKey(new Date(2026, 10, 17, 23, 50).getTime())).toBe(
      '2026-11-17',
    );
    expect(toLocalDateKey(new Date(2026, 10, 18, 0, 10).getTime())).toBe(
      '2026-11-18',
    );
    expect(toLocalDateKey(new Date(2026, 0, 5, 0, 0).getTime())).toBe(
      '2026-01-05',
    );
  });

  it('S8.1-AC2 Học qua nửa đêm chia cho hai ngày: 0 giờ của ngày kế tiếp', () => {
    expect(startOfNextLocalDay(new Date(2026, 10, 17, 23, 50).getTime())).toBe(
      new Date(2026, 10, 18).getTime(),
    );
    expect(startOfNextLocalDay(new Date(2026, 11, 31, 8, 0).getTime())).toBe(
      new Date(2027, 0, 1).getTime(),
    );
  });
});

describe('date.utils — ngày liền trước', () => {
  it('S8.3-AC1 Đạt mục tiêu hôm nay thì streak tăng 1: lùi một ngày qua đầu tháng, đầu năm', () => {
    expect(previousLocalDateKey('2026-11-18')).toBe('2026-11-17');
    expect(previousLocalDateKey('2026-03-01')).toBe('2026-02-28');
    expect(previousLocalDateKey('2026-01-01')).toBe('2025-12-31');
  });
});
