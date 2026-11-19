import { type FocusEvent, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { OfflineAudioTopicView } from '@shared/models/offline-audio.model';
import { formatAudioSize } from '@shared/utils/offline-audio.utils';

interface OfflineAudioBlockProps {
  unitTitle: string;
  topic: OfflineAudioTopicView;
  onDownload: () => void;
  onRemove: () => void;
}

/** Phần tử trong khối nhận focus khi phần tử đang giữ focus bị gỡ (design D9). */
type FocusTarget = 'download-button' | 'status' | 'remove-button';

/**
 * Chọn đích focus theo trạng thái: `downloading` → dòng tiến độ; `downloaded` → nút xóa, không có
 * thì dòng "Đã tải audio"; `not-downloaded` → nút tải; `available-offline` → không có đích.
 */
function resolveFocusTarget(topic: OfflineAudioTopicView): FocusTarget | null {
  switch (topic.status) {
    case 'downloading':
      return 'status';
    case 'downloaded':
      return topic.canRemove ? 'remove-button' : 'status';
    case 'not-downloaded':
      return 'download-button';
    default:
      return null;
  }
}

/** Khối audio offline của một chủ đề trên bản đồ (S8.4, design D9). */
export function OfflineAudioBlock({
  unitTitle,
  topic,
  onDownload,
  onRemove,
}: OfflineAudioBlockProps) {
  const { t } = useTranslation('learning-path');
  const ownedFocusRef = useRef<HTMLElement | null>(null);
  const downloadButtonRef = useRef<HTMLButtonElement | null>(null);
  const statusRef = useRef<HTMLParagraphElement | null>(null);
  const removeButtonRef = useRef<HTMLButtonElement | null>(null);
  const status = topic.status;
  // Suy ra từ status + canRemove (deps D9). status vẫn là dep: đổi trạng thái là đổi phần tử
  // dòng chữ, dù đích vẫn là 'status' (downloading → downloaded không có nút xóa).
  const focusTarget = resolveFocusTarget(topic);

  // Chỉ khối đang giữ focus ngay trước commit mới chuyển focus, khi phần tử đó vừa bị gỡ (D9).
  useLayoutEffect(() => {
    const owned = ownedFocusRef.current;
    const active = document.activeElement;
    if (!owned || owned.isConnected || (active && active !== document.body)) {
      return;
    }
    const targets: Record<FocusTarget, HTMLElement | null> = {
      'download-button': downloadButtonRef.current,
      status: statusRef.current,
      'remove-button': removeButtonRef.current,
    };
    const target = focusTarget ? targets[focusTarget] : null;
    target?.focus();
    ownedFocusRef.current = target;
  }, [status, focusTarget]);

  function handleFocus(event: FocusEvent<HTMLDivElement>) {
    if (event.target instanceof HTMLElement) {
      ownedFocusRef.current = event.target;
    }
  }

  // Focus rời khối thì bỏ ref; phần tử bị gỡ khi đang focus thì giữ ref cho layout effect (D9).
  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) {
      return;
    }
    if (event.target.isConnected) {
      ownedFocusRef.current = null;
    }
  }

  return (
    <div
      className="offline-audio flex flex-col gap-xs"
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {topic.status === 'available-offline' && (
        <p>{t('offlineAudio.available')}</p>
      )}
      {topic.status === 'not-downloaded' && (
        <button
          ref={downloadButtonRef}
          type="button"
          className="btn btn-secondary offline-audio-button"
          aria-label={t('offlineAudio.downloadLabel', {
            size: formatAudioSize(topic.bytes),
            topic: unitTitle,
          })}
          onClick={onDownload}
        >
          {t('offlineAudio.download', { size: formatAudioSize(topic.bytes) })}
        </button>
      )}
      {topic.status === 'downloading' && (
        <p ref={statusRef} tabIndex={-1} className="offline-audio-status">
          {t('offlineAudio.downloading', { percent: topic.percent })}
        </p>
      )}
      {topic.status === 'downloaded' && (
        <>
          <p ref={statusRef} tabIndex={-1} className="offline-audio-status">
            {t('offlineAudio.downloaded', {
              size: formatAudioSize(topic.bytes),
            })}
          </p>
          {topic.canRemove && (
            <button
              ref={removeButtonRef}
              type="button"
              className="btn btn-secondary offline-audio-button"
              aria-label={t('offlineAudio.removeLabel', { topic: unitTitle })}
              onClick={onRemove}
            >
              {t('offlineAudio.remove')}
            </button>
          )}
        </>
      )}
      {topic.message && (
        <p className="offline-audio-message">
          {t(`offlineAudio.message.${topic.message}`, { topic: unitTitle })}
        </p>
      )}
    </div>
  );
}
