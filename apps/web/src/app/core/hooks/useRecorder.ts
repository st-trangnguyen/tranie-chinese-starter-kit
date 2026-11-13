import { useCallback, useEffect, useRef, useState } from 'react';

import { audioService } from '@core/services/audio.service';
import {
  createRecorderService,
  RecorderError,
  type RecorderFailureReason,
  type RecorderService,
} from '@core/services/recorder.service';

export interface Recorder {
  isRecording: boolean;
  recordingUrl: string | null;
  hasError: boolean;
  failureReason: RecorderFailureReason | null;
  start: () => Promise<RecorderFailureReason | null>;
  retry: () => Promise<RecorderFailureReason | null>;
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
  const [failureReason, setFailureReason] =
    useState<RecorderFailureReason | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const service = serviceRef.current;
    return () => {
      isMountedRef.current = false;
      service?.discard();
    };
  }, []);

  const start = useCallback(async (): Promise<RecorderFailureReason | null> => {
    setHasError(false);
    setFailureReason(null);
    audioService.stop();
    try {
      await serviceRef.current?.start();
      if (isMountedRef.current) {
        setRecordingUrl(null);
        setIsRecording(true);
      }
      return null;
    } catch (error) {
      const reason = error instanceof RecorderError ? error.reason : null;
      if (isMountedRef.current) {
        setHasError(true);
        setFailureReason(reason);
        setIsRecording(false);
      }
      return reason;
    }
  }, []);

  const retry = useCallback(async (): Promise<RecorderFailureReason | null> => {
    const reason = (await serviceRef.current?.checkAvailability()) ?? null;
    if (isMountedRef.current) {
      setFailureReason(reason);
      if (reason === null) {
        setHasError(false);
      }
    }
    return reason;
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

  return {
    isRecording,
    recordingUrl,
    hasError,
    failureReason,
    start,
    retry,
    stop,
  };
}
