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
const TODAY = toLocalDateKey(NOW);
const YESTERDAY = toLocalDateKey(new Date(2026, 10, 17, 9, 0, 0));
const GOAL_REACHED = 'Đã đạt mục tiêu hôm nay';

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
    expect(screen.queryByText(GOAL_REACHED)).not.toBeInTheDocument();
  });

  it('S8.1-AC2 Đã học một phần mục tiêu: should show "Hôm nay: 7 / 15 phút" when 430 seconds are studied today with a 15-minute goal', async () => {
    await seedProgress();
    await seedGoal(15);
    await seedDailyStat(TODAY, 430);

    openRoute('/home');

    expect(await screen.findByText('Hôm nay: 7 / 15 phút')).toBeInTheDocument();
  });

  it('S8.1-AC2 Mục tiêu lưu bị hỏng: should fall back to the 15-minute goal when the saved goal is "abc"', async () => {
    await seedProgress();
    await seedGoal('abc');

    openRoute('/home');

    expect(await screen.findByText('Hôm nay: 0 / 15 phút')).toBeInTheDocument();
  });

  it('S8.1-AC2 Vượt mục tiêu: should show "Hôm nay: 45 / 30 phút" and the goal-reached line when 2700 seconds are studied with a 30-minute goal', async () => {
    await seedProgress();
    await seedGoal(30);
    await seedDailyStat(TODAY, 2700);

    openRoute('/home');

    expect(
      await screen.findByText('Hôm nay: 45 / 30 phút'),
    ).toBeInTheDocument();
    expect(screen.getByText(GOAL_REACHED)).toBeInTheDocument();
  });

  it('S8.1-AC2 Vừa đúng mục tiêu: should show the goal-reached line at exactly 900 seconds of a 15-minute goal', async () => {
    await seedProgress();
    await seedGoal(15);
    await seedDailyStat(TODAY, 900);

    openRoute('/home');

    expect(
      await screen.findByText('Hôm nay: 15 / 15 phút'),
    ).toBeInTheDocument();
    expect(screen.getByText(GOAL_REACHED)).toBeInTheDocument();
  });

  it('S8.1-AC2 Vừa đúng mục tiêu: should not show the goal-reached line at 890 seconds of a 15-minute goal', async () => {
    await seedProgress();
    await seedGoal(15);
    await seedDailyStat(TODAY, 890);

    openRoute('/home');

    expect(
      await screen.findByText('Hôm nay: 14 / 15 phút'),
    ).toBeInTheDocument();
    expect(screen.queryByText(GOAL_REACHED)).not.toBeInTheDocument();
  });

  it('S8.1-AC2 Thời gian học đã lưu bị hỏng: should show "Hôm nay: 0 / 15 phút" without an alert when today\'s saved study time is "abc"', async () => {
    await seedProgress();
    await seedGoal(15);
    await seedDailyStat(TODAY, 'abc');

    openRoute('/home');

    expect(await screen.findByText('Hôm nay: 0 / 15 phút')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('S8.1-AC2 Sang ngày mới đếm lại: should show "Hôm nay: 0 / 15 phút" when only yesterday has 1200 seconds', async () => {
    await seedProgress();
    await seedGoal(15);
    await seedDailyStat(YESTERDAY, 1200);

    openRoute('/home');

    expect(await screen.findByText('Hôm nay: 0 / 15 phút')).toBeInTheDocument();
    expect(screen.queryByText(GOAL_REACHED)).not.toBeInTheDocument();
  });
});
