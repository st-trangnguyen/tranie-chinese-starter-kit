export const APP_NAME = 'Tranie Chinese';

/** Bài đầu tiên của giai đoạn Nhập môn, nơi người học vào sau onboarding (S1.3 AC4). */
export const FIRST_LESSON_ID = 'intro-01';

export const ROUTE_PATHS = {
  onboarding: '/onboarding',
  learningPaths: '/learning-paths',
  lesson: (lessonId: string): string => `/lessons/${lessonId}`,
} as const;
