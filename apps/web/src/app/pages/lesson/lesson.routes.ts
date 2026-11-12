import { lazy } from 'react';

import type { PageRoute } from '@core/modules/custom-router-dom/router.interface';

const LessonRunnerContainer = lazy(
  () => import('./containers/LessonRunnerContainer'),
);

const PlacementTestContainer = lazy(
  () => import('./containers/PlacementTestContainer'),
);

const lessonRoutes: PageRoute[] = [
  { path: 'lessons/:lessonId', element: LessonRunnerContainer },
  { path: 'units/:unitId/placement-test', element: PlacementTestContainer },
];

export default lessonRoutes;
