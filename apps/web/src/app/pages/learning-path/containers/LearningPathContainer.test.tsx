import { renderWithProviders, screen } from '@test/render';
import { DB_NAME } from '@core/constants/db.constants';
import { createDatabase } from '@core/helpers/db.helper';
import LearningPathContainer from './LearningPathContainer';

const CONTENT_ROOT = {
  contentVersion: '0123456789ab',
  stages: [
    {
      id: 'intro',
      title: 'Nhập môn',
      units: [
        { id: 'intro-a', title: 'Phát âm', lessonIds: ['l1', 'l2'] },
        { id: 'intro-b', title: 'Chào hỏi', lessonIds: ['l3'] },
      ],
    },
    {
      id: 'hsk1',
      title: 'HSK 1',
      units: [{ id: 'hsk1-a', title: 'Gia đình', lessonIds: ['l4'] }],
    },
  ],
};

const LESSON_TITLES: Record<string, string> = {
  l1: 'Bốn thanh điệu',
  l2: 'Thanh nhẹ',
  l3: 'Xin chào',
  l4: 'Bố mẹ',
};

const respondToContent = (url: string): Response => {
  if (url === '/content/content.json') {
    return Response.json(CONTENT_ROOT);
  }
  const lessonId = /\/content\/lessons\/(.+)\.json$/.exec(url)?.[1] ?? '';
  return Response.json({
    id: lessonId,
    type: 'lesson',
    title: LESSON_TITLES[lessonId] ?? lessonId,
    exercises: [{ id: 'e1', kind: 'tone-choice', wordId: '八' }],
  });
};

const db = createDatabase(DB_NAME);

const renderPath = () =>
  renderWithProviders(<LearningPathContainer />, { route: '/learning-paths' });

beforeEach(() => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) =>
    respondToContent(String(input)),
  );
});

afterEach(async () => {
  vi.restoreAllMocks();
  await db.lessonProgress.clear();
});

describe('LearningPathContainer', () => {
  it('S3.1-AC1: should show stages, units and lessons in path order', async () => {
    renderPath();

    const stages = await screen.findAllByRole('heading', { level: 2 });
    expect(stages.map((heading) => heading.textContent)).toEqual([
      'Nhập môn',
      'HSK 1',
    ]);
    expect(
      screen
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual(['Phát âm', 'Chào hỏi', 'Gia đình']);
    const lessons = screen.getAllByRole('listitem');
    expect(lessons).toHaveLength(4);
    ['Bốn thanh điệu', 'Thanh nhẹ', 'Xin chào', 'Bố mẹ'].forEach(
      (title, index) => expect(lessons[index]).toHaveTextContent(title),
    );
  });
});
