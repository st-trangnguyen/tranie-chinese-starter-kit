import { useTranslation } from 'react-i18next';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * S1.4 AC2: có bản mới thì hiện banner; chỉ tải lại khi người học bấm.
 * Đồng thời là nơi đăng ký service worker (`injectRegister: false` trong vite.config).
 */
export function UpdateBanner() {
  const { t } = useTranslation('common');
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) {
    return null;
  }

  return (
    <div
      role="status"
      className="update-banner mx-auto flex max-w-md items-center gap-md p-lg"
    >
      <p className="update-banner-text flex-1">{t('update.available')}</p>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => setNeedRefresh(false)}
      >
        {t('update.later')}
      </button>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => updateServiceWorker(true)}
      >
        {t('update.reload')}
      </button>
    </div>
  );
}
