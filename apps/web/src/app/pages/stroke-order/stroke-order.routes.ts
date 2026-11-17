import { lazy } from 'react';

import type { PageRoute } from '@core/modules/custom-router-dom/router.interface';

const StrokeOrderContainer = lazy(
  () => import('./containers/StrokeOrderContainer'),
);

const strokeOrderRoutes: PageRoute[] = [
  {
    path: 'characters/:character?/stroke-order',
    element: StrokeOrderContainer,
  },
];

export default strokeOrderRoutes;
