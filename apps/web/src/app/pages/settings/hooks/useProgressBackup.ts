import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type {
  ProgressBackupPhase,
  ProgressBackupView,
} from '@shared/models/progress-backup.model';
import { BackupService } from '@shared/services/backup.service';

const ignore = (): void => undefined;

/**
 * Mục Sao lưu tiến độ trong màn Cài đặt (S8.5, design D6).
 * Các handler nhập file được nối dần theo từng Scenario.
 */
export const useProgressBackup = (): ProgressBackupView => {
  const service = useMemo(() => new BackupService(), []);
  const [phase, setPhase] = useState<ProgressBackupPhase>('idle');
  // Đọc đồng bộ để bỏ qua lần bấm lặp trước khi state kịp render lại (design D6).
  const phaseRef = useRef<ProgressBackupPhase>('idle');
  const isActiveRef = useRef(true);

  useEffect(() => {
    isActiveRef.current = true;
    return () => {
      isActiveRef.current = false;
    };
  }, []);

  const changePhase = useCallback((next: ProgressBackupPhase) => {
    phaseRef.current = next;
    if (isActiveRef.current) {
      setPhase(next);
    }
  }, []);

  const exportProgress = useCallback(() => {
    if (phaseRef.current !== 'idle') {
      return;
    }
    changePhase('exporting');
    void service.exportProgress().then(
      () => changePhase('idle'),
      () => changePhase('idle'),
    );
  }, [changePhase, service]);

  return {
    phase,
    preview: null,
    message: null,
    exportProgress,
    selectFile: ignore,
    confirmImport: ignore,
    cancelImport: ignore,
  };
};
