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
      units: [{ id: 'intro-a', title: 'Phát âm', lessonIds: ['l1', 'l2'] }],
    },
  ],
};

const LESSON_TITLES: Record<string, string> = {
  l1: 'Bốn thanh điệu',
  l2: 'Thanh nhẹ',
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

const MAX_TAB_STEPS = 20;

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

describe('LearningPathContainer — liên kết Trang chủ', () => {
  it('S8.1-AC1 Từ bản đồ lộ trình về Trang chủ: should show a keyboard-reachable "Trang chủ" link that goes to /home when clicked', async () => {
    const { user } = renderPath();
    expect(
      await screen.findByRole('link', { name: /Bốn thanh điệu/ }),
    ).toBeInTheDocument();

    const homeLink = screen.getByRole('link', { name: 'Trang chủ' });

    for (
      let step = 0;
      step < MAX_TAB_STEPS && document.activeElement !== homeLink;
      step += 1
    ) {
      await user.tab();
    }
    expect(homeLink).toHaveFocus();

    await user.click(homeLink);

    expect(await screen.findByTestId('location')).toHaveTextContent(/^\/home$/);
  });
});
