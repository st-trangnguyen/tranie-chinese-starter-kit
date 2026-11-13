import { useState, type ReactNode } from 'react';

import { RecordingModeContext } from './useRecordingMode';

interface RecordingModeProviderProps {
  children: ReactNode;
}

export function RecordingModeProvider({
  children,
}: RecordingModeProviderProps): ReactNode {
  const [isReadAloud, setIsReadAloud] = useState(false);

  function enterReadAloud(): void {
    setIsReadAloud(true);
  }

  function leaveReadAloud(): void {
    setIsReadAloud(false);
  }

  return (
    <RecordingModeContext
      value={{ isReadAloud, enterReadAloud, leaveReadAloud }}
    >
      {children}
    </RecordingModeContext>
  );
}
