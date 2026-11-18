import { mockContentFetch } from '@test/mocks/content-fetch';
import { act, screen, waitFor } from '@test/render';
import { openRoute } from '@test/stroke-order-route';
import { setPageVisibility } from '@test/visibility.helpers';
import {
  respondToContent,
  seedDailyStat,
  seedGoal,
  seedProgress,
  toLocalDateKey,
} from './home.fixtures';

const BEFORE_MIDNIGHT = new Date(2026, 10, 18, 23, 59, 0);
const AFTER_MIDNIGHT = new Date(2026, 10, 19, 0, 1, 0);
const TODAY = toLocalDateKey(BEFORE_MIDNIGHT);
const GOAL_REACHED = 'Đã đạt mục tiêu hôm nay';

/** Chờ thật một quãng ngắn để mọi việc làm mới (nếu có) kịp chạy trước khi kiểm tra. */
const settle = (): Promise<void> =>
  act(() => new Promise<void>((resolve) => setTimeout(resolve, 100)));

beforeEach(async () => {
  // Chỉ giả Date: timer và promise thật để Dexie (fake-indexeddb) và findBy vẫn chạy.
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(BEFORE_MIDNIGHT);
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    mockContentFetch(respondToContent),
  );
  setPageVisibility(false);
  await seedProgress();
  await seedGoal(15);
  await seedDailyStat(TODAY, 1200);
});

afterEach(() => {
  setPageVisibility(false);
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('HomeContainer — qua nửa đêm', () => {
  it('S8.1-AC2 Để Trang chủ mở qua nửa đêm: should keep "Hôm nay: 20 / 15 phút" past midnight and show "Hôm nay: 0 / 15 phút" after leaving and returning to /home', async () => {
    const { router } = openRoute('/home');

    expect(
      await screen.findByText('Hôm nay: 20 / 15 phút'),
    ).toBeInTheDocument();

    vi.setSystemTime(AFTER_MIDNIGHT);
    await settle();

    expect(screen.getByText('Hôm nay: 20 / 15 phút')).toBeInTheDocument();

    await act(() => router.navigate('/learning-paths'));
    await waitFor(() =>
      expect(screen.queryByText(/^Hôm nay:/)).not.toBeInTheDocument(),
    );
    await act(() => router.navigate('/home'));

    expect(await screen.findByText('Hôm nay: 0 / 15 phút')).toBeInTheDocument();
    expect(screen.queryByText(GOAL_REACHED)).not.toBeInTheDocument();
  });

  it('S8.1-AC2 Trang chủ hiện lại sau khi app bị ẩn qua nửa đêm: should show "Hôm nay: 0 / 15 phút" without the goal-reached line when /home becomes visible again after midnight', async () => {
    openRoute('/home');

    expect(
      await screen.findByText('Hôm nay: 20 / 15 phút'),
    ).toBeInTheDocument();
    expect(screen.getByText(GOAL_REACHED)).toBeInTheDocument();

    act(() => setPageVisibility(true));
    vi.setSystemTime(AFTER_MIDNIGHT);
    act(() => setPageVisibility(false));

    expect(await screen.findByText('Hôm nay: 0 / 15 phút')).toBeInTheDocument();
    expect(screen.queryByText(GOAL_REACHED)).not.toBeInTheDocument();
  });
});
