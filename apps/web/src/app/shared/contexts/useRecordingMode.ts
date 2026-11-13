import { createContext, useContext } from 'react';

export interface RecordingModeValue {
  isReadAloud: boolean;
  enterReadAloud: () => void;
  leaveReadAloud: () => void;
}

const DEFAULT_VALUE: RecordingModeValue = {
  isReadAloud: false,
  enterReadAloud: () => undefined,
  leaveReadAloud: () => undefined,
};

export const RecordingModeContext =
  createContext<RecordingModeValue>(DEFAULT_VALUE);

export function useRecordingMode(): RecordingModeValue {
  return useContext(RecordingModeContext);
}
