import { useTranslation } from 'react-i18next';

import { useAudioPlayer } from '@core/hooks/useAudioPlayer';
import { useAudioSpeed } from '@shared/contexts/useAudioSpeed';

interface ListenButtonProps {
  audioPath: string;
  label?: string;
}

export function ListenButton({ audioPath, label }: ListenButtonProps) {
  const { t } = useTranslation('lesson');
  const { play, hasError } = useAudioPlayer();
  const { isSlow } = useAudioSpeed();

  function handleClick() {
    void play(audioPath, isSlow);
  }

  return (
    <>
      <button
        type="button"
        className="audio-listen-button"
        onClick={handleClick}
      >
        {label ?? t('listen.play')}
      </button>
      {hasError && (
        <p role="alert" className="audio-listen-error">
          {t('listen.error')}
        </p>
      )}
    </>
  );
}
