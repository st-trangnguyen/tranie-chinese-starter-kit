import { DEFAULT_SETTINGS } from '@csk/shared';

import { createDatabase } from '@core/helpers/db.helper';
import { DexieProgressStore } from '@core/services/progress-store.service';
import { mockContentFetch } from '@test/mocks/content-fetch';
import { screen } from '@test/render';
import { openRoute } from '@test/stroke-order-route';

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

const LESSON_TITLES = {
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

const respondToContent = (input: RequestInfo | URL): Response => {
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
const seedProgress = async (
  completedLessonIds: readonly string[] = [],
): Promise<void> => {
  const db = createDatabase();
  await db.settings.clear();
  await db.lessonProgress.clear();
  await new DexieProgressStore(db).saveSettings({
    ...DEFAULT_SETTINGS,
    hasCompletedOnboarding: true,
  });
  await db.lessonProgress.bulkPut(
    completedLessonIds.map((lessonId) => ({ lessonId, status: 'completed' })),
  );
  db.close();
};

beforeEach(() => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    mockContentFetch(respondToContent),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('HomeContainer — bài tiếp theo', () => {
  it('S8.1-AC1 Chưa học bài nào: should show the first lesson title and a "Vào học" link', async () => {
    await seedProgress();

    openRoute('/home');

    expect(await screen.findByText(LESSON_TITLES.l1)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Vào học' })).toBeInTheDocument();
    expect(screen.queryByText(LESSON_TITLES.l2)).not.toBeInTheDocument();
  });

  it('S8.1-AC1 Đã xong vài bài thì hiện bài kế tiếp: should show the third lesson when lessons 1 and 2 are completed', async () => {
    await seedProgress(['l1', 'l2']);

    openRoute('/home');

    expect(await screen.findByText(LESSON_TITLES.l3)).toBeInTheDocument();
    expect(screen.queryByText(LESSON_TITLES.l1)).not.toBeInTheDocument();
  });

  it('S8.1-AC1 Bài kế tiếp ở nhóm hoặc giai đoạn sau: should show the first lesson of the next unit when a unit is completed', async () => {
    await seedProgress(['l1', 'l2', 'l3', 't1', 'l4', 'l5']);

    openRoute('/home');

    expect(await screen.findByText(LESSON_TITLES.l6)).toBeInTheDocument();
    expect(screen.queryByText(LESSON_TITLES.l1)).not.toBeInTheDocument();
  });

  it('S8.1-AC1 Bài kế tiếp ở nhóm hoặc giai đoạn sau: should show the first lesson of the next stage when the first stage is completed', async () => {
    await seedProgress(['l1', 'l2', 'l3', 't1']);

    openRoute('/home');

    expect(await screen.findByText(LESSON_TITLES.l4)).toBeInTheDocument();
    expect(screen.queryByText(LESSON_TITLES.l1)).not.toBeInTheDocument();
  });

  it('S8.1-AC1 Còn bài đang mở ở trước một bài đã xong: should show the first lesson of the path when only a later unit lesson is completed', async () => {
    await seedProgress(['l4']);

    openRoute('/home');

    expect(await screen.findByText(LESSON_TITLES.l1)).toBeInTheDocument();
    expect(screen.queryByText(LESSON_TITLES.l5)).not.toBeInTheDocument();
  });

  it('S8.1-AC1 Đã học xong mọi bài: should show the path-completed message without a "Vào học" link when every lesson is completed', async () => {
    await seedProgress(Object.keys(LESSON_TITLES));

    openRoute('/home');

    expect(
      await screen.findByText('Bạn đã học xong lộ trình hiện có.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Vào học' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Xem lộ trình' })).toBeInTheDocument();
  });
});
