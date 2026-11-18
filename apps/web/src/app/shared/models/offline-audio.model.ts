import type { AudioIndex } from '@csk/shared';

/** Thông báo gắn với khối audio của một chủ đề (S8.4). */
export type OfflineAudioMessageKind =
  'needs-network' | 'download-incomplete' | 'storage-full' | 'removed';

/** Câu đọc cho trình đọc màn hình (S8.4). */
export type OfflineAudioAnnouncementKind =
  'download-started' | 'download-finished' | OfflineAudioMessageKind;

/** Trạng thái audio offline của một chủ đề (S8.4 AC1). */
export type OfflineAudioTopic =
  | { status: 'available-offline' }
  | { status: 'downloading'; percent: number }
  | { status: 'not-downloaded'; bytes: number }
  | { status: 'downloaded'; bytes: number; canRemove: boolean };

export type OfflineAudioTopicView = OfflineAudioTopic & {
  message: OfflineAudioMessageKind | null;
};

export interface OfflineAudioMessage {
  kind: OfflineAudioMessageKind;
  shownWith: OfflineAudioTopic['status'];
}

export interface OfflineAudioAnnouncement {
  id: number;
  kind: OfflineAudioAnnouncementKind;
  unitTitle: string;
}

/** Ảnh chụp bất biến của trạng thái audio offline toàn app. */
export interface OfflineAudioSnapshot {
  index: AudioIndex | null;
  cachedPaths: ReadonlySet<string>;
  downloadingUnitIds: ReadonlySet<string>;
  messages: ReadonlyMap<string, OfflineAudioMessage>;
  announcements: readonly OfflineAudioAnnouncement[];
}

export interface OfflineAudioUnit {
  id: string;
  title: string;
}
