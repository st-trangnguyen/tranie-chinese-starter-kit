import type { PageRoute } from '@core/modules/custom-router-dom/router.interface';
import errorRoutes from './error/error.routes';
import homeRoutes from './home/home.routes';
import learningPathRoutes from './learning-path/learning-path.routes';
import lessonRoutes from './lesson/lesson.routes';
import onboardingRoutes from './onboarding/onboarding.routes';
import strokeOrderRoutes from './stroke-order/stroke-order.routes';
import writingPracticeRoutes from './writing-practice/writing-practice.routes';

const pageRoutes: PageRoute[] = [
  ...onboardingRoutes,
  ...homeRoutes,
  ...learningPathRoutes,
  ...lessonRoutes,
  ...strokeOrderRoutes,
  ...writingPracticeRoutes,
  ...errorRoutes,
];

export default pageRoutes;
