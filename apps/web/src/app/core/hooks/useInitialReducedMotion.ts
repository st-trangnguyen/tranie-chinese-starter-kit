import { useState } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function readReducedMotion(): boolean {
  if (typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

// Chốt giá trị lúc mount; không theo dõi thay đổi để chỉ xét "lúc mở màn".
export function useInitialReducedMotion(): boolean {
  const [isReducedMotion] = useState(readReducedMotion);
  return isReducedMotion;
}
