import { describe, expect, it } from 'vitest';

import { ProgressService } from './progress.service';

const at = (day: number, hours: number, minutes: number, seconds = 0) =>
  new Date(2026, 10, day, hours, minutes, seconds).getTime();

describe('ProgressService — splitStudyTimeByDay', () => {
  const service = new ProgressService();

  it('S8.1-AC2 Học qua nửa đêm chia cho hai ngày: cắt tại 0 giờ', () => {
    expect(service.splitStudyTimeByDay(at(17, 23, 50), at(18, 0, 10))).toEqual([
      { date: '2026-11-17', seconds: 600 },
      { date: '2026-11-18', seconds: 600 },
    ]);
  });

  it('S8.1-AC2 Học qua nửa đêm chia cho hai ngày: cùng ngày thì một phần', () => {
    expect(service.splitStudyTimeByDay(at(18, 8, 0), at(18, 8, 5, 30))).toEqual([
      { date: '2026-11-18', seconds: 330 },
    ]);
  });

  it('S8.1-AC2 Học qua nửa đêm chia cho hai ngày: đồng hồ lùi hoặc đoạn rỗng thì không tính', () => {
    expect(service.splitStudyTimeByDay(at(18, 8, 0), at(18, 8, 0))).toEqual([]);
    expect(service.splitStudyTimeByDay(at(18, 8, 5), at(18, 8, 0))).toEqual([]);
  });
});
