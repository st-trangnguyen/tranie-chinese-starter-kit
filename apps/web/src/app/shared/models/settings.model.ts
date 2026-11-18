import type { Settings } from '@csk/shared';

/** Tùy chọn học hiện trên màn Cài đặt (S8.2). */
export type LearningPreferences = Pick<
  Settings,
  'dailyGoalMinutes' | 'defaultAudioSpeed' | 'isPinyinVisible'
>;

/** Tùy chọn áp dụng khi mở một bài học (S8.2 AC2, AC3). */
export interface LessonPreferences {
  isSlowAudio: boolean;
  isPinyinVisible: boolean;
}
