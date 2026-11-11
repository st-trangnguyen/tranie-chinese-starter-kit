import { z } from 'zod';

/** Số phút học mỗi ngày người học được chọn (S1.3). */
export const DAILY_GOAL_OPTIONS = [15, 30, 60] as const;

export const dailyGoalMinutesSchema = z.union([
  z.literal(DAILY_GOAL_OPTIONS[0]),
  z.literal(DAILY_GOAL_OPTIONS[1]),
  z.literal(DAILY_GOAL_OPTIONS[2]),
]);

export type DailyGoalMinutes = z.infer<typeof dailyGoalMinutesSchema>;

export interface Settings {
  dailyGoalMinutes: DailyGoalMinutes;
  hasCompletedOnboarding: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  dailyGoalMinutes: 15,
  hasCompletedOnboarding: false,
};

/**
 * Mỗi field tự rơi về mặc định khi giá trị lưu bị hỏng, để một key lỗi trong
 * IndexedDB không làm mất các lựa chọn còn lại.
 */
export const settingsSchema = z.object({
  dailyGoalMinutes: dailyGoalMinutesSchema.catch(
    DEFAULT_SETTINGS.dailyGoalMinutes,
  ),
  hasCompletedOnboarding: z
    .boolean()
    .catch(DEFAULT_SETTINGS.hasCompletedOnboarding),
});

/** Trạng thái một bài trên bản đồ lộ trình (S3.1 AC2). Suy ra từ tiến độ, không lưu. */
export type LessonStatus = 'locked' | 'open' | 'completed';

export const parseSettings = (raw: unknown): Settings => {
  const record = typeof raw === 'object' && raw !== null ? raw : {};
  return settingsSchema.parse(record);
};
