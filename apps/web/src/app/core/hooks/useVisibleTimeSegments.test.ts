import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { STUDY_TIME_FLUSH_INTERVAL_MS } from '@core/constants/study-time.constants';
import { setPageVisibility } from '@test/visibility.helpers';

import { useVisibleTimeSegments } from './useVisibleTimeSegments';

const MINUTE = 60_000;
const START_TIME = new Date(2026, 10, 18, 9, 0, 0).getTime();

type Segment = [number, number];

function toSegments(onSegment: ReturnType<typeof vi.fn>): Segment[] {
  return onSegment.mock.calls.map((call): Segment => [
    Number(call[0]),
    Number(call[1]),
  ]);
}

function totalSeconds(segments: Segment[]): number {
  return segments.reduce((sum, [start, end]) => sum + (end - start) / 1000, 0);
}

describe('useVisibleTimeSegments', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START_TIME);
    setPageVisibility(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    setPageVisibility(false);
  });

  it('S8.1-AC2: thời gian app chạy nền không tính', () => {
    const onSegment = vi.fn();
    const { unmount } = renderHook(() =>
      useVisibleTimeSegments(onSegment, STUDY_TIME_FLUSH_INTERVAL_MS),
    );

    act(() => {
      vi.advanceTimersByTime(MINUTE);
    });
    const hiddenStart = Date.now();
    act(() => {
      setPageVisibility(true);
    });
    act(() => {
      vi.advanceTimersByTime(10 * MINUTE);
    });
    const hiddenEnd = Date.now();
    act(() => {
      setPageVisibility(false);
    });
    act(() => {
      vi.advanceTimersByTime(MINUTE);
    });
    unmount();

    const segments = toSegments(onSegment);
    expect(totalSeconds(segments)).toBe(120);
    for (const [start, end] of segments) {
      expect(end).toBeGreaterThanOrEqual(start);
      const overlapsHidden = start < hiddenEnd && end > hiddenStart;
      expect(overlapsHidden).toBe(false);
    }
  });

  it('S8.1-AC2: đóng app giữa bài chỉ mất tối đa 30 giây cuối', () => {
    const onSegment = vi.fn();
    renderHook(() =>
      useVisibleTimeSegments(onSegment, STUDY_TIME_FLUSH_INTERVAL_MS),
    );

    act(() => {
      vi.advanceTimersByTime(3 * MINUTE + 40_000);
    });

    const segments = toSegments(onSegment);
    expect(totalSeconds(segments)).toBeGreaterThanOrEqual(190);
    const lastEmittedEnd = Math.max(...segments.map(([, end]) => end));
    expect(Date.now() - lastEmittedEnd).toBeLessThanOrEqual(
      STUDY_TIME_FLUSH_INTERVAL_MS,
    );
  });

  it('S8.1-AC2: để app mở ở màn bài không thao tác vẫn tính', () => {
    const onSegment = vi.fn();
    const { unmount } = renderHook(() =>
      useVisibleTimeSegments(onSegment, STUDY_TIME_FLUSH_INTERVAL_MS),
    );

    act(() => {
      vi.advanceTimersByTime(120 * MINUTE);
    });
    unmount();

    expect(totalSeconds(toSegments(onSegment))).toBe(7200);
  });
});
