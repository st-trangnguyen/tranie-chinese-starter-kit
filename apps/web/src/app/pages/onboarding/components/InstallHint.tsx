import { useTranslation } from 'react-i18next';

interface InstallHintProps {
  canPrompt: boolean;
  isIos: boolean;
  onInstall: () => void;
  onSkip: () => void;
}

/** S1.3 AC2: app chưa chạy như PWA thì gợi ý cài, luôn có nút bỏ qua. */
export function InstallHint({
  canPrompt,
  isIos,
  onInstall,
  onSkip,
}: InstallHintProps) {
  const { t } = useTranslation('onboarding');

  return (
    <section
      aria-labelledby="install-hint-title"
      className="flex flex-col gap-xl"
    >
      <div className="flex flex-col gap-sm">
        <h1 id="install-hint-title" className="onboarding-title">
          {t('install.title')}
        </h1>
        <p className="onboarding-text">{t('install.body')}</p>
        {isIos && <p className="onboarding-text">{t('install.ios')}</p>}
        {!isIos && !canPrompt && (
          <p className="onboarding-text">{t('install.manual')}</p>
        )}
      </div>
      <div className="flex flex-col gap-md">
        {canPrompt && (
          <button
            type="button"
            className="btn btn-primary w-full"
            onClick={onInstall}
          >
            {t('install.action')}
          </button>
        )}
        <button
          type="button"
          className={`btn w-full ${canPrompt ? 'btn-ghost' : 'btn-primary'}`}
          onClick={onSkip}
        >
          {canPrompt ? t('install.skip') : t('install.continue')}
        </button>
      </div>
    </section>
  );
}
