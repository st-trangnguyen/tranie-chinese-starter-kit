import { useEffect, useRef } from 'react';

/**
 * Phát các đoạn thời gian [startMs, endMs] mà trang đang hiện. Thời gian trang ẩn (app chạy nền)
 * không nằm trong đoạn nào. Đoạn đang mở được phát mỗi `flushIntervalMs`, khi trang ẩn và khi unmount.
 */
export function useVisibleTimeSegments(
  onSegment: (startMs: number, endMs: number) => void,
  flushIntervalMs: number,
): void {
  const onSegmentRef = useRef(onSegment);

  useEffect(() => {
    onSegmentRef.current = onSegment;
  }, [onSegment]);

  useEffect(() => {
    let segmentStart: number | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const emitOpenSegment = (now: number): void => {
      if (segmentStart === null) {
        return;
      }
      onSegmentRef.current(segmentStart, now);
      segmentStart = null;
    };

    const stopInterval = (): void => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const startSegment = (): void => {
      segmentStart = Date.now();
      stopInterval();
      intervalId = setInterval(() => {
        const now = Date.now();
        emitOpenSegment(now);
        segmentStart = now;
      }, flushIntervalMs);
    };

    // Phát ngay trong listener: thời điểm ẩn lấy lúc sự kiện, không chờ React render.
    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        if (segmentStart === null) {
          startSegment();
        }
        return;
      }
      emitOpenSegment(Date.now());
      stopInterval();
    };

    if (document.visibilityState === 'visible') {
      startSegment();
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopInterval();
      emitOpenSegment(Date.now());
    };
  }, [flushIntervalMs]);
}
