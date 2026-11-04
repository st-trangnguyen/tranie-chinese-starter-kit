import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

/** Chỗ giữ route bài học. E3 (lesson runner) thay bằng màn chạy bài thật. */
const LessonPlaceholder = () => {
  const { t } = useTranslation('lesson');
  const { lessonId = '' } = useParams();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-md p-xl">
      <h1 className="lesson-placeholder-title">
        {t('placeholder.title', { lessonId })}
      </h1>
      <p className="lesson-placeholder-text">{t('placeholder.body')}</p>
    </main>
  );
};

export default LessonPlaceholder;
