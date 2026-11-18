import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DailyGoalMinutes } from '@csk/shared';

import type { LearningPreferences } from '@shared/models/settings.model';
import { ProgressService } from '@shared/services/progress.service';

export interface SettingsState {
  /** null khi đang đọc. */
  preferences: LearningPreferences | null;
  changeDailyGoal: (minutes: DailyGoalMinutes) => void;
  changePinyinVisibility: (isVisible: boolean) => void;
}

export const useSettings = (): SettingsState => {
  const service = useMemo(() => new ProgressService(), []);
  const [preferences, setPreferences] = useState<LearningPreferences | null>(
    null,
  );
  // Giá trị đã lưu chắc chắn; dùng để trả về khi lưu lỗi (design D4, task 8.x).
  const persistedRef = useRef<LearningPreferences | null>(null);

  // getLearningPreferences không throw: đọc lỗi → mặc định (design D3).
  useEffect(() => {
    let isActive = true;
    void service.getLearningPreferences().then((value) => {
      if (isActive) {
        persistedRef.current = value;
        setPreferences(value);
      }
    });
    return () => {
      isActive = false;
    };
  }, [service]);

  // Cập nhật giá trị hiển thị ngay (lạc quan), chưa lưu.
  const showChange = useCallback(
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

  // Đổi một field (design D4): hiển thị ngay, lưu qua service, ghi nhận giá trị đã lưu khi xong.
  // Xử lý lỗi lưu bổ sung ở task 8.x.
  const applyChange = useCallback(
    <K extends keyof LearningPreferences>(
      key: K,
      value: LearningPreferences[K],
      save: () => Promise<void>,
    ) => {
      showChange(key, value);
      void save().then(() => {
        if (persistedRef.current !== null) {
          persistedRef.current = { ...persistedRef.current, [key]: value };
        }
      });
    },
    [showChange],
  );

  const changeDailyGoal = useCallback(
    (minutes: DailyGoalMinutes) =>
      applyChange('dailyGoalMinutes', minutes, () =>
        service.changeDailyGoal(minutes),
      ),
    [applyChange, service],
  );

  // Lưu qua applyChange ở task 7.12.
  const changePinyinVisibility = useCallback(
    (isVisible: boolean) => showChange('isPinyinVisible', isVisible),
    [showChange],
  );

  return { preferences, changeDailyGoal, changePinyinVisibility };
};
