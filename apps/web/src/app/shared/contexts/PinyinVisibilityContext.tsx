import type { ReactNode } from 'react';

import { PinyinVisibilityContext } from './usePinyinVisibility';

interface PinyinVisibilityProviderProps {
  isVisible: boolean;
  children: ReactNode;
}

export function PinyinVisibilityProvider({
  isVisible,
  children,
}: PinyinVisibilityProviderProps): ReactNode {
  return (
    <PinyinVisibilityContext value={isVisible}>
      {children}
    </PinyinVisibilityContext>
  );
}
