import { useEffect, useMemo, useState } from 'react';

import { ContentService } from '@shared/services/content.service';

export interface PlacementTestState {
  /** Bài kiểm tra của chủ đề; null khi đang nạp hoặc lỗi. */
  lessonId: string | null;
  hasError: boolean;
}

interface Resolved {
  unitId: string;
  lessonId: string | null;
}

/** Tìm bài kiểm tra vượt cấp của chủ đề (S3.6); quy tắc nằm ở `ContentService`. */
export const usePlacementTest = (unitId: string): PlacementTestState => {
  const service = useMemo(() => new ContentService(), []);
  const [resolved, setResolved] = useState<Resolved | null>(null);

  useEffect(() => {
    let isActive = true;
    service.getPlacementTest(unitId).then(
      ({ lessonId }) => isActive && setResolved({ unitId, lessonId }),
      () => isActive && setResolved({ unitId, lessonId: null }),
    );
    return () => {
      isActive = false;
    };
  }, [service, unitId]);

  const current = resolved?.unitId === unitId ? resolved : null;
  return {
    lessonId: current?.lessonId ?? null,
    hasError: current !== null && current.lessonId === null,
  };
};
