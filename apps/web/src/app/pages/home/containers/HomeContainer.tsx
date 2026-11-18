import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ROUTE_PATHS } from '@core/constants/app.constants';

import { NextLessonCard } from '../components/NextLessonCard';
import { useHome } from '../hooks/useHome';

/** Màn Trang chủ (S8.1): điểm vào mỗi lần mở lại app sau onboarding. */
const HomeContainer = () => {
  const { t } = useTranslation('home');
  const { nextLesson } = useHome();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-xl p-xl">
      <h1>{t('title')}</h1>
      {nextLesson === null ? (
        <p role="status">{t('loading')}</p>
      ) : (
        <NextLessonCard nextLesson={nextLesson} />
      )}
      {/* Luôn hiện, kể cả khi nạp lộ trình lỗi (design D6); đứng sau "Vào học" theo thứ tự focus. */}
      <Link className="btn btn-ghost self-start" to={ROUTE_PATHS.learningPaths}>
        {t('learningPathLink')}
      </Link>
    </main>
  );
};

export default HomeContainer;
