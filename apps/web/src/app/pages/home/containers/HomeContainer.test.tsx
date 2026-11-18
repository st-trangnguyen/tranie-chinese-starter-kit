import { createDatabase } from '@core/helpers/db.helper';
import { mockContentFetch } from '@test/mocks/content-fetch';
import { screen } from '@test/render';
import { openRoute } from '@test/stroke-order-route';
import { LESSON_TITLES, respondToContent, seedProgress } from './home.fixtures';

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
    expect(
      screen.queryByRole('link', { name: 'Vào học' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Xem lộ trình' }),
    ).toBeInTheDocument();
  });

  it('S8.1-AC1 Tiến độ lưu bị hỏng: should show the first lesson without an alert when its stored progress row is malformed', async () => {
    await seedProgress(['l2']);
    const db = createDatabase();
    await db.table('lessonProgress').put({ lessonId: 'l1', status: 'xyz' });
    db.close();

    openRoute('/home');

    expect(await screen.findByText(LESSON_TITLES.l1)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Vào học' })).toBeInTheDocument();
    expect(screen.queryByText(LESSON_TITLES.l3)).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('S8.1-AC1 (D6) nạp lộ trình lỗi thì báo lỗi, vẫn có "Xem lộ trình": should show the load error alert instead of the next lesson card', async () => {
    await seedProgress();
    vi.mocked(globalThis.fetch).mockImplementation(
      mockContentFetch((input) =>
        String(input) === '/content/content.json'
          ? new Response('', { status: 500 })
          : respondToContent(input),
      ),
    );

    openRoute('/home');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Chưa tải được bài tiếp theo.',
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByText('Đang tải…')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Vào học' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Xem lộ trình' })).toHaveAttribute(
      'href',
      '/learning-paths',
    );
  });
});
