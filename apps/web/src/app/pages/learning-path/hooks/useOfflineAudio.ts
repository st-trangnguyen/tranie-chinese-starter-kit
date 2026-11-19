import type { Stage } from '@csk/shared';

import type {
  OfflineAudioAnnouncement,
  OfflineAudioTopicView,
  OfflineAudioUnit,
} from '@shared/models/offline-audio.model';

export interface OfflineAudioState {
  /** Khối audio theo id chủ đề; chủ đề không có audio thì không có mục. */
  topics: ReadonlyMap<string, OfflineAudioTopicView>;
  announcements: readonly OfflineAudioAnnouncement[];
  download: (unit: OfflineAudioUnit) => void;
  remove: (unit: OfflineAudioUnit) => void;
}

const EMPTY_STATE: OfflineAudioState = {
  topics: new Map(),
  announcements: [],
  download: () => undefined,
  remove: () => undefined,
};

/**
 * Trạng thái audio offline của các chủ đề trên bản đồ (S8.4, design D8).
 * RED 8.1: skeleton chưa có hành vi (trả map rỗng), GREEN 8.2 cài đặt.
 */
export const useOfflineAudio: (
  stages: readonly Stage[] | undefined,
) => OfflineAudioState = () => EMPTY_STATE;
