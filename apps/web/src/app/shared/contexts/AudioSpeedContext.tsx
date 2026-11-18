import { useState, type ReactNode } from 'react';

import { AudioSpeedContext } from './useAudioSpeed';

interface AudioSpeedProviderProps {
  children: ReactNode;
  initialIsSlow?: boolean;
}

export function AudioSpeedProvider({
  children,
  initialIsSlow = false,
}: AudioSpeedProviderProps): ReactNode {
  const [isSlow, setIsSlow] = useState(initialIsSlow);

  function toggleSlow(): void {
    setIsSlow((prev) => !prev);
  }

  return (
    <AudioSpeedContext value={{ isSlow, toggleSlow }}>
      {children}
    </AudioSpeedContext>
  );
}
