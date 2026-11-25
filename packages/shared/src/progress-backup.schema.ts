import { z } from 'zod';

import {
  type DailyStat,
  type LessonProgress,
  type Settings,
  dailyStatStrictSchema,
  lessonProgressStrictSchema,
  localDateKeySchema,
  settingsStrictSchema,
} from './progress.schema';
import {
  type ReviewCard,
  reviewCardId,
  reviewCardSchema,
} from './review-card.schema';
import { hanCharacterSchema } from './stroke.schema';

/** Dấu nhận file tiến độ do app xuất (S8.5, design D2). */
export const PROGRESS_BACKUP_FORMAT = 'tranie-chinese-progress';

/** Phiên bản định dạng file tiến độ bản app này đọc được. */
export const PROGRESS_BACKUP_FORMAT_VERSION = 2;

/** Vỏ file sao lưu: chỉ để phân loại file trước khi kiểm chi tiết. */
export const progressBackupEnvelopeSchema = z.object({
  format: z.literal(PROGRESS_BACKUP_FORMAT),
  formatVersion: z.number(),
});

/** `YYYY-MM-DD` là một ngày có thật trên lịch (không có tháng 13, ngày 45). */
const isRealCalendarDate = (key: string): boolean => {
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const hasNoDuplicates = (keys: readonly string[]): boolean =>
  new Set(keys).size === keys.length;

/**
 * File tiến độ phiên bản 1 (design D2). Không `.catch` ở đâu: một field sai là cả file sai.
 * `lessonId` lạ vẫn hợp lệ; `dailyStats[].date` chỉ kiểm dạng như DB để file vừa xuất luôn nhập lại được.
 */
export const progressBackupV1Schema = z.object({
  format: z.literal(PROGRESS_BACKUP_FORMAT),
  formatVersion: z.literal(1),
  exportedOn: localDateKeySchema.refine(isRealCalendarDate),
  settings: settingsStrictSchema,
  lessonProgress: z
    .array(lessonProgressStrictSchema)
    .refine((rows) => hasNoDuplicates(rows.map((row) => row.lessonId))),
  dailyStats: z
    .array(dailyStatStrictSchema)
    .refine((rows) => hasNoDuplicates(rows.map((row) => row.date))),
});

/**
 * File tiến độ phiên bản 2 (S9.1, design D6): thêm thẻ ôn tập và chữ đã viết.
 * Một thẻ sai là cả file sai; thẻ của từ lạ vẫn hợp lệ (không đối chiếu nội dung).
 */
export const progressBackupV2Schema = progressBackupV1Schema.extend({
  formatVersion: z.literal(2),
  cards: z
    .array(reviewCardSchema)
    .refine((cards) =>
      hasNoDuplicates(
        cards.map((card) => reviewCardId(card.wordId, card.facet)),
      ),
    ),
  writtenCharacters: z.array(hanCharacterSchema),
});

/** Toàn bộ tiến độ trên máy, đọc/ghi một lần (S8.5, S9.1). */
export interface ProgressSnapshot {
  settings: Settings;
  lessonProgress: LessonProgress[];
  dailyStats: DailyStat[];
  cards: ReviewCard[];
  writtenCharacters: string[];
}

/** Nội dung file sao lưu: tiến độ kèm dấu nhận, phiên bản và ngày xuất. */
export type ProgressBackupFile = ProgressSnapshot & {
  format: typeof PROGRESS_BACKUP_FORMAT;
  formatVersion: typeof PROGRESS_BACKUP_FORMAT_VERSION;
  exportedOn: string;
};
