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
    expect(service.splitStudyTimeByDay(at(18, 8, 0), at(18, 8, 5, 30))).toEqual(
      [{ date: '2026-11-18', seconds: 330 }],
    );
  });

  it('S8.1-AC2 Học qua nửa đêm chia cho hai ngày: đồng hồ lùi hoặc đoạn rỗng thì không tính', () => {
    expect(service.splitStudyTimeByDay(at(18, 8, 0), at(18, 8, 0))).toEqual([]);
    expect(service.splitStudyTimeByDay(at(18, 8, 5), at(18, 8, 0))).toEqual([]);
  });
});

describe('ProgressService — toStudyMinutes', () => {
  const service = new ProgressService();

  it('S8.1-AC2 Làm tròn xuống phút: 470 giây là 7 phút', () => {
    expect(service.toStudyMinutes(470)).toBe(7);
  });

  it('S8.1-AC2 Làm tròn xuống phút: 479.9 giây vẫn là 7 phút', () => {
    expect(service.toStudyMinutes(479.9)).toBe(7);
  });

  it('S8.1-AC2 Làm tròn xuống phút: đủ 480 giây là 8 phút', () => {
    expect(service.toStudyMinutes(480)).toBe(8);
  });

  it('S8.1-AC2 Làm tròn xuống phút: 0 giây là 0 phút', () => {
    expect(service.toStudyMinutes(0)).toBe(0);
  });
});

describe('ProgressService — isDailyGoalReached', () => {
  const service = new ProgressService();

  it('S8.1-AC2 Vừa đúng mục tiêu: 15 / 15 phút là đạt', () => {
    expect(service.isDailyGoalReached(15, 15)).toBe(true);
  });

  it('S8.1-AC2 Vừa đúng mục tiêu: 14 / 15 phút là chưa đạt', () => {
    expect(service.isDailyGoalReached(14, 15)).toBe(false);
  });

  it('S8.1-AC2 Vừa đúng mục tiêu: vượt mục tiêu 45 / 30 phút vẫn là đạt', () => {
    expect(service.isDailyGoalReached(45, 30)).toBe(true);
  });

  it('S8.1-AC2 Vừa đúng mục tiêu: 0 / 30 phút là chưa đạt', () => {
    expect(service.isDailyGoalReached(0, 30)).toBe(false);
  });
});
