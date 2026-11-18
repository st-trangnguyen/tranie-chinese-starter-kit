import { mockContentFetch } from '@test/mocks/content-fetch';
import { screen, userEvent, waitFor } from '@test/render';
import { openRoute } from '@test/stroke-order-route';
import {
  LESSON_TITLES,
  respondToContent,
  seedDailyStat,
  seedGoal,
  seedProgress,
  toLocalDateKey,
} from './home.fixtures';

const NOW = new Date(2026, 10, 18, 9, 0, 0);
const dayKey = (offset: number): string =>
  toLocalDateKey(new Date(2026, 10, 18 + offset, 9, 0, 0));
/** 20 phút: đạt mục tiêu 15 phút. */
const REACHED_SECONDS = 1200;
const GOAL_MINUTES = 15;
/** 13 phút: còn thiếu 2 phút so với mục tiêu 15 phút. */
const ALMOST_REACHED_SECONDS = 780;
const SECOND = 1_000;
const MINUTE = 60 * SECOND;

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

describe('HomeContainer — chuỗi ngày học', () => {
  it('S8.3-AC2 Trang chủ hiện streak: should show "Chuỗi ngày học: 3 ngày" as readable text when the day before yesterday, yesterday and today all reached the goal', async () => {
    await seedProgress();
    await seedGoal(GOAL_MINUTES);
    await seedDailyStat(dayKey(-3), 0, GOAL_MINUTES);
    await seedDailyStat(dayKey(-2), REACHED_SECONDS, GOAL_MINUTES);
    await seedDailyStat(dayKey(-1), REACHED_SECONDS, GOAL_MINUTES);
    await seedDailyStat(dayKey(0), REACHED_SECONDS, GOAL_MINUTES);

    openRoute('/home');

    const streak = await screen.findByText('Chuỗi ngày học: 3 ngày');
    expect(streak.tagName).toBe('P');
    expect(streak).not.toHaveAttribute('aria-hidden');
    expect(streak.closest('[aria-hidden="true"]')).toBeNull();
  });
  it('S8.3-AC1 Số phút của một ngày đã qua bị hỏng: should show "Chuỗi ngày học: 1 ngày" and "Hôm nay: 20 / 15 phút" without an alert when yesterday\'s saved study time is "abc"', async () => {
    await seedProgress();
    await seedGoal(GOAL_MINUTES);
    await seedDailyStat(dayKey(-2), REACHED_SECONDS, GOAL_MINUTES);
    await seedDailyStat(dayKey(-1), 'abc', GOAL_MINUTES);
    await seedDailyStat(dayKey(0), REACHED_SECONDS, GOAL_MINUTES);

    openRoute('/home');

    expect(
      await screen.findByText('Chuỗi ngày học: 1 ngày'),
    ).toBeInTheDocument();
    expect(screen.getByText('Hôm nay: 20 / 15 phút')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('S8.3-AC2 Streak bằng 0 vẫn hiện: should show "Chuỗi ngày học: 0 ngày" when the day before yesterday had 0 minutes and yesterday and today are below the goal', async () => {
    await seedProgress();
    await seedGoal(GOAL_MINUTES);
    await seedDailyStat(dayKey(-2), 0, GOAL_MINUTES);
    await seedDailyStat(dayKey(-1), 300, GOAL_MINUTES);
    await seedDailyStat(dayKey(0), 180, GOAL_MINUTES);

    openRoute('/home');

    const streak = await screen.findByText('Chuỗi ngày học: 0 ngày');
    expect(streak.tagName).toBe('P');
    expect(streak.closest('[aria-hidden="true"]')).toBeNull();
  });

  it('S8.3-AC2 Streak bằng 0 vẫn hiện: should show "Chuỗi ngày học: 0 ngày" for a new learner who only finished onboarding and has no study days', async () => {
    await seedProgress();

    openRoute('/home');

    const streak = await screen.findByText('Chuỗi ngày học: 0 ngày');
    expect(streak.tagName).toBe('P');
    expect(streak.closest('[aria-hidden="true"]')).toBeNull();
  });

  it('S8.3-AC2 Học đủ mục tiêu rồi quay lại trang chủ thì số tăng ngay: should go from "Chuỗi ngày học: 2 ngày" to "Chuỗi ngày học: 3 ngày" without reloading after studying the missing minutes in a lesson and clicking "Trang chủ" on the summary', async () => {
    await seedProgress();
    await seedGoal(GOAL_MINUTES);
    await seedDailyStat(dayKey(-3), 0, GOAL_MINUTES);
    await seedDailyStat(dayKey(-2), REACHED_SECONDS, GOAL_MINUTES);
    await seedDailyStat(dayKey(-1), REACHED_SECONDS, GOAL_MINUTES);
    await seedDailyStat(dayKey(0), ALMOST_REACHED_SECONDS, GOAL_MINUTES);
    const user = userEvent.setup();

    const { router } = openRoute('/home');
    expect(await screen.findByText(LESSON_TITLES.l1)).toBeInTheDocument();
    expect(
      await screen.findByText('Chuỗi ngày học: 2 ngày'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Vào học' }));
    for (let step = 0; step < 3; step += 1) {
      await user.click(await screen.findByRole('button', { name: 'Thanh 1' }));
      await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    }
    expect(
      await screen.findByText('Bạn đã làm xong các câu của bài này.'),
    ).toBeInTheDocument();

    vi.setSystemTime(NOW.getTime() + 2 * MINUTE + 10 * SECOND);
    await user.click(screen.getByRole('link', { name: 'Trang chủ' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/home'));
    expect(
      await screen.findByText('Chuỗi ngày học: 3 ngày'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Chuỗi ngày học: 2 ngày'),
    ).not.toBeInTheDocument();
  });
});
