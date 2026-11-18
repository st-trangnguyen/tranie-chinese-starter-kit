import { useEffect, useMemo, useState } from 'react';

import { usePageVisibility } from '@core/hooks/usePageVisibility';
import type { NextLesson, TodayStudy } from '@shared/models/home.model';
import { ContentService } from '@shared/services/content.service';
import { ProgressService } from '@shared/services/progress.service';

export interface HomeState {
  /** null khi đang nạp. */
  nextLesson: NextLesson | null;
  /** null khi đang nạp. */
  todayStudy: TodayStudy | null;
  /** true khi nạp lộ trình lỗi (design D6). */
  hasNextLessonError: boolean;
}

export const useHome = (): HomeState => {
  const contentService = useMemo(() => new ContentService(), []);
  const progressService = useMemo(() => new ProgressService(), []);
  const [nextLesson, setNextLesson] = useState<NextLesson | null>(null);
  const [todayStudy, setTodayStudy] = useState<TodayStudy | null>(null);
  const [hasNextLessonError, setHasNextLessonError] = useState(false);
  const isPageVisible = usePageVisibility();

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

  // Phút hôm nay tính khi mount và mỗi lần trang hiện lại (qua nửa đêm thì sang ngày mới);
  // getTodayStudy không throw (design D4, D6).
  useEffect(() => {
    if (!isPageVisible) {
      return undefined;
    }
    let isActive = true;
    void progressService.getTodayStudy(Date.now()).then((study) => {
      if (isActive) {
        setTodayStudy(study);
      }
    });
    return () => {
      isActive = false;
    };
  }, [progressService, isPageVisible]);

  return { nextLesson, todayStudy, hasNextLessonError };
};
