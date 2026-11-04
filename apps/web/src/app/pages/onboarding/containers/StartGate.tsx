import { Navigate } from 'react-router-dom';

import { FIRST_LESSON_ID, ROUTE_PATHS } from '@core/constants/app.constants';
import { useOnboarding } from '../hooks/useOnboarding';

/** Route `/`: lần đầu vào onboarding, các lần sau vào thẳng bài học. */
const StartGate = () => {
  const { needsOnboarding } = useOnboarding();

  if (needsOnboarding === null) {
    return null;
  }
  return (
    <Navigate
      replace
      to={
        needsOnboarding
          ? ROUTE_PATHS.onboarding
          : ROUTE_PATHS.lesson(FIRST_LESSON_ID)
      }
    />
  );
};

export default StartGate;
