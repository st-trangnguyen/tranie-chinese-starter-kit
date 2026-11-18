import { mockContentFetch } from '@test/mocks/content-fetch';
import { act, screen } from '@test/render';
import { openRoute, type TestRouter } from '@test/stroke-order-route';
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
const LATE_TODAY = new Date(2026, 10, 18, 23, 58, 0);
const AFTER_SECOND_MIDNIGHT = new Date(2026, 10, 20, 0, 1, 0);
const dayKey = (offset: number): string =>
  toLocalDateKey(new Date(2026, 10, 18 + offset, 9, 0, 0));
/** 20 phút: đạt mục tiêu 15 phút. */
const REACHED_SECONDS = 1200;
const GOAL_MINUTES = 15;

/** Chờ thật một quãng ngắn để mọi việc làm mới (nếu có) kịp chạy trước khi kiểm tra. */
const settle = (): Promise<void> =>
  act(() => new Promise<void>((resolve) => setTimeout(resolve, 100)));

/** Rời Trang chủ sang bản đồ lộ trình rồi quay về Trang chủ qua router (không tải lại trang). */
const leaveAndReturnHome = async (router: TestRouter): Promise<void> => {
  await act(() => router.navigate('/learning-paths'));
  expect(
    await screen.findByRole('heading', { name: 'Lộ trình học' }),
  ).toBeInTheDocument();
  await act(() => router.navigate('/home'));
};

beforeEach(() => {
  // Chỉ giả Date: timer và promise thật để Dexie (fake-indexeddb) và findBy vẫn chạy.
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(BEFORE_MIDNIGHT);
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    mockContentFetch(respondToContent),
  );
  setPageVisibility(false);
});

afterEach(() => {
  setPageVisibility(false);
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('HomeContainer — streak làm mới khi sang ngày mới', () => {
  it('S8.3-AC2 Quay lại app từ nền qua ngày mới thì cập nhật: should keep "Chuỗi ngày học: 2 ngày" while /home stays visible past midnight and show "Chuỗi ngày học: 0 ngày" after the app is hidden and shown again on the new day', async () => {
    await seedProgress();
    await seedGoal(GOAL_MINUTES);
    await seedDailyStat(dayKey(-3), 0, GOAL_MINUTES);
    await seedDailyStat(dayKey(-2), REACHED_SECONDS, GOAL_MINUTES);
    await seedDailyStat(dayKey(-1), REACHED_SECONDS, GOAL_MINUTES);
    await seedDailyStat(dayKey(0), 0, GOAL_MINUTES);

    openRoute('/home');

    expect(
      await screen.findByText('Chuỗi ngày học: 2 ngày'),
    ).toBeInTheDocument();

    // Trang chủ đang hiện liên tục qua 0:00: không làm mới.
    vi.setSystemTime(AFTER_MIDNIGHT);
    await settle();

    expect(screen.getByText('Chuỗi ngày học: 2 ngày')).toBeInTheDocument();

    // Chuyển app khác rồi quay lại Trang chủ.
    act(() => setPageVisibility(true));
    act(() => setPageVisibility(false));

    expect(
      await screen.findByText('Chuỗi ngày học: 0 ngày'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Chuỗi ngày học: 2 ngày'),
    ).not.toBeInTheDocument();
  });

  it('S8.3-AC1 Ngày mới bắt đầu sau nửa đêm theo giờ máy: should keep "Chuỗi ngày học: 2 ngày" with "Hôm nay: 0 / 15 phút" after 0:00 when yesterday was reached, and show "Chuỗi ngày học: 0 ngày" the day after if the new day was not reached', async () => {
    vi.setSystemTime(LATE_TODAY);
    await seedProgress();
    await seedGoal(GOAL_MINUTES);
    await seedDailyStat(dayKey(-2), 0, GOAL_MINUTES);
    await seedDailyStat(dayKey(-1), REACHED_SECONDS, GOAL_MINUTES);
    await seedDailyStat(dayKey(0), REACHED_SECONDS, GOAL_MINUTES);

    const { router } = openRoute('/home');

    expect(
      await screen.findByText('Chuỗi ngày học: 2 ngày'),
    ).toBeInTheDocument();

    // 0:01 ngày mới, chưa học phút nào: chuỗi vẫn tính đến hôm qua.
    vi.setSystemTime(AFTER_MIDNIGHT);
    await leaveAndReturnHome(router);

    expect(await screen.findByText('Hôm nay: 0 / 15 phút')).toBeInTheDocument();
    expect(screen.getByText('Chuỗi ngày học: 2 ngày')).toBeInTheDocument();

    // Hết ngày đó vẫn chưa đạt: sang ngày kế tiếp chuỗi đứt.
    vi.setSystemTime(AFTER_SECOND_MIDNIGHT);
    await leaveAndReturnHome(router);

    expect(
      await screen.findByText('Chuỗi ngày học: 0 ngày'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Chuỗi ngày học: 2 ngày'),
    ).not.toBeInTheDocument();
  });
});
