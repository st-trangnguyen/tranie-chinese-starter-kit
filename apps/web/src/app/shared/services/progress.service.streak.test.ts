import { describe, expect, it } from 'vitest';

import type { DailyGoalMinutes, DailyStat } from '@csk/shared';

import { toLocalDateKey } from '@shared/utils/date.utils';

import { ProgressService } from './progress.service';

/** Khóa ngày cách hôm nay (D0 = 18/11/2026, giờ máy) `offset` ngày. */
const dateKey = (offset: number): string =>
  toLocalDateKey(new Date(2026, 10, 18 + offset, 12, 0).getTime());

const TODAY = dateKey(0);

/** Một dòng `dailyStats` của ngày D`offset`, ghi kèm mục tiêu của ngày đó. */
const day = (
  offset: number,
  seconds: number,
  goalMinutes: DailyGoalMinutes = 15,
): DailyStat => ({ date: dateKey(offset), studySeconds: seconds, goalMinutes });

/** 20 phút: đạt mục tiêu 15 phút. */
const REACHED = 1200;

describe('ProgressService — countStudyStreak', () => {
  const service = new ProgressService();

  it('S8.3-AC1 Đạt mục tiêu hôm nay thì streak tăng 1: hôm nay chưa đạt thì giữ chuỗi đến hôm qua', () => {
    const stats = [day(-3, 0), day(-2, REACHED), day(-1, REACHED), day(0, 840)];

    expect(service.countStudyStreak(stats, TODAY, 15)).toBe(2);
  });

  it('S8.3-AC1 Đạt mục tiêu hôm nay thì streak tăng 1: vừa đủ 15 phút hôm nay thì chuỗi thành 3', () => {
    const stats = [day(-3, 0), day(-2, REACHED), day(-1, REACHED), day(0, 900)];

    expect(service.countStudyStreak(stats, TODAY, 15)).toBe(3);
  });
});
