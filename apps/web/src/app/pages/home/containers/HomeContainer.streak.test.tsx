import { mockContentFetch } from '@test/mocks/content-fetch';
import { screen } from '@test/render';
import { openRoute } from '@test/stroke-order-route';
import {
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
});
