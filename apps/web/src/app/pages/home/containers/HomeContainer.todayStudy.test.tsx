import { mockContentFetch } from '@test/mocks/content-fetch';
import { screen } from '@test/render';
import { openRoute } from '@test/stroke-order-route';
import { respondToContent, seedGoal, seedProgress } from './home.fixtures';

const NOW = new Date(2026, 10, 18, 9, 0, 0);

beforeEach(() => {
  // Chỉ giả Date: timer và promise thật để Dexie (fake-indexeddb) và findBy vẫn chạy.
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    mockContentFetch(respondToContent),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('HomeContainer — phút hôm nay', () => {
  it('S8.1-AC2 Chưa học hôm nay: should show "Hôm nay: 0 / 30 phút" without the goal-reached line when nothing is studied today', async () => {
    await seedProgress();
    await seedGoal(30);

    openRoute('/home');

    expect(await screen.findByText('Hôm nay: 0 / 30 phút')).toBeInTheDocument();
    expect(
      screen.queryByText('Đã đạt mục tiêu hôm nay'),
    ).not.toBeInTheDocument();
  });
});
