import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import type { Stage } from '@csk/shared';

import { useOnlineStatus } from '@core/hooks/useOnlineStatus';
import type {
  OfflineAudioAnnouncement,
  OfflineAudioTopicView,
  OfflineAudioUnit,
} from '@shared/models/offline-audio.model';
import { useOfflineAudioService } from '@shared/contexts/useOfflineAudioService';

export interface OfflineAudioState {
  /** Khối audio theo id chủ đề; chủ đề không có audio thì không có mục. */
  topics: ReadonlyMap<string, OfflineAudioTopicView>;
  announcements: readonly OfflineAudioAnnouncement[];
  download: (unit: OfflineAudioUnit) => void;
  remove: (unit: OfflineAudioUnit) => void;
}

const EMPTY_TOPICS: ReadonlyMap<string, OfflineAudioTopicView> = new Map();

const noop = (): void => undefined;

/**
 * Trạng thái audio offline của các chủ đề trên bản đồ (S8.4, design D8). Trạng thái tải nằm trong
 * service (singleton), hook chỉ đọc snapshot và nạp lại tập file trên máy mỗi lần mở bản đồ.
 */
export const useOfflineAudio = (
  stages: readonly Stage[] | undefined,
): OfflineAudioState => {
  const service = useOfflineAudioService();
  const snapshot = useSyncExternalStore(service.subscribe, service.getSnapshot);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    service.refresh().catch(() => {
      // Không nạp được danh sách audio: bản đồ không có khối audio.
    });
  }, [service]);

  const topics = useMemo(
    () => (stages ? service.deriveTopics(stages, snapshot) : EMPTY_TOPICS),
    [service, stages, snapshot],
  );

  const download = useCallback(
    (unit: OfflineAudioUnit) => {
      service.startDownload(unit, isOnline).catch(() => {
        // Lỗi ngoài dự kiến (không phải AudioDownloadError): chủ đề giữ trạng thái service ghi lại.
      });
    },
    [service, isOnline],
  );

  return {
    topics,
    announcements: snapshot.announcements,
    download,
    remove: noop,
  };
};
