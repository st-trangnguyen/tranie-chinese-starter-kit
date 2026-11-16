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

/** Stub `matchMedia`: chỉ query giảm chuyển động trả `matches` theo tham số. */
export const stubReducedMotion = (matches: boolean): void => {
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
export const openRoute = (path: string): RenderResult => {
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
