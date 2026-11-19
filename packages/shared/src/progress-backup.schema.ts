import { z } from 'zod';

/** Dấu nhận file tiến độ do app xuất (S8.5, design D2). */
export const PROGRESS_BACKUP_FORMAT = 'tranie-chinese-progress';

/** Phiên bản định dạng file tiến độ bản app này đọc được. */
export const PROGRESS_BACKUP_FORMAT_VERSION = 1;

/** Vỏ file sao lưu: chỉ để phân loại file trước khi kiểm chi tiết. */
export const progressBackupEnvelopeSchema = z.object({
  format: z.literal(PROGRESS_BACKUP_FORMAT),
  formatVersion: z.number(),
});

/**
 * File tiến độ phiên bản 1 (design D2).
 * Skeleton RED (tasks 2.9): chưa kiểm field nào, GREEN 2.10 thay bằng schema chặt.
 */
export const progressBackupV1Schema = z.object({}).passthrough();
