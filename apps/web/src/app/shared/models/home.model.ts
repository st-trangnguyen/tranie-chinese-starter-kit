import type { DailyGoalMinutes } from '@csk/shared';

export interface StudyTimeShare {
  date: string;
  seconds: number;
}

export interface TodayStudy {
  minutes: number;
  goalMinutes: DailyGoalMinutes;
  isGoalReached: boolean;
}

/** Bài tiếp theo trên Trang chủ (S8.1 AC1). */
export type NextLesson =
  | { status: 'available'; lessonId: string; title: string }
  | { status: 'all-completed' };
