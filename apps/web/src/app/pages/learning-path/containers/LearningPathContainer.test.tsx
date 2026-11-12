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

  it('S3.1-AC2: should label each lesson as completed, open or locked', async () => {
    await db.lessonProgress.put({ lessonId: 'l1', status: 'completed' });
    renderPath();

    const lessons = await screen.findAllByRole('listitem');
    expect(lessons[0]).toHaveTextContent('Đã xong');
    expect(lessons[1]).toHaveTextContent('Đang mở');
    expect(lessons[2]).toHaveTextContent('Đã khóa');
    expect(lessons[3]).toHaveTextContent('Đã khóa');
  });

  it('S3.1-AC2: should treat corrupted progress as not completed', async () => {
    await db.lessonProgress.put({ lessonId: 'l1', status: 'done' });
    renderPath();

    const lessons = await screen.findAllByRole('listitem');
    expect(lessons[0]).toHaveTextContent('Đang mở');
    expect(lessons[1]).toHaveTextContent('Đã khóa');
  });

  it('S3.1-AC3: should stay on the learning path when a locked lesson is clicked', async () => {
    const { user } = renderPath();

    const lockedLesson = await screen.findByText('Thanh nhẹ');
    await user.click(lockedLesson);

    expect(screen.queryByTestId('location')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Lộ trình học' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /Thanh nhẹ/ }),
    ).not.toBeInTheDocument();
  });

  it('S3.1-AC3: should open the lesson route when an open lesson is clicked', async () => {
    const { user } = renderPath();

    await user.click(
      await screen.findByRole('link', { name: /Bốn thanh điệu/ }),
    );

    expect(screen.getByTestId('location')).toHaveTextContent('/lessons/l1');
  });
});

describe('LearningPathContainer placement test button', () => {
  const mockContent = (
    units: { id: string; title: string; lessonIds: string[] }[],
    testLessonIds: string[],
  ): void => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url === '/content/content.json') {
        return Response.json({
          contentVersion: '0123456789ab',
          stages: [{ id: 'hsk1', title: 'HSK 1', units }],
        });
      }
      const lessonId = /\/content\/lessons\/(.+)\.json$/.exec(url)?.[1] ?? '';
      return Response.json({
        id: lessonId,
        type: testLessonIds.includes(lessonId) ? 'test' : 'lesson',
        title: `Bài ${lessonId}`,
        exercises: [{ id: 'e1', kind: 'tone-choice', wordId: '八' }],
      });
    });
  };

  it('S3.6-AC1: should show the placement test button on a locked unit that has a test', async () => {
    mockContent(
      [
        { id: 'unit-a', title: 'Chủ đề A', lessonIds: ['a1', 'a-test'] },
        { id: 'unit-b', title: 'Chủ đề B', lessonIds: ['b1', 'b-test'] },
      ],
      ['a-test', 'b-test'],
    );
    renderPath();

    const buttons = await screen.findAllByRole('link', {
      name: 'Kiểm tra vượt cấp',
    });
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveAttribute('href', '/units/unit-b/placement-test');
  });

  it('S3.6-AC1: should not show the placement test button on an open unit', async () => {
    mockContent(
      [{ id: 'unit-a', title: 'Chủ đề A', lessonIds: ['a1', 'a-test'] }],
      ['a-test'],
    );
    renderPath();

    expect(await screen.findByText('Bài a1')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Kiểm tra vượt cấp' }),
    ).not.toBeInTheDocument();
  });

  it('S3.6-AC1: should keep locked lessons of a unit with the button unreachable', async () => {
    mockContent(
      [
        { id: 'unit-a', title: 'Chủ đề A', lessonIds: ['a1'] },
        { id: 'unit-b', title: 'Chủ đề B', lessonIds: ['b1', 'b-test'] },
      ],
      ['b-test'],
    );
    const { user } = renderPath();

    expect(
      await screen.findByRole('link', { name: 'Kiểm tra vượt cấp' }),
    ).toBeInTheDocument();
    await user.click(screen.getByText('Bài b1'));

    expect(screen.queryByTestId('location')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Lộ trình học' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /Bài b1/ }),
    ).not.toBeInTheDocument();
  });
});
