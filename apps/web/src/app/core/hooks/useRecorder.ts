import { useCallback, useEffect, useRef, useState } from 'react';

import { audioService } from '@core/services/audio.service';
import {
  createRecorderService,
  type RecorderService,
} from '@core/services/recorder.service';

export interface Recorder {
  isRecording: boolean;
  recordingUrl: string | null;
  hasError: boolean;
  start: () => Promise<void>;
  stop: () => Promise<void>;
}

export function useRecorder(): Recorder {
  const serviceRef = useRef<RecorderService | null>(null);
  if (serviceRef.current === null) {
    serviceRef.current = createRecorderService();
  }
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const service = serviceRef.current;
    return () => {
      isMountedRef.current = false;
      service?.discard();
    };
  }, []);

  const start = useCallback(async (): Promise<void> => {
    setHasError(false);
    audioService.stop();
    try {
      await serviceRef.current?.start();
      if (isMountedRef.current) {
        setRecordingUrl(null);
        setIsRecording(true);
      }
    } catch {
      if (isMountedRef.current) {
        setHasError(true);
        setIsRecording(false);
      }
    }
  }, []);

  const stop = useCallback(async (): Promise<void> => {
    try {
      const url = await serviceRef.current?.stop();
      if (isMountedRef.current) {
        setRecordingUrl(url ?? null);
        setIsRecording(false);
      }
    } catch {
      if (isMountedRef.current) {
        setHasError(true);
        setIsRecording(false);
      }
    }
  }, []);

  return { isRecording, recordingUrl, hasError, start, stop };
}
