import { lazy } from 'react';

import type { PageRoute } from '@core/modules/custom-router-dom/router.interface';

const StartGate = lazy(() => import('./containers/StartGate'));
const Onboarding = lazy(() => import('./containers/OnboardingContainer'));

const onboardingRoutes: PageRoute[] = [
  { index: true, element: StartGate },
  { path: 'onboarding', element: Onboarding },
];

export default onboardingRoutes;
