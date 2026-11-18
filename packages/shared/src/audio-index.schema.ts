import { z } from 'zod';

/** Giai đoạn Nhập môn: audio các nhóm thuộc giai đoạn này được lưu sẵn (precache). */
export const INTRO_STAGE_ID = 'intro';

/*
 * Danh sách audio theo chủ đề (design D1), pipeline sinh `audio-index.json`.
 * Skeleton (task 1.1): chưa có ràng buộc; task 1.2 thêm kiểu, regex path, byte nguyên không âm
 * và kiểm path trong `units`/`precached` phải có trong `bytes`.
 */
export const audioIndexSchema = z.object({
  units: z.unknown(),
  bytes: z.unknown(),
  precached: z.unknown(),
});
