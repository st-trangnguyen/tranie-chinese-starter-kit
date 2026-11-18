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
