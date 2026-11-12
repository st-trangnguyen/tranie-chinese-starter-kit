import { createContext, useContext } from 'react';

export interface AudioSpeedValue {
  isSlow: boolean;
  toggleSlow: () => void;
}

const DEFAULT_VALUE: AudioSpeedValue = {
  isSlow: false,
  toggleSlow: () => undefined,
};

export const AudioSpeedContext = createContext<AudioSpeedValue>(DEFAULT_VALUE);

export function useAudioSpeed(): AudioSpeedValue {
  return useContext(AudioSpeedContext);
}
