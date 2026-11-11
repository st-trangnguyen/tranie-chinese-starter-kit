import type { PageRoute } from '@core/modules/custom-router-dom/router.interface';
import errorRoutes from './error/error.routes';
import learningPathRoutes from './learning-path/learning-path.routes';
import lessonRoutes from './lesson/lesson.routes';
import onboardingRoutes from './onboarding/onboarding.routes';

const pageRoutes: PageRoute[] = [
  ...onboardingRoutes,
  ...learningPathRoutes,
  ...lessonRoutes,
  ...errorRoutes,
];

export default pageRoutes;
