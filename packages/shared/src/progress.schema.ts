import { z } from 'zod';

/** Số phút học mỗi ngày người học được chọn (S1.3). */
export const DAILY_GOAL_OPTIONS = [15, 30, 60] as const;

export const dailyGoalMinutesSchema = z.union([
  z.literal(DAILY_GOAL_OPTIONS[0]),
  z.literal(DAILY_GOAL_OPTIONS[1]),
  z.literal(DAILY_GOAL_OPTIONS[2]),
]);

export type DailyGoalMinutes = z.infer<typeof dailyGoalMinutesSchema>;

/** Tốc độ phát audio mặc định người học chọn trong Cài đặt (S8.2). */
export const AUDIO_SPEED_OPTIONS = ['normal', 'slow'] as const;

export const audioSpeedSchema = z.enum(AUDIO_SPEED_OPTIONS);

export type AudioSpeed = z.infer<typeof audioSpeedSchema>;

export interface Settings {
  dailyGoalMinutes: DailyGoalMinutes;
  hasCompletedOnboarding: boolean;
  defaultAudioSpeed: AudioSpeed;
  isPinyinVisible: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  dailyGoalMinutes: 15,
  hasCompletedOnboarding: false,
  defaultAudioSpeed: 'normal',
  isPinyinVisible: true,
};

/**
 * Nguồn field duy nhất của `Settings` cho bản chặt (file sao lưu) và bản khoan dung (đọc DB).
 * Thêm field vào `Settings` mà quên schema ở đây là lỗi typecheck.
 */
export const settingsFieldSchemas = {
  dailyGoalMinutes: dailyGoalMinutesSchema,
  hasCompletedOnboarding: z.boolean(),
  defaultAudioSpeed: audioSpeedSchema,
  isPinyinVisible: z.boolean(),
} satisfies { [K in keyof Settings]: z.ZodType<Settings[K]> };

/** Cài đặt trong file sao lưu (S8.5): một field sai là cả cài đặt sai. */
export const settingsStrictSchema = z.object(
  settingsFieldSchemas,
) satisfies z.ZodType<Settings, z.ZodTypeDef, unknown>;

/**
 * Mỗi field tự rơi về mặc định khi giá trị lưu bị hỏng, để một key lỗi trong
 * IndexedDB không làm mất các lựa chọn còn lại.
 */
export const settingsSchema = z.object({
  dailyGoalMinutes: settingsFieldSchemas.dailyGoalMinutes.catch(
    DEFAULT_SETTINGS.dailyGoalMinutes,
  ),
  hasCompletedOnboarding: settingsFieldSchemas.hasCompletedOnboarding.catch(
    DEFAULT_SETTINGS.hasCompletedOnboarding,
  ),
  defaultAudioSpeed: settingsFieldSchemas.defaultAudioSpeed.catch(
    DEFAULT_SETTINGS.defaultAudioSpeed,
  ),
  isPinyinVisible: settingsFieldSchemas.isPinyinVisible.catch(
    DEFAULT_SETTINGS.isPinyinVisible,
  ),
}) satisfies z.ZodType<Settings, z.ZodTypeDef, unknown>;

export const LESSON_PROGRESS_STATUSES = ['in-progress', 'completed'] as const;

/**
 * Tiến độ một bài lưu trong bảng `lessonProgress` (docs/03-architecture.md §6.2).
 * `cursor` (S3.3) là chỉ số câu 0-based; giá trị hỏng thành `undefined` để không mất cả dòng.
 * `bestScore` (S3.4) thêm khi tới story đó.
 */
export const lessonProgressStrictSchema = z.object({
  lessonId: z.string().trim().min(1),
  status: z.enum(LESSON_PROGRESS_STATUSES),
  cursor: z.number().int().min(0).optional(),
});

/** Bản đọc DB: `cursor` hỏng thành `undefined` thay vì làm hỏng cả dòng. */
export const lessonProgressSchema = lessonProgressStrictSchema.extend({
  cursor: lessonProgressStrictSchema.shape.cursor.catch(undefined),
});
export type LessonProgress = z.infer<typeof lessonProgressSchema>;

/** Khóa ngày theo giờ máy, dạng `YYYY-MM-DD` (S8.1). */
export const localDateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/**
 * Số giây đã học trong một ngày (S8.1), lưu trong bảng `dailyStats`.
 * `studySeconds` là số thực để giữ phần lẻ dưới 1 giây giữa các lần ghi.
 * `goalMinutes` là mục tiêu của chính ngày đó (S8.3); thiếu hoặc hỏng thành `undefined`
 * mà không làm hỏng cả dòng (ngày ghi trước S8.3 không có mục tiêu).
 */
export const dailyStatStrictSchema = z.object({
  date: localDateKeySchema,
  studySeconds: z.number().finite().nonnegative(),
  goalMinutes: dailyGoalMinutesSchema.optional(),
});

/** Bản đọc DB: `goalMinutes` hỏng thành `undefined` thay vì làm hỏng cả dòng. */
export const dailyStatSchema = dailyStatStrictSchema.extend({
  goalMinutes: dailyStatStrictSchema.shape.goalMinutes.catch(undefined),
});
export type DailyStat = z.infer<typeof dailyStatSchema>;

/** Trạng thái một bài trên bản đồ lộ trình (S3.1 AC2). Suy ra từ tiến độ, không lưu. */
export type LessonStatus = 'locked' | 'open' | 'completed';

export const parseSettings = (raw: unknown): Settings => {
  const record = typeof raw === 'object' && raw !== null ? raw : {};
  return settingsSchema.parse(record);
};
