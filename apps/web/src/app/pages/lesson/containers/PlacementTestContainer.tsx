import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import {
  exerciseRegistry,
  type ExerciseRegistry,
} from '@shared/components/exercises/exercise.registry';
import { usePlacementTest } from '../hooks/usePlacementTest';
import LessonRunnerContainer from './LessonRunnerContainer';

interface PlacementTestContainerProps {
  /** Mặc định là registry thật; test truyền registry giả. */
  registry?: ExerciseRegistry;
}

/** Màn kiểm tra vượt cấp (S3.6): chạy bài kiểm tra của chủ đề bằng màn chạy bài của S3.5. */
const PlacementTestContainer = ({
  registry = exerciseRegistry,
}: PlacementTestContainerProps) => {
  const { t } = useTranslation('lesson');
  const { unitId = '' } = useParams();
  const { lessonId, hasError } = usePlacementTest(unitId);

  if (lessonId !== null) {
    return (
      <LessonRunnerContainer
        registry={registry}
        lessonId={lessonId}
        placementUnitId={unitId}
      />
    );
  }
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-lg p-xl">
      {hasError ? (
        <p role="alert" className="lesson-error p-md">
          {t('loadError')}
        </p>
      ) : (
        <p>{t('loading')}</p>
      )}
    </main>
  );
};

export default PlacementTestContainer;
