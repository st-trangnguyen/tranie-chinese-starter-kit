import { useCallback, useEffect, useRef, useState } from 'react';

import {
  AUDIO_BASE_PATH,
  PLAYBACK_RATES,
} from '@core/constants/audio.constants';
import { audioService } from '@core/services/audio.service';

export interface AudioPlayer {
  isPlaying: boolean;
  hasError: boolean;
  play: (audioPath: string, isSlow: boolean) => Promise<void>;
  stop: () => void;
}

// audioService là singleton: nhớ hook nào đang giữ luồng phát hiện tại.
let activeOwner: symbol | null = null;

export function useAudioPlayer(): AudioPlayer {
  const ownerRef = useRef(Symbol('audio-player'));
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const owner = ownerRef.current;
    return () => {
      isMountedRef.current = false;
      if (activeOwner === owner) {
        activeOwner = null;
        audioService.stop();
      }
    };
  }, []);

  const play = useCallback(
    async (audioPath: string, isSlow: boolean): Promise<void> => {
      const rate = isSlow ? PLAYBACK_RATES.slow : PLAYBACK_RATES.normal;
      setHasError(false);
      setIsPlaying(true);
      const owner = ownerRef.current;
      activeOwner = owner;
      try {
        const result = await audioService.play(
          `${AUDIO_BASE_PATH}${audioPath}`,
          rate,
        );
        if (activeOwner === owner) {
          // Chính hook này còn giữ luồng: 'interrupted' = tự phát lại, giữ isPlaying.
          if (result === 'ended') {
            activeOwner = null;
            if (isMountedRef.current) {
              setIsPlaying(false);
            }
          }
        } else if (isMountedRef.current) {
          // Hook khác đã chen vào luồng.
          setIsPlaying(false);
        }
      } catch {
        if (activeOwner === owner) {
          activeOwner = null;
        }
        if (isMountedRef.current) {
          setHasError(true);
          setIsPlaying(false);
        }
      }
    },
    [],
  );

  const stop = useCallback((): void => {
    if (activeOwner === ownerRef.current) {
      activeOwner = null;
      audioService.stop();
    }
    if (isMountedRef.current) {
      setIsPlaying(false);
    }
  }, []);

  return { isPlaying, hasError, play, stop };
}
