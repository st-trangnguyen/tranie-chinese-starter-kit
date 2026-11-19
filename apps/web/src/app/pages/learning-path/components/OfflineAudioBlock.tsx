import { useTranslation } from 'react-i18next';

import type { OfflineAudioTopicView } from '@shared/models/offline-audio.model';
import { formatAudioSize } from '@shared/utils/offline-audio.utils';

interface OfflineAudioBlockProps {
  topic: OfflineAudioTopicView;
}

/** Khối audio offline của một chủ đề trên bản đồ (S8.4, design D9). */
export function OfflineAudioBlock({ topic }: OfflineAudioBlockProps) {
  const { t } = useTranslation('learning-path');

  return (
    <div className="offline-audio flex flex-col gap-xs">
      {topic.status === 'available-offline' && (
        <p>{t('offlineAudio.available')}</p>
      )}
      {topic.status === 'not-downloaded' && (
        <button
          type="button"
          className="btn btn-secondary offline-audio-button"
        >
          {t('offlineAudio.download', { size: formatAudioSize(topic.bytes) })}
        </button>
      )}
    </div>
  );
}
