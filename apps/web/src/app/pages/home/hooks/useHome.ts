import { useEffect, useMemo, useState } from 'react';

import type { NextLesson } from '@shared/models/home.model';
import { ContentService } from '@shared/services/content.service';
import { ProgressService } from '@shared/services/progress.service';

export interface HomeState {
  /** null khi đang nạp. */
  nextLesson: NextLesson | null;
  /** true khi nạp lộ trình lỗi (design D6). */
  hasNextLessonError: boolean;
}

export const useHome = (): HomeState => {
  const contentService = useMemo(() => new ContentService(), []);
  const progressService = useMemo(() => new ProgressService(), []);
  const [nextLesson, setNextLesson] = useState<NextLesson | null>(null);
  const [hasNextLessonError, setHasNextLessonError] = useState(false);

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
        if (isActive) {
          setHasNextLessonError(true);
        }
      });
    return () => {
      isActive = false;
    };
  }, [contentService, progressService]);

  return { nextLesson, hasNextLessonError };
};
