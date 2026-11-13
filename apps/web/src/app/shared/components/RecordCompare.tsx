import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useAudioPlayer } from '@core/hooks/useAudioPlayer';
import { useRecorder } from '@core/hooks/useRecorder';

import { useRecordingMode } from '../contexts/useRecordingMode';
import { RecordGuidance } from './RecordGuidance';

interface RecordCompareProps {
  audioPath: string;
  onRecordStart?: () => void;
  onRecordStop?: () => void;
}

export function RecordCompare({
  audioPath,
  onRecordStart,
  onRecordStop,
}: RecordCompareProps) {
  const { t } = useTranslation('lesson');
  const { isRecording, recordingUrl, failureReason, start, retry, stop } =
    useRecorder();
  const { play, playUrl, hasError } = useAudioPlayer();
  const { isReadAloud, enterReadAloud, leaveReadAloud } = useRecordingMode();
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const shouldFocusStartRef = useRef(false);

  useEffect(() => {
    if (!isReadAloud && shouldFocusStartRef.current) {
      shouldFocusStartRef.current = false;
      startButtonRef.current?.focus();
    }
  }, [isReadAloud]);

  async function handleToggleRecording() {
    if (isRecording) {
      onRecordStop?.();
      void stop();
      return;
    }
    onRecordStart?.();
    const reason = await start();
    if (reason !== null) {
      enterReadAloud();
    }
  }

  async function handleRetry() {
    const reason = await retry();
    if (reason !== null) {
      return;
    }
    if (startButtonRef.current) {
      startButtonRef.current.focus();
    } else {
      shouldFocusStartRef.current = true;
    }
    leaveReadAloud();
  }

  function handlePlaySample() {
    void play(audioPath, false);
  }

  function handlePlayRecording() {
    if (recordingUrl) {
      void playUrl(recordingUrl);
    }
  }

  return (
    <div className="flex flex-col items-start gap-md">
      {!isReadAloud && (
        <button
          ref={startButtonRef}
          type="button"
          className={
            isRecording ? 'record-button is-recording' : 'record-button'
          }
          onClick={() => void handleToggleRecording()}
        >
          {isRecording ? t('record.stop') : t('record.start')}
        </button>
      )}
      {isRecording && (
        <p role="status" className="record-status">
          {t('record.recording')}
        </p>
      )}
      <button
        type="button"
        className="record-play-button"
        onClick={handlePlaySample}
      >
        {t('record.listenSample')}
      </button>
      {!isReadAloud && (
        <button
          type="button"
          className="record-play-button"
          disabled={recordingUrl === null}
          onClick={handlePlayRecording}
        >
          {t('record.listenRecording')}
        </button>
      )}
      {failureReason !== null && (
        <RecordGuidance
          reason={failureReason}
          onRetry={() => void handleRetry()}
        />
      )}
      {isReadAloud && (
        <p role="status" className="record-status">
          {t('record.readAloud')}
        </p>
      )}
      {isReadAloud && failureReason === null && (
        <button
          type="button"
          className="record-play-button"
          onClick={() => void handleRetry()}
        >
          {t('record.retryRecording')}
        </button>
      )}
      {hasError && (
        <p role="alert" className="record-error">
          {t('record.playError')}
        </p>
      )}
    </div>
  );
}
