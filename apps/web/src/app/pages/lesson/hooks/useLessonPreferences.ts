import { useEffect, useMemo, useState } from 'react';

import type { LessonPreferences } from '@shared/models/settings.model';
import { ProgressService } from '@shared/services/progress.service';

/** Tùy chọn đã nạp, gắn với `lessonId` để đổi bài thì đọc lại thay vì dùng của bài cũ. */
interface LoadedPreferences {
  lessonId: string;
  preferences: LessonPreferences;
}

/**
 * Tùy chọn của người học khi mở bài (S8.2 AC2, AC3). `null` khi đang đọc cho bài hiện tại.
 * Đọc lại mỗi khi đổi `lessonId`; đọc lỗi thì service trả mặc định, không throw.
 */
export const useLessonPreferences = (
  lessonId: string,
): LessonPreferences | null => {
  const service = useMemo(() => new ProgressService(), []);
  const [loaded, setLoaded] = useState<LoadedPreferences | null>(null);

  useEffect(() => {
    let isActive = true;
    void service.getLessonPreferences().then((preferences) => {
      if (isActive) {
        setLoaded({ lessonId, preferences });
      }
    });
    return () => {
      isActive = false;
    };
  }, [service, lessonId]);

  return loaded?.lessonId === lessonId ? loaded.preferences : null;
};
