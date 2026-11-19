import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Unit } from '@csk/shared';

import { ROUTE_PATHS } from '@core/constants/app.constants';

import { LearningPathLessonItem } from '../components/LearningPathLessonItem';
import { LearningPathStage } from '../components/LearningPathStage';
import { OfflineAudioAnnouncer } from '../components/OfflineAudioAnnouncer';
import { OfflineAudioBlock } from '../components/OfflineAudioBlock';
import { useLearningPath } from '../hooks/useLearningPath';
import { useOfflineAudio } from '../hooks/useOfflineAudio';

/** Màn bản đồ lộ trình (S3.1): giai đoạn → nhóm → bài theo thứ tự. */
const LearningPathContainer = () => {
  const { t } = useTranslation('learning-path');
  const { pathMap, statuses, placementTestUnitIds, hasError } =
    useLearningPath();
  const { topics, announcements, download, remove } = useOfflineAudio(
    pathMap?.stages,
  );

  const renderLesson = (lessonId: string) => (
    <LearningPathLessonItem
      key={lessonId}
      lessonId={lessonId}
      title={pathMap?.lessonTitles.get(lessonId) ?? lessonId}
      status={statuses.get(lessonId) ?? 'locked'}
    />
  );

  // Khối audio offline nằm trên link kiểm tra vượt cấp (S8.4, design D9).
  const renderUnitActions = (unit: Unit) => {
    const topic = topics.get(unit.id);
    return (
      <>
        {topic && (
          <OfflineAudioBlock
            unitTitle={unit.title}
            topic={topic}
            onDownload={() => download({ id: unit.id, title: unit.title })}
            onRemove={() => remove({ id: unit.id, title: unit.title })}
          />
        )}
        {placementTestUnitIds.has(unit.id) && (
          <Link
            to={ROUTE_PATHS.placementTest(unit.id)}
            className="unit-placement-link p-md"
          >
            {t('placementTest')}
          </Link>
        )}
      </>
    );
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-xl p-xl">
      <Link
        to={ROUTE_PATHS.home}
        className="learning-path-home-link self-start"
      >
        {t('homeLink')}
      </Link>
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
          renderUnitActions={renderUnitActions}
        />
      ))}
      <OfflineAudioAnnouncer announcements={announcements} />
    </main>
  );
};

export default LearningPathContainer;
