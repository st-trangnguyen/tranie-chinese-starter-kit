import { useTranslation } from 'react-i18next';

import { useAudioPlayer } from '@core/hooks/useAudioPlayer';
import { useRecorder } from '@core/hooks/useRecorder';

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
  const { isRecording, recordingUrl, start, stop } = useRecorder();
  const { play, playUrl, hasError } = useAudioPlayer();

  function handleToggleRecording() {
    if (isRecording) {
      onRecordStop?.();
      void stop();
      return;
    }
    onRecordStart?.();
    void start();
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
      <button
        type="button"
        className={isRecording ? 'record-button is-recording' : 'record-button'}
        onClick={handleToggleRecording}
      >
        {isRecording ? t('record.stop') : t('record.start')}
      </button>
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
      <button
        type="button"
        className="record-play-button"
        disabled={recordingUrl === null}
        onClick={handlePlayRecording}
      >
        {t('record.listenRecording')}
      </button>
      {hasError && (
        <p role="alert" className="record-error">
          {t('record.playError')}
        </p>
      )}
    </div>
  );
}
