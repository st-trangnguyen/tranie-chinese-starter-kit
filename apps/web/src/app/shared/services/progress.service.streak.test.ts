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

  it('S8.3-AC1 Hôm nay chưa đạt thì vẫn giữ chuỗi đến hôm qua: 4 ngày đạt 30 phút, hôm nay 10 phút thì streak là 4', () => {
    const stats = [
      day(-4, 2100, 30),
      day(-3, 2100, 30),
      day(-2, 2100, 30),
      day(-1, 2100, 30),
      day(0, 600, 30),
    ];

    expect(service.countStudyStreak(stats, TODAY, 30)).toBe(4);
  });
  it('S8.3-AC1 Bỏ một ngày thì chuỗi đứt: hôm qua chỉ 5 phút, hôm nay chưa học thì streak là 0', () => {
    const stats = [
      day(-6, REACHED),
      day(-5, REACHED),
      day(-4, REACHED),
      day(-3, REACHED),
      day(-2, REACHED),
      day(-1, 300),
      day(0, 0),
    ];

    expect(service.countStudyStreak(stats, TODAY, 15)).toBe(0);
  });

  it('S8.3-AC1 Bỏ một ngày thì chuỗi đứt: hôm qua không mở app, hôm nay chưa học thì streak là 0', () => {
    const stats = [
      day(-6, REACHED),
      day(-5, REACHED),
      day(-4, REACHED),
      day(-3, REACHED),
      day(-2, REACHED),
      day(0, 0),
    ];

    expect(service.countStudyStreak(stats, TODAY, 15)).toBe(0);
  });

  it('S8.3-AC1 Đếm lại sau khi chuỗi đứt: 5 ngày đạt, hôm kia chỉ 5 phút, hôm qua và hôm nay đạt thì streak là 2', () => {
    const stats = [
      day(-7, REACHED),
      day(-6, REACHED),
      day(-5, REACHED),
      day(-4, REACHED),
      day(-3, REACHED),
      day(-2, 300),
      day(-1, REACHED),
      day(0, REACHED),
    ];

    expect(service.countStudyStreak(stats, TODAY, 15)).toBe(2);
  });

  it('S8.3-AC1 Người học mới chưa có ngày nào: chưa có dòng nào thì streak là 0', () => {
    expect(service.countStudyStreak([], TODAY, 15)).toBe(0);
  });

  it('S8.3-AC1 Chưa đủ trọn phút mục tiêu thì chưa tính là đạt: hôm nay 14 phút 59 giây với mục tiêu 15 thì streak là 0', () => {
    const stats = [day(-1, 0), day(0, 899)];

    expect(service.countStudyStreak(stats, TODAY, 15)).toBe(0);
  });

  it('S8.3-AC1 Chưa đủ trọn phút mục tiêu thì chưa tính là đạt: hôm nay vừa đủ 15 phút thì streak là 1', () => {
    const stats = [day(-1, 0), day(0, 900)];

    expect(service.countStudyStreak(stats, TODAY, 15)).toBe(1);
  });

  it('S8.3-AC1 Chưa đủ trọn phút mục tiêu thì chưa tính là đạt: hôm qua 14 phút 59 giây thì chuỗi dừng ở hôm qua', () => {
    const stats = [day(-2, REACHED), day(-1, 899), day(0, REACHED)];

    expect(service.countStudyStreak(stats, TODAY, 15)).toBe(1);
  });

  it('S8.3-AC1 Ngày mới bắt đầu sau nửa đêm theo giờ máy: trong ngày hôm nay đã đạt thì streak là 2', () => {
    const stats = [day(-2, 0), day(-1, REACHED), day(0, REACHED)];

    expect(service.countStudyStreak(stats, TODAY, 15)).toBe(2);
  });

  it('S8.3-AC1 Ngày mới bắt đầu sau nửa đêm theo giờ máy: vừa qua 0:00, ngày mới chưa học thì streak vẫn là 2', () => {
    const stats = [day(-2, 0), day(-1, REACHED), day(0, REACHED)];
    const justAfterMidnight = toLocalDateKey(
      new Date(2026, 10, 19, 0, 1).getTime(),
    );

    expect(service.countStudyStreak(stats, justAfterMidnight, 15)).toBe(2);
  });

  it('S8.3-AC1 Ngày mới bắt đầu sau nửa đêm theo giờ máy: hết ngày mới vẫn chưa học thì ngày kế tiếp streak là 0', () => {
    const stats = [day(-2, 0), day(-1, REACHED), day(0, REACHED)];
    const dayAfterNext = toLocalDateKey(new Date(2026, 10, 20, 0, 1).getTime());

    expect(service.countStudyStreak(stats, dayAfterNext, 15)).toBe(0);
  });

  it('S8.3-AC1 Học qua nửa đêm thì mỗi ngày so với phần thời gian của ngày đó: hôm qua 10 + 10 phút đạt, hôm nay 10 phút chưa đạt thì streak là 1', () => {
    const stats = [day(-2, 0), day(-1, REACHED), day(0, 600)];

    expect(service.countStudyStreak(stats, TODAY, 15)).toBe(1);
  });

  it('S8.3-AC1 Số phút của một ngày đã qua bị hỏng: hôm kia và hôm nay đạt, dòng hỏng của hôm qua đã bị bỏ thì streak là 1', () => {
    const stats = [day(-2, REACHED), day(0, REACHED)];

    expect(service.countStudyStreak(stats, TODAY, 15)).toBe(1);
  });

  it('S8.3-AC1 Ngày ghi sau hôm nay không được tính: ngày mai đã ghi 20 phút, hôm qua và hôm nay đạt thì streak là 2', () => {
    const stats = [
      day(-2, 0),
      day(-1, REACHED),
      day(0, REACHED),
      day(1, REACHED),
    ];

    expect(service.countStudyStreak(stats, TODAY, 15)).toBe(2);
  });

  it('S8.3-AC1 Ngày ghi sau hôm nay không được tính: ngày mai đã ghi 20 phút, hôm nay chưa đạt thì giữ chuỗi đến hôm qua', () => {
    const stats = [
      day(-3, 0),
      day(-2, REACHED),
      day(-1, REACHED),
      day(0, 600),
      day(1, REACHED),
    ];

    expect(service.countStudyStreak(stats, TODAY, 15)).toBe(2);
  });

  it('S8.3-AC1 Tăng mục tiêu không đổi các ngày đã qua: 3 ngày đạt mục tiêu 15, hôm nay đổi sang 30 và học 20 phút thì streak là 3', () => {
    const stats = [
      day(-4, 0),
      day(-3, REACHED, 15),
      day(-2, REACHED, 15),
      day(-1, REACHED, 15),
      day(0, REACHED, 30),
    ];

    expect(service.countStudyStreak(stats, TODAY, 30)).toBe(3);
  });

  it('S8.3-AC1 Hạ mục tiêu không biến ngày chưa đạt thành đạt: 2 ngày học 20 phút với mục tiêu 30, hôm nay đổi sang 15 và chưa học thì streak là 0', () => {
    const stats = [
      day(-3, 0, 30),
      day(-2, REACHED, 30),
      day(-1, REACHED, 30),
      day(0, 0, 15),
    ];

    expect(service.countStudyStreak(stats, TODAY, 15)).toBe(0);
  });

  it('S8.3-AC1 Ngày đã qua không có mục tiêu đọc được: mục tiêu 15, hôm qua 20 phút không có mục tiêu, hôm nay 20 phút thì streak là 2', () => {
    const stats: DailyStat[] = [
      day(-2, 0),
      { date: dateKey(-1), studySeconds: REACHED },
      day(0, REACHED),
    ];

    expect(service.countStudyStreak(stats, TODAY, 15)).toBe(2);
  });

  it('S8.3-AC1 Ngày đã qua không có mục tiêu đọc được: mục tiêu 30, hôm qua 35 phút không có mục tiêu, hôm nay 30 phút thì streak là 2', () => {
    const stats: DailyStat[] = [
      day(-2, 0, 30),
      { date: dateKey(-1), studySeconds: 2100 },
      day(0, 1800, 30),
    ];

    expect(service.countStudyStreak(stats, TODAY, 30)).toBe(2);
  });
});
