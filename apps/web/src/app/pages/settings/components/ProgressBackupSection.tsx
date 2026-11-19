import { useId } from 'react';
import { useTranslation } from 'react-i18next';

/** Mục "Sao lưu tiến độ" trong màn Cài đặt (S8.5, design D7). */
export function ProgressBackupSection() {
  const { t } = useTranslation('settings');
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className="backup-section flex flex-col gap-md p-lg"
    >
      <h2 id={titleId} className="backup-section-title">
        {t('backup.title')}
      </h2>
      <div className="flex flex-wrap gap-md">
        <button type="button" className="btn btn-primary">
          {t('backup.export')}
        </button>
        <button type="button" className="btn btn-ghost">
          {t('backup.import')}
        </button>
      </div>
    </section>
  );
}
