import { useId, type KeyboardEvent } from 'react';
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

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      onCancel();
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
        <div className="confirm-dialog-actions flex flex-wrap justify-end gap-md">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            {t('backup.confirm.cancel')}
          </button>
          <button type="button" className="btn btn-primary" onClick={onConfirm}>
            {t('backup.confirm.overwrite')}
          </button>
        </div>
      </div>
    </div>
  );
}
