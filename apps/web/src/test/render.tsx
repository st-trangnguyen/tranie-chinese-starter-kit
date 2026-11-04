import type { ReactElement, ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import testI18n from './i18n';
import { LocationProbe } from './LocationProbe';

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Route ban đầu của router trong bộ nhớ. Mặc định '/'. */
  route?: string;
}

/**
 * Render trong cùng cây provider với App.tsx (I18nextProvider → router).
 * Route `*` cuối hiển thị pathname hiện tại để test kiểm tra điều hướng.
 */
export const renderWithProviders = (
  ui: ReactElement,
  { route = '/', ...options }: RenderWithProvidersOptions = {},
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <I18nextProvider i18n={testI18n}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={route} element={children} />
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </I18nextProvider>
  );

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
};

export { act, screen, waitFor, within } from '@testing-library/react';
export { userEvent };
