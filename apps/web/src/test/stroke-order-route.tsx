import { Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Outlet, RouterProvider, createMemoryRouter } from 'react-router-dom';
import { render, type RenderResult } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

import { renderChildren } from '@core/modules/custom-router-dom/RouterOutlet';
import testI18n from '@test/i18n';
import { FakeHanziWriter } from '@test/mocks/hanzi-writer';
import {
  mockStrokeFetch,
  type StrokeFetchMock,
} from '@test/mocks/stroke-fetch';
import pageRoutes from '@app/pages/page.routes';

/**
 * Setup dùng chung cho test màn thứ tự nét (S6.1) mở qua bảng route thật của app.
 * Test file vẫn phải tự gọi `vi.mock('hanzi-writer', …)` (vi.mock chỉ được hoist trong test file).
 */

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

type MediaChangeListener = (event: { matches: boolean; media: string }) => void;

export interface ReducedMotionStub {
  /** Đổi cài đặt giảm chuyển động như người dùng bật/tắt trong hệ điều hành, phát sự kiện `change`. */
  setReducedMotion: (matches: boolean) => void;
}

/**
 * Stub `matchMedia`: chỉ query giảm chuyển động trả `matches` theo tham số. `matches` đọc giá trị
 * hiện tại; `setReducedMotion` đổi giá trị và gọi mọi listener `change` đã đăng ký.
 */
export const stubReducedMotion = (
  initialMatches: boolean,
): ReducedMotionStub => {
  let isReduced = initialMatches;
  const listeners = new Set<MediaChangeListener>();

  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => {
      const isReducedQuery = query === REDUCED_MOTION_QUERY;
      const register = (listener: MediaChangeListener): void => {
        if (isReducedQuery) {
          listeners.add(listener);
        }
      };
      const unregister = (listener: MediaChangeListener): void => {
        listeners.delete(listener);
      };
      return {
        get matches() {
          return isReducedQuery ? isReduced : false;
        },
        media: query,
        onchange: null,
        addEventListener: (_type: string, listener: MediaChangeListener) =>
          register(listener),
        removeEventListener: (_type: string, listener: MediaChangeListener) =>
          unregister(listener),
        addListener: register,
        removeListener: unregister,
        dispatchEvent: () => true,
      };
    }),
  );

  return {
    setReducedMotion: (matches) => {
      isReduced = matches;
      listeners.forEach((listener) =>
        listener({ matches, media: REDUCED_MOTION_QUERY }),
      );
    },
  };
};

export type TestRouter = ReturnType<typeof createMemoryRouter>;

/** Mở một địa chỉ qua đúng bảng route của app (cùng cấu trúc Root trong App.tsx). */
export const openRoute = (
  path: string,
): RenderResult & { router: TestRouter } => {
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
  const result = render(
    <I18nextProvider i18n={testI18n}>
      <RouterProvider router={router} />
    </I18nextProvider>,
  );
  return { ...result, router };
};

export interface StrokeOrderRouteEnv {
  /** Mock fetch dữ liệu nét đang gắn cho test hiện tại. */
  readonly strokeFetch: StrokeFetchMock;
  /** Thay mock fetch dữ liệu nét (ghi đè phản hồi theo tên file) cho test hiện tại. */
  replaceStrokeFetch: (
    overrides: Parameters<typeof mockStrokeFetch>[0],
  ) => StrokeFetchMock;
}

/**
 * Đăng ký beforeEach/afterEach: reset FakeHanziWriter, tắt giảm chuyển động,
 * gắn `fetch` giả phục vụ file nét thật; dọn mock sau mỗi test.
 */
export const setupStrokeOrderRoute = (): StrokeOrderRouteEnv => {
  let current: StrokeFetchMock = mockStrokeFetch();

  const attach = (mock: StrokeFetchMock): StrokeFetchMock => {
    current = mock;
    vi.spyOn(globalThis, 'fetch').mockImplementation(mock.fetch);
    return mock;
  };

  beforeEach(() => {
    FakeHanziWriter.reset();
    stubReducedMotion(false);
    attach(mockStrokeFetch());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  return {
    get strokeFetch() {
      return current;
    },
    replaceStrokeFetch: (overrides) => attach(mockStrokeFetch(overrides)),
  };
};
