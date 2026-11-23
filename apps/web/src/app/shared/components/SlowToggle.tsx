import { useTranslation } from 'react-i18next';

import { useAudioSpeed } from '@shared/contexts/useAudioSpeed';

const SLOW_CHECK_MARK = '✓';

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
      {isSlow && (
        <span aria-hidden="true" className="audio-slow-toggle-icon">
          {SLOW_CHECK_MARK}
        </span>
      )}
      <span className="audio-slow-toggle-label">{t('listen.slow')}</span>
    </button>
  );
}
