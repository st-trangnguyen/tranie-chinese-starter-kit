import { useTranslation } from 'react-i18next';

import { LearningPathLessonItem } from '../components/LearningPathLessonItem';
import { LearningPathStage } from '../components/LearningPathStage';
import { useLearningPath } from '../hooks/useLearningPath';

/** Màn bản đồ lộ trình (S3.1): giai đoạn → nhóm → bài theo thứ tự. */
const LearningPathContainer = () => {
  const { t } = useTranslation('learning-path');
  const { pathMap, hasError } = useLearningPath();

  const renderLesson = (lessonId: string) => (
    <LearningPathLessonItem
      key={lessonId}
      title={pathMap?.lessonTitles.get(lessonId) ?? lessonId}
    />
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-xl p-xl">
      <h1 className="learning-path-title">{t('title')}</h1>
      {hasError && (
        <p role="alert" className="learning-path-error p-md">
          {t('loadError')}
        </p>
      )}
      {pathMap?.stages.map((stage) => (
        <LearningPathStage
          key={stage.id}
          title={stage.title}
          units={stage.units}
          renderLesson={renderLesson}
        />
      ))}
    </main>
  );
};

export default LearningPathContainer;
