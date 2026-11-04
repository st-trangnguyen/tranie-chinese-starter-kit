import { lazy } from 'react';

import type { PageRoute } from '@core/modules/custom-router-dom/router.interface';

const LessonPlaceholder = lazy(() => import('./containers/LessonPlaceholder'));

const lessonRoutes: PageRoute[] = [
  { path: 'lesson/:lessonId', element: LessonPlaceholder },
];

export default lessonRoutes;
