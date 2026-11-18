import { lazy } from 'react';

import type { PageRoute } from '@core/modules/custom-router-dom/router.interface';

const HomeContainer = lazy(() => import('./containers/HomeContainer'));

const homeRoutes: PageRoute[] = [{ path: 'home', element: HomeContainer }];

export default homeRoutes;
