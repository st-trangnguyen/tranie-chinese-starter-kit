import { useEffect, useId, useRef, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { ImportPreview } from '@shared/models/progress-backup.model';
import { formatLocalDateKey } from '@shared/utils/date.utils';

interface ImportConfirmDialogProps {
  preview: ImportPreview;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Hộp xác nhận ghi đè tiến độ khi nhập file (S8.5 AC3, design D7). Tự làm, không dùng `showModal`. */
export function ImportConfirmDialog({
  preview,
  onConfirm,
  onCancel,
}: ImportConfirmDialogProps) {
  const { t } = useTranslation('settings');
  const titleId = useId();
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const overwriteButtonRef = useRef<HTMLButtonElement>(null);

  // Mở hộp thì focus "Hủy" để Enter vô tình không ghi đè tiến độ.
  useEffect(() => {
    cancelButtonRef.current?.focus();
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      onCancel();
      return;
    }
    if (event.key !== 'Tab') {
      return;
    }
    // Giữ focus trong hộp: chỉ vòng giữa "Hủy" (đầu) và "Ghi đè" (cuối).
    const first = cancelButtonRef.current;
    const last = overwriteButtonRef.current;
    const edge = event.shiftKey ? first : last;
    const wrapTo = event.shiftKey ? last : first;
    if (document.activeElement === edge && wrapTo !== null) {
      event.preventDefault();
      wrapTo.focus();
    }
  }

  return (
    <div className="confirm-dialog-overlay flex items-center justify-center p-md">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onKeyDown={handleKeyDown}
        className="confirm-dialog flex max-h-full w-full max-w-md flex-col gap-md overflow-y-auto p-lg"
      >
        <h2 id={titleId} className="confirm-dialog-title">
          {t('backup.confirm.title')}
        </h2>
        <div id={descriptionId} className="flex flex-col gap-sm">
          <p>
            {t('backup.confirm.summary', {
              date: formatLocalDateKey(preview.exportedOn),
              count: preview.completedLessonCount,
            })}
          </p>
          <p className="confirm-dialog-warning">
            {t('backup.confirm.warning')}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-md">
          <button
            ref={cancelButtonRef}
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
          >
            {t('backup.confirm.cancel')}
          </button>
          <button
            ref={overwriteButtonRef}
            type="button"
            className="btn btn-primary"
            onClick={onConfirm}
          >
            {t('backup.confirm.overwrite')}
          </button>
        </div>
      </div>
    </div>
  );
}
