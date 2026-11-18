import { useEffect, useMemo, useState } from 'react';

import type { NextLesson } from '@shared/models/home.model';
import { ContentService } from '@shared/services/content.service';
import { ProgressService } from '@shared/services/progress.service';

export interface HomeState {
  /** null khi đang nạp. */
  nextLesson: NextLesson | null;
}

export const useHome = (): HomeState => {
  const contentService = useMemo(() => new ContentService(), []);
  const progressService = useMemo(() => new ProgressService(), []);
  const [nextLesson, setNextLesson] = useState<NextLesson | null>(null);

  useEffect(() => {
    let isActive = true;
    Promise.all([
      contentService.getPathMap(),
      // Không đọc được IndexedDB (ví dụ chế độ riêng tư): coi như chưa xong bài nào.
      progressService
        .getCompletedLessonIds()
        .catch((): Set<string> => new Set()),
    ])
      .then(([pathMap, completedIds]) => {
        if (!isActive) {
          return;
        }
        const statuses = progressService.deriveLessonStatuses(
          pathMap.stages,
          completedIds,
        );
        const lessonId = progressService.findNextLessonId(
          pathMap.stages,
          statuses,
        );
        setNextLesson(
          lessonId === undefined
            ? { status: 'all-completed' }
            : {
                status: 'available',
                lessonId,
                title: pathMap.lessonTitles.get(lessonId) ?? lessonId,
              },
        );
      })
      .catch(() => {
        // Nạp lộ trình lỗi: tạm giữ trạng thái đang nạp; nhánh báo lỗi là task 8.24 (design D6).
      });
    return () => {
      isActive = false;
    };
  }, [contentService, progressService]);

  return { nextLesson };
};
