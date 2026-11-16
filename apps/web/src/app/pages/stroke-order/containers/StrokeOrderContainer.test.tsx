import { Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Outlet, RouterProvider, createMemoryRouter } from 'react-router-dom';
import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderChildren } from '@core/modules/custom-router-dom/RouterOutlet';
import testI18n from '@test/i18n';
import { FakeHanziWriter } from '@test/mocks/hanzi-writer';
import {
  mockStrokeFetch,
  type StrokeFetchMock,
} from '@test/mocks/stroke-fetch';
import { screen } from '@test/render';
import strokeIndex from '@assets/content/strokes/index.json';
import pageRoutes from '../../page.routes';

// Ranh giới ngoài: thư viện vẽ nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// Trình duyệt không bật giảm chuyển động.
const stubReducedMotion = (matches: boolean): void => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query === REDUCED_MOTION_QUERY ? matches : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  );
};

/** Mở một địa chỉ qua đúng bảng route của app (cùng cấu trúc Root trong App.tsx). */
const openRoute = (path: string) => {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        ),
        children: renderChildren(pageRoutes),
      },
    ],
    { initialEntries: [path] },
  );
  return render(
    <I18nextProvider i18n={testI18n}>
      <RouterProvider router={router} />
    </I18nextProvider>,
  );
};

let strokeFetch: StrokeFetchMock;

beforeEach(() => {
  FakeHanziWriter.reset();
  stubReducedMotion(false);
  strokeFetch = mockStrokeFetch();
  vi.spyOn(globalThis, 'fetch').mockImplementation(strokeFetch.fetch);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('StrokeOrderContainer', () => {
  it('S6.1-AC1 Màn chỉ hiện một chữ: should show only the stroke-order figure of 好 when opening /characters/好/stroke-order', async () => {
    openRoute(`/characters/${encodeURIComponent('好')}/stroke-order`);

    const figure = await screen.findByRole(
      'img',
      { name: 'Thứ tự nét chữ 好' },
      { timeout: 3000 },
    );

    // Đúng một khối chữ trên màn.
    expect(screen.getAllByRole('img')).toEqual([figure]);
    expect(document.querySelectorAll('figure')).toHaveLength(1);

    // Không có cách chuyển sang chữ khác: không link, nút duy nhất là "Phát lại".
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(
      screen.getAllByRole('button').map((button) => button.textContent),
    ).toEqual(['Phát lại']);

    // Không hiện và không tải chữ nào khác.
    const otherCharacters = strokeIndex.filter(
      (character) => character !== '好',
    );
    otherCharacters.forEach((character) =>
      expect(document.body).not.toHaveTextContent(character),
    );
    const strokeFileRequests = strokeFetch.requests.filter(
      (url) =>
        url.startsWith('/content/strokes/') && !url.endsWith('/index.json'),
    );
    expect(strokeFileRequests).toEqual([
      `/content/strokes/${encodeURIComponent('好')}.json`,
    ]);
  });

  it('S6.1-AC1 Đang tải dữ liệu nét: should show "Đang tải…" without figure or replay button while stroke data of 人 is still loading', async () => {
    // Ranh giới ngoài: file nét của 人 không bao giờ trả về (đang tải).
    strokeFetch = mockStrokeFetch({
      '人.json': () => new Promise<Response>(() => undefined),
    });
    vi.spyOn(globalThis, 'fetch').mockImplementation(strokeFetch.fetch);

    openRoute(`/characters/${encodeURIComponent('人')}/stroke-order`);

    // Màn đã mở và đã bắt đầu tải file nét của 人.
    await screen.findByRole(
      'heading',
      { name: 'Thứ tự nét' },
      { timeout: 3000 },
    );
    await waitFor(() =>
      expect(strokeFetch.requests).toContain(
        `/content/strokes/${encodeURIComponent('人')}.json`,
      ),
    );

    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent('Đang tải…');

    // Không hiện khối animation, không hiện nút "Phát lại".
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(document.querySelectorAll('figure')).toHaveLength(0);
    expect(
      screen.queryByRole('button', { name: 'Phát lại' }),
    ).not.toBeInTheDocument();
  });

  it('S6.1-AC1 Chữ không có dữ liệu nét: should show "Chưa có dữ liệu nét cho chữ này." without figure, replay button or error when opening /characters/龘/stroke-order', async () => {
    openRoute(`/characters/${encodeURIComponent('龘')}/stroke-order`);

    // Màn đã mở và đã đọc danh sách chữ có dữ liệu nét.
    await screen.findByRole(
      'heading',
      { name: 'Thứ tự nét' },
      { timeout: 3000 },
    );
    await waitFor(() =>
      expect(strokeFetch.requests).toContain('/content/strokes/index.json'),
    );

    expect(
      await screen.findByText('Chưa có dữ liệu nét cho chữ này.'),
    ).toBeInTheDocument();

    // Không hiện khối animation, không hiện nút "Phát lại", không phải trạng thái lỗi.
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(document.querySelectorAll('figure')).toHaveLength(0);
    expect(
      screen.queryByRole('button', { name: 'Phát lại' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Có lỗi xảy ra')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Không tải file nét nào, chỉ đọc danh sách.
    const strokeFileRequests = strokeFetch.requests.filter(
      (url) =>
        url.startsWith('/content/strokes/') && !url.endsWith('/index.json'),
    );
    expect(strokeFileRequests).toEqual([]);
  });
});
