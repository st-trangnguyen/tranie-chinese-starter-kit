import { DEFAULT_SETTINGS } from '@csk/shared';

import { createDatabase } from '@core/helpers/db.helper';
import { DexieProgressStore } from '@core/services/progress-store.service';

/**
 * Lộ trình giả 2 giai đoạn × 2 nhóm × 2 bài; bài cuối mỗi giai đoạn là bài kiểm tra cuối chủ đề.
 * Mỗi bài có 3 câu để đủ cho các Scenario "đang làm dở tới câu thứ ba".
 */
const CONTENT_ROOT = {
  contentVersion: '0123456789ab',
  stages: [
    {
      id: 'intro',
      title: 'Nhập môn',
      units: [
        { id: 'intro-a', title: 'Phát âm', lessonIds: ['l1', 'l2'] },
        { id: 'intro-b', title: 'Chào hỏi', lessonIds: ['l3', 't1'] },
      ],
    },
    {
      id: 'hsk1',
      title: 'HSK 1',
      units: [
        { id: 'hsk1-a', title: 'Gia đình', lessonIds: ['l4', 'l5'] },
        { id: 'hsk1-b', title: 'Số đếm', lessonIds: ['l6', 't2'] },
      ],
    },
  ],
};

export const LESSON_TITLES = {
  l1: 'Bốn thanh điệu',
  l2: 'Thanh nhẹ',
  l3: 'Xin chào',
  t1: 'Kiểm tra Nhập môn',
  l4: 'Bố mẹ',
  l5: 'Anh chị em',
  l6: 'Từ một đến mười',
  t2: 'Kiểm tra HSK 1',
} as const satisfies Record<string, string>;

type LessonId = keyof typeof LESSON_TITLES;

const isLessonId = (value: string): value is LessonId =>
  Object.hasOwn(LESSON_TITLES, value);

const TEST_LESSON_IDS = new Set(['t1', 't2']);

export const respondToContent = (input: RequestInfo | URL): Response => {
  const url = String(input);
  if (url === '/content/content.json') {
    return Response.json(CONTENT_ROOT);
  }
  const lessonId = /\/content\/lessons\/(.+)\.json$/.exec(url)?.[1];
  if (lessonId === undefined || !isLessonId(lessonId)) {
    return new Response('', { status: 404 });
  }
  return Response.json({
    id: lessonId,
    type: TEST_LESSON_IDS.has(lessonId) ? 'test' : 'lesson',
    title: LESSON_TITLES[lessonId],
    exercises: [
      { id: 'e1', kind: 'tone-choice', wordId: '八' },
      { id: 'e2', kind: 'tone-choice', wordId: '妈' },
      { id: 'e3', kind: 'tone-choice', wordId: '马' },
    ],
  });
};

/** Đã xong onboarding; `completedLessonIds` ghi thẳng vào `lessonProgress` (fake-indexeddb). */
export const seedProgress = async (
  completedLessonIds: readonly string[] = [],
): Promise<void> => {
  const db = createDatabase();
  await db.settings.clear();
  await db.lessonProgress.clear();
  await db.dailyStats.clear();
  await new DexieProgressStore(db).saveSettings({
    ...DEFAULT_SETTINGS,
    hasCompletedOnboarding: true,
  });
  await db.lessonProgress.bulkPut(
    completedLessonIds.map((lessonId) => ({ lessonId, status: 'completed' })),
  );
  db.close();
};

/** Bài `lessonId` đang làm dở, đã lưu vị trí `cursor` (0-based) như khi người học rời bài giữa chừng. */
export const seedInProgress = async (
  lessonId: LessonId,
  cursor: number,
): Promise<void> => {
  const db = createDatabase();
  await db.lessonProgress.put({ lessonId, status: 'in-progress', cursor });
  db.close();
};

/** Khóa ngày `YYYY-MM-DD` theo giờ máy của thời điểm `time`, như khi người học xem "hôm nay". */
export const toLocalDateKey = (time: Date): string => {
  const pad = (value: number): string => String(value).padStart(2, '0');
  return `${time.getFullYear()}-${pad(time.getMonth() + 1)}-${pad(time.getDate())}`;
};

/** Mục tiêu mỗi ngày đã lưu; `unknown` để ghi được cả giá trị hỏng (ví dụ `'abc'`). */
export const seedGoal = async (dailyGoalMinutes: unknown): Promise<void> => {
  const db = createDatabase();
  await db.settings.put({ key: 'dailyGoalMinutes', value: dailyGoalMinutes });
  db.close();
};

/** Số giây đã học của ngày `date` (`YYYY-MM-DD`); `unknown` để ghi được cả dòng hỏng. */
export const seedDailyStat = async (
  date: string,
  studySeconds: unknown,
): Promise<void> => {
  const db = createDatabase();
  await db.dailyStats.put({ date, studySeconds });
  db.close();
};
