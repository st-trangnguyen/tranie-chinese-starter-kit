import { useEffect, useMemo, useState } from 'react';
import type { LessonStatus } from '@csk/shared';

import type { PathMap } from '@shared/models/learning-path.model';
import { ContentService } from '@shared/services/content.service';
import { ProgressService } from '@shared/services/progress.service';

export interface LearningPathState {
  /** null khi đang nạp. */
  pathMap: PathMap | null;
  statuses: ReadonlyMap<string, LessonStatus>;
  hasError: boolean;
}

const EMPTY_STATUSES: ReadonlyMap<string, LessonStatus> = new Map();

export const useLearningPath = (): LearningPathState => {
  const contentService = useMemo(() => new ContentService(), []);
  const progressService = useMemo(() => new ProgressService(), []);
  const [pathMap, setPathMap] = useState<PathMap | null>(null);
  const [completedIds, setCompletedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isActive = true;
    Promise.all([
      contentService.getPathMap(),
      // Không đọc được IndexedDB (ví dụ chế độ riêng tư): coi như chưa xong bài nào.
      progressService
        .getCompletedLessonIds()
        .catch((): Set<string> => new Set()),
    ])
      .then(([loadedPathMap, loadedCompletedIds]) => {
        if (isActive) {
          setPathMap(loadedPathMap);
          setCompletedIds(loadedCompletedIds);
        }
      })
      .catch(() => {
        if (isActive) {
          setHasError(true);
        }
      });
    return () => {
      isActive = false;
    };
  }, [contentService, progressService]);

  const statuses = useMemo(
    () =>
      pathMap
        ? progressService.deriveLessonStatuses(pathMap.stages, completedIds)
        : EMPTY_STATUSES,
    [pathMap, completedIds, progressService],
  );

  return { pathMap, statuses, hasError };
};
