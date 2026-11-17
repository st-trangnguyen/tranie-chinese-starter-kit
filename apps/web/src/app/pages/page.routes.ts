import type { PageRoute } from '@core/modules/custom-router-dom/router.interface';
import errorRoutes from './error/error.routes';
import learningPathRoutes from './learning-path/learning-path.routes';
import lessonRoutes from './lesson/lesson.routes';
import onboardingRoutes from './onboarding/onboarding.routes';
import strokeOrderRoutes from './stroke-order/stroke-order.routes';

const pageRoutes: PageRoute[] = [
  ...onboardingRoutes,
  ...learningPathRoutes,
  ...lessonRoutes,
  ...strokeOrderRoutes,
  ...errorRoutes,
];

export default pageRoutes;
