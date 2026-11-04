import type { FallbackProps } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';

const AppErrorBoundaryFallback = ({ resetErrorBoundary }: FallbackProps) => {
  const { t } = useTranslation('common');

  return (
    <main
      role="alert"
      className="flex min-h-screen flex-col items-center justify-center gap-lg p-xl"
    >
      <h1 className="app-error-title">{t('error.title')}</h1>
      <button
        type="button"
        className="btn btn-primary"
        onClick={resetErrorBoundary}
      >
        {t('error.retry')}
      </button>
    </main>
  );
};

export default AppErrorBoundaryFallback;
