import { mockContentFetch } from '@test/mocks/content-fetch';
import { screen, userEvent, waitFor } from '@test/render';
import { openRoute } from '@test/stroke-order-route';
import {
  LESSON_TITLES,
  respondToContent,
  seedInProgress,
  seedProgress,
} from './home.fixtures';

beforeEach(() => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    mockContentFetch(respondToContent),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

/** Mở Trang chủ, chờ thẻ bài tiếp theo hiện `title`, rồi bấm "Vào học". */
const startNextLesson = async (title: string) => {
  const user = userEvent.setup();
  const { router } = openRoute('/home');
  expect(await screen.findByText(title)).toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: 'Vào học' }));
  return router;
};

describe('HomeContainer — bấm "Vào học"', () => {
  it('S8.1-AC1 Bấm "Vào học" thì vào bài: should open /lessons/<next lesson id> showing that lesson title', async () => {
    await seedProgress(['l1', 'l2']);

    const router = await startNextLesson(LESSON_TITLES.l3);

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/lessons/l3'),
    );
    expect(
      await screen.findByRole('progressbar', { name: /^Câu \d+ \/ 3$/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(LESSON_TITLES.l3)).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 1, name: 'Trang chủ' }),
    ).not.toBeInTheDocument();
  });

  it('S8.1-AC1 Bài tiếp theo đang làm dở: should resume the in-progress next lesson at "Câu 3 / 3"', async () => {
    await seedProgress();
    await seedInProgress('l1', 2);

    const router = await startNextLesson(LESSON_TITLES.l1);

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/lessons/l1'),
    );
    expect(
      await screen.findByRole('progressbar', { name: /^Câu \d+ \/ 3$/ }),
    ).toHaveAccessibleName('Câu 3 / 3');
  });

  it('S8.1-AC1 Bài tiếp theo là bài kiểm tra cuối chủ đề đang làm dở: should restart the in-progress unit test at "Câu 1 / 3"', async () => {
    await seedProgress(['l1', 'l2', 'l3']);
    await seedInProgress('t1', 2);

    const router = await startNextLesson(LESSON_TITLES.t1);

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/lessons/t1'),
    );
    expect(
      await screen.findByRole('progressbar', { name: /^Câu \d+ \/ 3$/ }),
    ).toHaveAccessibleName('Câu 1 / 3');
  });

  it('S8.1-AC1 Dùng được bằng bàn phím: should reach "Vào học" by Tab before "Xem lộ trình" and open the lesson with Enter', async () => {
    await seedProgress(['l1', 'l2']);
    const user = userEvent.setup();
    const { router } = openRoute('/home');
    expect(await screen.findByText(LESSON_TITLES.l3)).toBeInTheDocument();
    const startLink = screen.getByRole('link', { name: 'Vào học' });
    const pathLink = screen.getByRole('link', { name: 'Xem lộ trình' });

    const focusedLinks: Element[] = [];
    for (
      let step = 0;
      step < 10 && document.activeElement !== startLink;
      step += 1
    ) {
      await user.tab();
      if (document.activeElement !== null) {
        focusedLinks.push(document.activeElement);
      }
    }

    expect(startLink).toHaveFocus();
    expect(focusedLinks).not.toContain(pathLink);
    await user.keyboard('{Enter}');

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/lessons/l3'),
    );
    expect(
      await screen.findByRole('progressbar', { name: /^Câu \d+ \/ 3$/ }),
    ).toBeInTheDocument();
  });

  it('S8.1-AC1 Mở bản đồ lộ trình từ Trang chủ: should open /learning-paths showing the "Lộ trình học" heading', async () => {
    await seedProgress(['l1', 'l2']);
    const user = userEvent.setup();
    const { router } = openRoute('/home');
    expect(await screen.findByText(LESSON_TITLES.l3)).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Xem lộ trình' }));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/learning-paths'),
    );
    expect(
      await screen.findByRole('heading', { name: 'Lộ trình học' }),
    ).toBeInTheDocument();
  });
});
