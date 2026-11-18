import { useCallback, useEffect, useMemo, useState } from 'react';

import type { LearningPreferences } from '@shared/models/settings.model';
import { ProgressService } from '@shared/services/progress.service';

export interface SettingsState {
  /** null khi đang đọc. */
  preferences: LearningPreferences | null;
  changePinyinVisibility: (isVisible: boolean) => void;
}

export const useSettings = (): SettingsState => {
  const service = useMemo(() => new ProgressService(), []);
  const [preferences, setPreferences] = useState<LearningPreferences | null>(
    null,
  );

  // getLearningPreferences không throw: đọc lỗi → mặc định (design D3).
  useEffect(() => {
    let isActive = true;
    void service.getLearningPreferences().then((value) => {
      if (isActive) {
        setPreferences(value);
      }
    });
    return () => {
      isActive = false;
    };
  }, [service]);

  // Đổi một field (design D4): cập nhật giá trị hiển thị ngay (lạc quan).
  // Lưu qua service và xử lý lỗi bổ sung ở task 7.8–7.12, 8.x.
  const applyChange = useCallback(
    <K extends keyof LearningPreferences>(
      key: K,
      value: LearningPreferences[K],
    ) => {
      setPreferences((prev) =>
        prev === null ? prev : { ...prev, [key]: value },
      );
    },
    [],
  );

  const changePinyinVisibility = useCallback(
    (isVisible: boolean) => applyChange('isPinyinVisible', isVisible),
    [applyChange],
  );

  return { preferences, changePinyinVisibility };
};
