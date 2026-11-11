import { lazy } from 'react';

import type { PageRoute } from '@core/modules/custom-router-dom/router.interface';

const LessonRunnerContainer = lazy(
  () => import('./containers/LessonRunnerContainer'),
);

const lessonRoutes: PageRoute[] = [
  { path: 'lessons/:lessonId', element: LessonRunnerContainer },
];

export default lessonRoutes;
