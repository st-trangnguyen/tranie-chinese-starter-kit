import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { I18nextProvider } from 'react-i18next';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';

import { renderChildren } from '@core/modules/custom-router-dom/RouterOutlet';
import { requestPersistentStorage } from '@core/modules/pwa/persistStorage';
import { UpdateBanner } from '@core/modules/pwa/UpdateBanner';
import i18n from '@core/services/i18n.service';
import appRoutes from './app.routes';
import AppErrorBoundaryFallback from './AppErrorBoundaryFallback';

import '../index.css';

export const Root = () => (
  <ErrorBoundary FallbackComponent={AppErrorBoundaryFallback}>
    <Suspense fallback={null}>
      <Outlet />
      <UpdateBanner />
    </Suspense>
  </ErrorBoundary>
);

const router = createBrowserRouter([
  { path: '/', element: <Root />, children: renderChildren(appRoutes) },
]);

void requestPersistentStorage();

const container = document.getElementById('root');
if (!container) {
  throw new Error('Không tìm thấy phần tử #root trong index.html.');
}

createRoot(container).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <RouterProvider router={router} />
    </I18nextProvider>
  </StrictMode>,
);
