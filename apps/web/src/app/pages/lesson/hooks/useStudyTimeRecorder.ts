import { useCallback, useMemo } from 'react';

import { STUDY_TIME_FLUSH_INTERVAL_MS } from '@core/constants/study-time.constants';
import { useVisibleTimeSegments } from '@core/hooks/useVisibleTimeSegments';
import { ProgressService } from '@shared/services/progress.service';

/** Ghi thời gian người học ở màn bài (trang đang hiện) vào thời gian học hôm nay (S8.1). */
export function useStudyTimeRecorder(): void {
  const progressService = useMemo(() => new ProgressService(), []);

  const handleSegment = useCallback(
    (startMs: number, endMs: number) => {
      progressService.recordStudyTime(startMs, endMs).catch(() => {
        // Không ghi được thời gian (ví dụ IndexedDB lỗi): bỏ qua, không làm hỏng màn bài đang học.
      });
    },
    [progressService],
  );

  useVisibleTimeSegments(handleSegment, STUDY_TIME_FLUSH_INTERVAL_MS);
}
