import { DEFAULT_SETTINGS } from '@csk/shared';

import { createDatabase } from '@core/helpers/db.helper';
import { DexieProgressStore } from '@core/services/progress-store.service';
import { mockContentFetch } from '@test/mocks/content-fetch';
import { screen, waitFor } from '@test/render';
import { openRoute, stubReducedMotion } from '@test/stroke-order-route';

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
});
