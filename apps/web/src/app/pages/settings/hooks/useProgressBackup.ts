import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type {
  BackupMessage,
  BackupMessageKey,
  BackupRejectReason,
  ProgressBackupPhase,
  ProgressBackupView,
} from '@shared/models/progress-backup.model';
import { BackupService } from '@shared/services/backup.service';

const ignore = (): void => undefined;

/** Thông báo lỗi theo lý do file bị từ chối (spec "Thông báo cho từng loại file lỗi"). */
const REJECT_MESSAGE_KEYS: Record<BackupRejectReason, BackupMessageKey> = {
  'not-backup': 'notBackup',
  corrupted: 'corrupted',
  'newer-version': 'newerVersion',
};

/**
 * Mục Sao lưu tiến độ trong màn Cài đặt (S8.5, design D6).
 * Các handler nhập file được nối dần theo từng Scenario.
 */
export const useProgressBackup = (): ProgressBackupView => {
  const service = useMemo(() => new BackupService(), []);
  const [phase, setPhase] = useState<ProgressBackupPhase>('idle');
  const [message, setMessage] = useState<BackupMessage | null>(null);
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

  const finish = useCallback(
    (next: BackupMessage) => {
      changePhase('idle');
      if (isActiveRef.current) {
        setMessage(next);
      }
    },
    [changePhase],
  );

  const exportProgress = useCallback(() => {
    if (phaseRef.current !== 'idle') {
      return;
    }
    setMessage(null);
    changePhase('exporting');
    void service.exportProgress().then(
      () => finish({ tone: 'success', key: 'exported' }),
      () => finish({ tone: 'error', key: 'exportFailed' }),
    );
  }, [changePhase, finish, service]);

  const selectFile = useCallback(
    (file: File | undefined) => {
      if (file === undefined || phaseRef.current !== 'idle') {
        return;
      }
      setMessage(null);
      changePhase('checking');
      void service.inspectImportFile(file).then(
        (inspection) => {
          if (inspection.status === 'rejected') {
            finish({
              tone: 'error',
              key: REJECT_MESSAGE_KEYS[inspection.reason],
            });
            return;
          }
          changePhase('idle');
        },
        () => finish({ tone: 'error', key: 'importFailed' }),
      );
    },
    [changePhase, finish, service],
  );

  return {
    phase,
    preview: null,
    message,
    exportProgress,
    selectFile,
    confirmImport: ignore,
    cancelImport: ignore,
  };
};
