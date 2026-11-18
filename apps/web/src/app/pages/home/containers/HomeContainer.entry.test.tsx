import { DEFAULT_SETTINGS } from '@csk/shared';

import { createDatabase } from '@core/helpers/db.helper';
import { DexieProgressStore } from '@core/services/progress-store.service';
import { mockContentFetch } from '@test/mocks/content-fetch';
import { screen, userEvent, waitFor } from '@test/render';
import {
  openRoute,
  stubReducedMotion,
  type TestRouter,
} from '@test/stroke-order-route';

const FIRST_LESSON_TITLE = 'Bài mở đầu';

/** Phục vụ mọi file bài học bằng một bài có tiêu đề nhận ra được; còn lại 404. */
const serveContent = (): void => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    mockContentFetch(async (input) =>
      /\/content\/lessons\/.+\.json$/.test(String(input))
        ? Response.json({
            id: 'intro-01',
            type: 'lesson',
            title: FIRST_LESSON_TITLE,
            exercises: [{ id: 'e1', kind: 'tone-choice', wordId: '八' }],
          })
        : new Response('', { status: 404 }),
    ),
  );
};

/** Ghi settings vào IndexedDB thật (fake-indexeddb) của app; xoá dữ liệu cũ trước. */
const seedSettings = async (hasCompletedOnboarding: boolean): Promise<void> => {
  const db = createDatabase();
  await db.settings.clear();
  await db.lessonProgress.clear();
  await new DexieProgressStore(db).saveSettings({
    ...DEFAULT_SETTINGS,
    hasCompletedOnboarding,
  });
  db.close();
};

/** Giả trình duyệt đang chạy app như PWA đã cài: chỉ query display-mode standalone khớp. */
const stubStandalone = (): void => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => true,
    })),
  );
};

/** Ghi lại mọi pathname router đi qua (kể cả điểm xuất phát). */
const trackPathnames = (router: TestRouter): string[] => {
  const pathnames = [router.state.location.pathname];
  router.subscribe((state) => {
    pathnames.push(state.location.pathname);
  });
  return pathnames;
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Mở app — Trang chủ', () => {
  it('S8.1-AC1 Mở lại app sau onboarding thì vào Trang chủ: should land on /home with the "Trang chủ" heading, not lesson 1', async () => {
    await seedSettings(true);
    serveContent();

    const { router } = openRoute('/');

    await waitFor(() => expect(router.state.location.pathname).not.toBe('/'));
    expect(router.state.location.pathname).toBe('/home');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Trang chủ' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(FIRST_LESSON_TITLE)).not.toBeInTheDocument();
  });

  it('S8.1-AC1 Mở màn onboarding khi đã xong: should redirect /onboarding to /home without any onboarding step', async () => {
    await seedSettings(true);
    serveContent();
    // Màn onboarding đọc chế độ standalone qua matchMedia (jsdom không có): giả ranh giới trình duyệt.
    stubReducedMotion(false);

    const { router } = openRoute('/onboarding');

    await waitFor(() =>
      expect(router.state.location.pathname).not.toBe('/onboarding'),
    );
    expect(router.state.location.pathname).toBe('/home');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Trang chủ' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /Chào mừng đến/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Mỗi ngày bạn muốn học bao lâu?' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Cài app lên màn hình chính' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Bắt đầu' }),
    ).not.toBeInTheDocument();
  });
  it('S8.1-AC1 Tải lại ở màn khác thì vẫn ở màn đó: should stay on /learning-paths when opened directly', async () => {
    await seedSettings(true);
    serveContent();

    const { router } = openRoute('/learning-paths');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Lộ trình học' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/learning-paths');
    expect(
      screen.queryByRole('heading', { level: 1, name: 'Trang chủ' }),
    ).not.toBeInTheDocument();
  });

  it('S8.1-AC1 Tải lại ở màn khác thì vẫn ở màn đó: should stay on /lessons/intro-01 when opened directly', async () => {
    await seedSettings(true);
    serveContent();

    const { router } = openRoute('/lessons/intro-01');

    expect(await screen.findByText(FIRST_LESSON_TITLE)).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/lessons/intro-01');
    expect(
      screen.queryByRole('heading', { level: 1, name: 'Trang chủ' }),
    ).not.toBeInTheDocument();
  });

  it.each([
    {
      branch: 'chưa cài: bấm "Vào học" ở bước cài app',
      isStandalone: false,
      finishLabel: 'Vào học',
    },
    {
      branch: 'đã cài: bấm "Tiếp tục" ở bước mục tiêu',
      isStandalone: true,
      finishLabel: 'Tiếp tục',
    },
  ])(
    'S8.1-AC1 Vừa xong onboarding vẫn vào bài 1 ($branch): should go to /lessons/intro-01 without passing /home',
    async ({ isStandalone, finishLabel }) => {
      await seedSettings(false);
      serveContent();
      if (isStandalone) {
        stubStandalone();
      } else {
        stubReducedMotion(false);
      }
      const user = userEvent.setup();

      const { router } = openRoute('/');
      const pathnames = trackPathnames(router);

      await user.click(await screen.findByRole('button', { name: 'Bắt đầu' }));
      // Bước mục tiêu: đã cài thì "Tiếp tục" là nút cuối; chưa cài thì còn bước cài app.
      await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));
      if (!isStandalone) {
        await screen.findByRole('heading', {
          name: 'Cài app lên màn hình chính',
        });
        await user.click(screen.getByRole('button', { name: finishLabel }));
      }

      await waitFor(() =>
        expect(router.state.location.pathname).toBe('/lessons/intro-01'),
      );
      expect(await screen.findByText(FIRST_LESSON_TITLE)).toBeInTheDocument();
      expect(pathnames).not.toContain('/home');
      expect(
        screen.queryByRole('heading', { level: 1, name: 'Trang chủ' }),
      ).not.toBeInTheDocument();
    },
  );
});
