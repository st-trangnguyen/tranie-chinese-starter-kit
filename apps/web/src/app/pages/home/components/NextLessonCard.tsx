import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ROUTE_PATHS } from '@core/constants/app.constants';
import type { NextLesson } from '@shared/models/home.model';

interface NextLessonCardProps {
  nextLesson: NextLesson;
}

/** Thẻ "Bài tiếp theo" trên Trang chủ: tiêu đề bài và liên kết vào học, hoặc báo đã học xong. */
export function NextLessonCard({ nextLesson }: NextLessonCardProps) {
  const { t } = useTranslation('home');

  if (nextLesson.status === 'all-completed') {
    return (
      <section className="home-next-lesson flex flex-col gap-md p-lg">
        <h2>{t('nextLesson')}</h2>
        <p>{t('allCompleted')}</p>
      </section>
    );
  }

  return (
    <section className="home-next-lesson flex flex-col gap-md p-lg">
      <h2>{t('nextLesson')}</h2>
      <p className="home-next-lesson-title">{nextLesson.title}</p>
      <Link
        className="btn btn-primary self-start"
        to={ROUTE_PATHS.lesson(nextLesson.lessonId)}
      >
        {t('startLesson')}
      </Link>
    </section>
  );
}
