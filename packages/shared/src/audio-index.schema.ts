import { z } from 'zod';

import { audioPathSchema, idSchema } from './content.schema';

/** Giai đoạn Nhập môn: audio các nhóm thuộc giai đoạn này được lưu sẵn (precache). */
export const INTRO_STAGE_ID = 'intro';

/*
 * Danh sách audio theo chủ đề (design D1), pipeline sinh `audio-index.json`, app validate lại
 * khi nạp. Tách khỏi `content.json` để schema lộ trình không đổi vì dữ liệu audio.
 */
export const audioIndexSchema = z
  .object({
    /** unitId → audio các bài của nhóm phát, không trùng, theo thứ tự bài. Nhóm không có audio: []. */
    units: z.record(idSchema, z.array(audioPathSchema)),
    /** audio → số byte của file mp3. */
    bytes: z.record(audioPathSchema, z.number().int().nonnegative()),
    /** Audio của mọi nhóm thuộc giai đoạn INTRO_STAGE_ID: danh sách precache. */
    precached: z.array(audioPathSchema),
  })
  .superRefine((index, ctx) => {
    // Rule: mọi audio được tham chiếu phải có dung lượng (để hiện nhãn và tính tiến độ tải).
    const hasBytes = (path: string): boolean =>
      Object.prototype.hasOwnProperty.call(index.bytes, path);
    Object.entries(index.units).forEach(([unitId, paths]) => {
      paths.forEach((path, position) => {
        if (!hasBytes(path)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['units', unitId, position],
            message: `Audio "${path}" của nhóm "${unitId}" thiếu trong bytes`,
          });
        }
      });
    });
    index.precached.forEach((path, position) => {
      if (!hasBytes(path)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['precached', position],
          message: `Audio precache "${path}" thiếu trong bytes`,
        });
      }
    });
  });
export type AudioIndex = z.infer<typeof audioIndexSchema>;
