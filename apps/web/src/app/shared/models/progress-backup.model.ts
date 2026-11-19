import type { ProgressBackupFile, ProgressSnapshot } from '@csk/shared';

/** Lý do từ chối file người học chọn để nhập tiến độ (S8.5 AC2). */
export type BackupRejectReason = 'not-backup' | 'corrupted' | 'newer-version';

/** Kết quả kiểm tra nội dung file sao lưu (`BackupService.checkBackupText`). */
export type BackupCheck =
  | { status: 'valid'; file: ProgressBackupFile }
  | { status: 'rejected'; reason: BackupRejectReason };

/** Tóm tắt file hiện trong hộp xác nhận (S8.5 AC3). */
export interface ImportPreview {
  exportedOn: string;
  completedLessonCount: number;
}

/** Kết quả xem trước file nhập (`BackupService.inspectImportFile`). */
export type ImportInspection =
  | { status: 'valid'; snapshot: ProgressSnapshot; preview: ImportPreview }
  | { status: 'rejected'; reason: BackupRejectReason };
