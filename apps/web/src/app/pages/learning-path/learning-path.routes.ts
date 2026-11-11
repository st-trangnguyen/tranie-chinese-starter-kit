import { lazy } from 'react';

import type { PageRoute } from '@core/modules/custom-router-dom/router.interface';

const LearningPathContainer = lazy(
  () => import('./containers/LearningPathContainer'),
);

const learningPathRoutes: PageRoute[] = [
  { path: 'learning-paths', element: LearningPathContainer },
];

export default learningPathRoutes;
