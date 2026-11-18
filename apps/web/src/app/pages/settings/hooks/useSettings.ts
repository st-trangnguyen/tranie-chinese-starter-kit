import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AudioSpeed, DailyGoalMinutes } from '@csk/shared';

import type { LearningPreferences } from '@shared/models/settings.model';
import { ProgressService } from '@shared/services/progress.service';

export interface SettingsState {
  /** null khi đang đọc. */
  preferences: LearningPreferences | null;
  /** null = không có lỗi lưu; tăng mỗi lần lưu lỗi (key của thông báo). */
  saveErrorId: number | null;
  changeDailyGoal: (minutes: DailyGoalMinutes) => void;
  changeDefaultAudioSpeed: (speed: AudioSpeed) => void;
  changePinyinVisibility: (isVisible: boolean) => void;
}

export const useSettings = (): SettingsState => {
  const service = useMemo(() => new ProgressService(), []);
  const [preferences, setPreferences] = useState<LearningPreferences | null>(
    null,
  );
  const [saveErrorId, setSaveErrorId] = useState<number | null>(null);
  // Giá trị đã lưu chắc chắn; dùng để trả về khi lưu lỗi (design D4).
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

  // Đổi một field (design D4): hiển thị ngay, lưu qua service, ghi nhận giá trị đã lưu khi xong.
  // Lưu được: thông báo lỗi biến mất. Lưu lỗi: trả field về giá trị đã lưu, báo lỗi.
  const applyChange = useCallback(
    <K extends keyof LearningPreferences>(
      key: K,
      value: LearningPreferences[K],
      save: () => Promise<void>,
    ) => {
      setPreferences((prev) =>
        prev === null ? prev : { ...prev, [key]: value },
      );
      void save().then(
        () => {
          if (persistedRef.current !== null) {
            persistedRef.current = { ...persistedRef.current, [key]: value };
          }
          setSaveErrorId(null);
        },
        () => {
          const persisted = persistedRef.current;
          if (persisted !== null) {
            setPreferences((prev) =>
              prev === null ? prev : { ...prev, [key]: persisted[key] },
            );
          }
          setSaveErrorId((prev) => (prev ?? 0) + 1);
        },
      );
    },
    [],
  );

  const changeDailyGoal = useCallback(
    (minutes: DailyGoalMinutes) =>
      applyChange('dailyGoalMinutes', minutes, () =>
        service.changeDailyGoal(minutes),
      ),
    [applyChange, service],
  );

  const changeDefaultAudioSpeed = useCallback(
    (speed: AudioSpeed) =>
      applyChange('defaultAudioSpeed', speed, () =>
        service.changeDefaultAudioSpeed(speed),
      ),
    [applyChange, service],
  );

  const changePinyinVisibility = useCallback(
    (isVisible: boolean) =>
      applyChange('isPinyinVisible', isVisible, () =>
        service.changePinyinVisibility(isVisible),
      ),
    [applyChange, service],
  );

  return {
    preferences,
    saveErrorId,
    changeDailyGoal,
    changeDefaultAudioSpeed,
    changePinyinVisibility,
  };
};
