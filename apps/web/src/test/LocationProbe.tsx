import { useLocation } from 'react-router-dom';

/** Hiện pathname hiện tại để test kiểm tra điều hướng. */
export function LocationProbe() {
  const location = useLocation();
  return <p data-testid="location">{location.pathname}</p>;
}
