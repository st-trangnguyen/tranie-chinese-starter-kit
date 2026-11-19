import type { ProgressBackupView } from '@shared/models/progress-backup.model';

const ignore = (): void => undefined;

/**
 * Mục Sao lưu tiến độ trong màn Cài đặt (S8.5, design D6).
 * Skeleton: chưa nối `BackupService`; các handler được nối dần theo từng Scenario.
 */
export const useProgressBackup = (): ProgressBackupView => ({
  phase: 'idle',
  preview: null,
  message: null,
  exportProgress: ignore,
  selectFile: ignore,
  confirmImport: ignore,
  cancelImport: ignore,
});
