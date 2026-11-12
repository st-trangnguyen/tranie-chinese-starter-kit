import { useState, type ReactNode } from 'react';

import { AudioSpeedContext } from './useAudioSpeed';

interface AudioSpeedProviderProps {
  children: ReactNode;
}

export function AudioSpeedProvider({
  children,
}: AudioSpeedProviderProps): ReactNode {
  const [isSlow, setIsSlow] = useState(false);

  function toggleSlow(): void {
    setIsSlow((prev) => !prev);
  }

  return (
    <AudioSpeedContext value={{ isSlow, toggleSlow }}>
      {children}
    </AudioSpeedContext>
  );
}
