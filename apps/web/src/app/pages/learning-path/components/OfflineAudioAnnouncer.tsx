import { useTranslation } from 'react-i18next';

import type {
  OfflineAudioAnnouncement,
  OfflineAudioAnnouncementKind,
} from '@shared/models/offline-audio.model';

interface OfflineAudioAnnouncerProps {
  announcements: readonly OfflineAudioAnnouncement[];
}

// Câu bắt đầu/xong tải có key riêng; câu lỗi/xóa dùng chung key `message.*` (design D11).
const toTranslationKey = (kind: OfflineAudioAnnouncementKind): string =>
  kind === 'download-started' || kind === 'download-finished'
    ? `offlineAudio.announce.${kind}`
    : `offlineAudio.message.${kind}`;

/** Vùng đọc cho trình đọc màn hình, câu mới nối thêm (S8.4, design D10). */
export function OfflineAudioAnnouncer({
  announcements,
}: OfflineAudioAnnouncerProps) {
  const { t } = useTranslation('learning-path');

  return (
    <div
      role="status"
      aria-live="polite"
      aria-relevant="additions"
      aria-label={t('offlineAudio.announcerLabel')}
      className="offline-audio-announcer"
    >
      {announcements.map((announcement) => (
        <p key={announcement.id}>
          {t(toTranslationKey(announcement.kind), {
            topic: announcement.unitTitle,
          })}
        </p>
      ))}
    </div>
  );
}
