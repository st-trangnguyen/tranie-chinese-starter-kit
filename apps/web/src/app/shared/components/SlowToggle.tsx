import { useTranslation } from 'react-i18next';

import { useAudioSpeed } from '@shared/contexts/useAudioSpeed';

export function SlowToggle() {
  const { t } = useTranslation('lesson');
  const { isSlow, toggleSlow } = useAudioSpeed();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isSlow}
      className="audio-slow-toggle"
      onClick={toggleSlow}
    >
      {t('listen.slow')}
    </button>
  );
}
