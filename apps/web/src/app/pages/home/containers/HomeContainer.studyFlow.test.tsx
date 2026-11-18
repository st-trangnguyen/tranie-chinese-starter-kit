import { createDatabase } from '@core/helpers/db.helper';
import { DexieProgressStore } from '@core/services/progress-store.service';
import { ProgressService } from '@shared/services/progress.service';
import { mockContentFetch } from '@test/mocks/content-fetch';
import { act, screen, userEvent, waitFor } from '@test/render';
import {
  openRoute,
  setupStrokeOrderRoute,
  type TestRouter,
} from '@test/stroke-order-route';
import {
  LESSON_TITLES,
  respondToContent,
  seedGoal,
  seedProgress,
} from './home.fixtures';

// Ranh giới ngoài: thư viện vẽ/chấm nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

const env = setupStrokeOrderRoute();

const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const START_TIME = new Date(2026, 10, 18, 9, 0, 0).getTime();
const PERSON = encodeURIComponent('人');
const TODAY_ZERO = 'Hôm nay: 0 / 15 phút';

/** Chờ thật một quãng ngắn để mọi lần ghi/đọc (nếu có) kịp chạy trước khi kiểm tra. */
const settle = (): Promise<void> =>
  act(() => new Promise<void>((resolve) => setTimeout(resolve, 100)));

/** Đặt cờ đã xong onboarding, giữ nguyên các cài đặt khác (để mở được màn onboarding thật). */
const setOnboardingDone = async (isDone: boolean): Promise<void> => {
  const db = createDatabase();
  const store = new DexieProgressStore(db);
  const settings = await store.getSettings();
  await store.saveSettings({ ...settings, hasCompletedOnboarding: isDone });
  db.close();
};

const readTodayMinutes = async (): Promise<number> =>
  (await new ProgressService().getTodayStudy(Date.now())).minutes;

/** Điều hướng trong app (không tải lại trang), ở lại `minutes` phút rồi trả về. */
const stayAt = async (
  router: TestRouter,
  path: string,
  expectScreen: () => Promise<unknown>,
  minutes: number,
): Promise<void> => {
  await act(() => router.navigate(path));
  await expectScreen();
  vi.setSystemTime(Date.now() + minutes * MINUTE);
};

beforeEach(async () => {
  // Chỉ giả Date: timer và promise thật để Dexie (fake-indexeddb), user-event và findBy vẫn chạy.
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(START_TIME);
  const contentFetch = mockContentFetch(respondToContent);
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const response = await contentFetch(input);
    return response.status === 404 ? env.strokeFetch.fetch(input) : response;
  });
  await seedProgress();
  await seedGoal(15);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('HomeContainer — thời gian học khi đi qua các màn', () => {
  it('S8.1-AC2 Học xong quay lại Trang chủ thấy số phút tăng: should show "Hôm nay: 2 / 15 phút" after finishing a lesson in 2 min 10 s and clicking "Trang chủ" on the summary', async () => {
    const user = userEvent.setup();
    const { router } = openRoute('/home');
    expect(await screen.findByText(LESSON_TITLES.l1)).toBeInTheDocument();
    expect(screen.getByText(TODAY_ZERO)).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Vào học' }));
    for (let step = 0; step < 3; step += 1) {
      await user.click(await screen.findByRole('button', { name: 'Thanh 1' }));
      await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    }
    expect(
      await screen.findByText('Bạn đã làm xong các câu của bài này.'),
    ).toBeInTheDocument();

    vi.setSystemTime(START_TIME + 2 * MINUTE + 10 * SECOND);
    await user.click(screen.getByRole('link', { name: 'Trang chủ' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/home'));
    expect(await screen.findByText('Hôm nay: 2 / 15 phút')).toBeInTheDocument();
    expect(screen.queryByText(TODAY_ZERO)).not.toBeInTheDocument();
  });

  it('S8.1-AC2 Màn khác không tính: should keep "Hôm nay: 0 / 15 phút" after time on home, learning path, onboarding, stroke-order and writing-practice screens', async () => {
    const { router } = openRoute('/home');
    expect(await screen.findByText(TODAY_ZERO)).toBeInTheDocument();
    vi.setSystemTime(START_TIME + 2 * MINUTE);

    await stayAt(
      router,
      '/learning-paths',
      () => screen.findByRole('heading', { name: 'Lộ trình học' }),
      3,
    );
    await setOnboardingDone(false);
    await stayAt(
      router,
      '/onboarding',
      () => screen.findByRole('heading', { name: /^Chào mừng đến/ }),
      1,
    );
    await setOnboardingDone(true);
    await stayAt(
      router,
      `/characters/${PERSON}/stroke-order`,
      () =>
        screen.findByRole(
          'img',
          { name: 'Thứ tự nét chữ 人' },
          { timeout: 3000 },
        ),
      1,
    );
    await stayAt(
      router,
      `/characters/${PERSON}/writing-practice`,
      () =>
        screen.findByRole(
          'figure',
          { name: 'Khung viết chữ 人' },
          { timeout: 3000 },
        ),
      1,
    );

    await act(() => router.navigate('/home'));
    expect(await screen.findByText(TODAY_ZERO)).toBeInTheDocument();
    await settle();

    expect(screen.getByText(TODAY_ZERO)).toBeInTheDocument();
    expect(await readTodayMinutes()).toBe(0);
  });
});
