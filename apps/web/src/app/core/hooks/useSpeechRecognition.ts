import { useCallback, useEffect, useRef, useState } from 'react';

import {
  createSpeechService,
  type SpeechService,
} from '@core/services/speech.service';

export interface SpeechRecognitionState {
  isSupported: boolean;
  isListening: boolean;
  transcript: string | null;
  hasError: boolean;
  start: () => void;
  stop: () => Promise<void>;
}

export function useSpeechRecognition(): SpeechRecognitionState {
  const serviceRef = useRef<SpeechService | null>(null);
  if (serviceRef.current === null) {
    serviceRef.current = createSpeechService();
  }
  const service = serviceRef.current;
  const isMountedRef = useRef(true);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      service.abort();
    };
  }, [service]);

  const start = useCallback((): void => {
    setTranscript(null);
    setHasError(false);
    try {
      service.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
      setHasError(true);
    }
  }, [service]);

  const stop = useCallback(async (): Promise<void> => {
    try {
      const heard = await service.stop();
      if (isMountedRef.current) {
        setTranscript(heard);
      }
    } catch {
      if (isMountedRef.current) {
        setHasError(true);
      }
    } finally {
      if (isMountedRef.current) {
        setIsListening(false);
      }
    }
  }, [service]);

  return {
    isSupported: service.isSupported(),
    isListening,
    transcript,
    hasError,
    start,
    stop,
  };
}
