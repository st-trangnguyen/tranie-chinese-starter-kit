import { lazy } from 'react';

import type { PageRoute } from '@core/modules/custom-router-dom/router.interface';

const SettingsContainer = lazy(() => import('./containers/SettingsContainer'));

const settingsRoutes: PageRoute[] = [
  { path: 'settings', element: SettingsContainer },
];

export default settingsRoutes;
