import { Navigate } from 'react-router-dom';

import { ROUTE_PATHS } from '@core/constants/app.constants';
import { useOnboarding } from '../hooks/useOnboarding';

/** Route `/`: lần đầu vào onboarding, các lần sau vào Trang chủ. */
const StartGate = () => {
  const { needsOnboarding } = useOnboarding();

  if (needsOnboarding === null) {
    return null;
  }
  return (
    <Navigate
      replace
      to={needsOnboarding ? ROUTE_PATHS.onboarding : ROUTE_PATHS.home}
    />
  );
};

export default StartGate;
