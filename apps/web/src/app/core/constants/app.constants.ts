export const APP_NAME = 'Tranie Chinese';

/** Bài đầu tiên của giai đoạn Nhập môn, nơi người học vào sau onboarding (S1.3 AC4). */
export const FIRST_LESSON_ID = 'intro-01';

export const ROUTE_PATHS = {
  home: '/home',
  onboarding: '/onboarding',
  learningPaths: '/learning-paths',
  settings: '/settings',
  lesson: (lessonId: string): string => `/lessons/${lessonId}`,
  placementTest: (unitId: string): string => `/units/${unitId}/placement-test`,
  strokeOrder: (character: string): string =>
    `/characters/${encodeURIComponent(character)}/stroke-order`,
  writingPractice: (character: string): string =>
    `/characters/${encodeURIComponent(character)}/writing-practice`,
} as const;
