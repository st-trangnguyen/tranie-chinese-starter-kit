import { z } from 'zod';

/** Dấu nhận file tiến độ do app xuất (S8.5, design D2). */
export const PROGRESS_BACKUP_FORMAT = 'tranie-chinese-progress';

/** Phiên bản định dạng file tiến độ bản app này đọc được. */
export const PROGRESS_BACKUP_FORMAT_VERSION = 1;

/** Vỏ file sao lưu: chỉ để phân loại file trước khi kiểm chi tiết. */
export const progressBackupEnvelopeSchema = z.unknown();
