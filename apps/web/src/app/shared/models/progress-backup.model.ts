/** Lý do từ chối file người học chọn để nhập tiến độ (S8.5 AC2). */
export type BackupRejectReason = 'not-backup' | 'corrupted' | 'newer-version';

/**
 * Kết quả kiểm tra nội dung file sao lưu (`BackupService.checkBackupText`).
 * `file` sẽ là `ProgressBackupFile` của `@csk/shared` khi schema file có (design D2).
 */
export type BackupCheck =
  | { status: 'valid'; file: unknown }
  | { status: 'rejected'; reason: BackupRejectReason };

/** Tóm tắt file hiện trong hộp xác nhận (S8.5 AC3). */
export interface ImportPreview {
  exportedOn: string;
  completedLessonCount: number;
}

/**
 * Kết quả xem trước file nhập (`BackupService.inspectImportFile`).
 * `snapshot` sẽ là `ProgressSnapshot` của `@csk/shared` khi schema file có (design D2).
 */
export type ImportInspection =
  | { status: 'valid'; snapshot: unknown; preview: ImportPreview }
  | { status: 'rejected'; reason: BackupRejectReason };
