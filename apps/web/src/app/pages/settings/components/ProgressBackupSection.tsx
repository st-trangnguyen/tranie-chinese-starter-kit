import { useId, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { ProgressBackupView } from '@shared/models/progress-backup.model';

interface ProgressBackupSectionProps {
  backup: ProgressBackupView;
}

/** Mục "Sao lưu tiến độ" trong màn Cài đặt (S8.5, design D7). */
export function ProgressBackupSection({ backup }: ProgressBackupSectionProps) {
  const { t } = useTranslation('settings');
  const titleId = useId();
  const { message } = backup;
  const successText =
    message?.tone === 'success' ? t(`backup.messages.${message.key}`) : '';
  const errorText =
    message?.tone === 'error'
      ? `${t('backup.errorPrefix')} ${t(`backup.messages.${message.key}`)}`
      : '';

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    // Xoá lựa chọn để chọn lại cùng file vẫn có sự kiện `change` (design D7).
    input.value = '';
    backup.selectFile(file);
  };

  return (
    <section
      aria-labelledby={titleId}
      className="backup-section flex flex-col gap-md p-lg"
    >
      <h2 id={titleId} className="backup-section-title">
        {t('backup.title')}
      </h2>
      <div className="flex flex-wrap gap-md">
        <button
          type="button"
          className="btn btn-primary"
          onClick={backup.exportProgress}
        >
          {t('backup.export')}
        </button>
        <button type="button" className="btn btn-ghost">
          {t('backup.import')}
        </button>
      </div>
      <input type="file" hidden onChange={handleFileChange} />
      <p role="status" className="backup-message">
        {successText}
      </p>
      <p role="alert" className="backup-message has-error">
        {errorText}
      </p>
    </section>
  );
}
