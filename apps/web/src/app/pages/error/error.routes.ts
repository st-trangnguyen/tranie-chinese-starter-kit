import { lazy } from 'react';

import type { PageRoute } from '@core/modules/custom-router-dom/router.interface';

const NotFound = lazy(() => import('./containers/NotFound'));

const errorRoutes: PageRoute[] = [{ path: '*', element: NotFound }];

export default errorRoutes;
