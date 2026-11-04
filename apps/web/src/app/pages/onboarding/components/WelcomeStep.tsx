import { useTranslation } from 'react-i18next';

import { APP_NAME } from '@core/constants/app.constants';

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const { t } = useTranslation('onboarding');

  return (
    <section
      aria-labelledby="onboarding-welcome-title"
      className="flex flex-col items-center gap-xl"
    >
      <img
        src="/icons/app-logo.svg"
        alt=""
        width={128}
        height={128}
        className="onboarding-logo"
      />
      <div className="flex flex-col items-center gap-sm">
        <h1 id="onboarding-welcome-title" className="onboarding-title">
          {t('welcome.title', { appName: APP_NAME })}
        </h1>
        <p className="onboarding-text">{t('welcome.body')}</p>
      </div>
      <button type="button" className="btn btn-primary w-full" onClick={onNext}>
        {t('welcome.start')}
      </button>
    </section>
  );
}
