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
  const generationRef = useRef(0);
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
    generationRef.current += 1;
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
    const token = generationRef.current;
    const isCurrent = (): boolean =>
      isMountedRef.current && generationRef.current === token;
    try {
      const heard = await service.stop();
      if (isCurrent()) {
        setTranscript(heard);
      }
    } catch {
      if (isCurrent()) {
        setHasError(true);
      }
    } finally {
      if (isCurrent()) {
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
