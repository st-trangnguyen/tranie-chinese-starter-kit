import { lazy } from 'react';

import type { PageRoute } from '@core/modules/custom-router-dom/router.interface';

const WritingPracticeContainer = lazy(
  () => import('./containers/WritingPracticeContainer'),
);

const writingPracticeRoutes: PageRoute[] = [
  {
    path: 'characters/:character/writing-practice',
    element: WritingPracticeContainer,
  },
];

export default writingPracticeRoutes;
