import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const NotFound = () => {
  const { t } = useTranslation('common');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-lg p-xl">
      <h1 className="app-error-title">{t('notFound.title')}</h1>
      <Link to="/" className="btn btn-primary">
        {t('notFound.home')}
      </Link>
    </main>
  );
};

export default NotFound;
