import { useEffect, useMemo, useState } from 'react';
import type { Lesson, LessonStatus } from '@csk/shared';

import type { PathMap } from '@shared/models/learning-path.model';
import { ContentService } from '@shared/services/content.service';
import { ProgressService } from '@shared/services/progress.service';

export interface LearningPathState {
  /** null khi đang nạp. */
  pathMap: PathMap | null;
  statuses: ReadonlyMap<string, LessonStatus>;
  /** Id chủ đề chưa mở có bài kiểm tra, tức có nút "Kiểm tra vượt cấp" (S3.6). */
  placementTestUnitIds: ReadonlySet<string>;
  hasError: boolean;
}

const EMPTY_UNIT_IDS: ReadonlySet<string> = new Set();
const EMPTY_STATUSES: ReadonlyMap<string, LessonStatus> = new Map();

export const useLearningPath = (): LearningPathState => {
  const contentService = useMemo(() => new ContentService(), []);
  const progressService = useMemo(() => new ProgressService(), []);
  const [pathMap, setPathMap] = useState<PathMap | null>(null);
  const [completedIds, setCompletedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [lessonTypes, setLessonTypes] = useState<
    ReadonlyMap<string, Lesson['type']>
  >(() => new Map());
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

  const lockedUnitLessonIds = useMemo(
    () =>
      (pathMap?.stages ?? [])
        .flatMap((stage) => stage.units)
        .filter((unit) => progressService.isUnitLocked(unit, statuses))
        .flatMap((unit) => unit.lessonIds),
    [pathMap, statuses, progressService],
  );

  useEffect(() => {
    if (lockedUnitLessonIds.length === 0) {
      return undefined;
    }
    let isActive = true;
    contentService
      .getLessonTypes(lockedUnitLessonIds)
      .then((loadedTypes) => {
        if (isActive) {
          setLessonTypes(loadedTypes);
        }
      })
      .catch(() => {
        // Không biết loại bài thì không hiện nút vượt cấp; bản đồ vẫn dùng được.
      });
    return () => {
      isActive = false;
    };
  }, [contentService, lockedUnitLessonIds]);

  const placementTestUnitIds = useMemo(() => {
    if (!pathMap) {
      return EMPTY_UNIT_IDS;
    }
    return new Set(
      pathMap.stages
        .flatMap((stage) => stage.units)
        .filter(
          (unit) =>
            progressService.getPlacementTestLessonId(
              unit,
              statuses,
              lessonTypes,
            ) !== undefined,
        )
        .map((unit) => unit.id),
    );
  }, [pathMap, statuses, lessonTypes, progressService]);

  return { pathMap, statuses, placementTestUnitIds, hasError };
};
