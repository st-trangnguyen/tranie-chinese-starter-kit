import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import {
  exerciseRegistry,
  type ExerciseRegistry,
} from '@shared/components/exercises/exercise.registry';
import { LessonRunner } from '../components/LessonRunner';
import { useLessonRunner } from '../hooks/useLessonRunner';

interface LessonRunnerContainerProps {
  /** Mặc định là registry thật; test truyền registry giả. */
  registry?: ExerciseRegistry;
}

/** Màn chạy bài (S3.2): lần lượt từng câu, chấm ngay, giải thích khi sai. */
const LessonRunnerContainer = ({
  registry = exerciseRegistry,
}: LessonRunnerContainerProps) => {
  const { t } = useTranslation('lesson');
  const { lessonId = '' } = useParams();
  const {
    lesson,
    session,
    feedback,
    hasError,
    submitResult,
    continueLesson,
    skipExercise,
  } = useLessonRunner(lessonId);
  const exercise = lesson?.exercises[session?.currentIndex ?? 0];

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-lg p-xl">
      {lesson && <h1 className="lesson-title">{lesson.title}</h1>}
      {hasError && (
        <p role="alert" className="lesson-error p-md">
          {t('loadError')}
        </p>
      )}
      {!lesson && !hasError && <p>{t('loading')}</p>}
      {session?.phase === 'finished' && (
        <p className="lesson-finished">{t('finished')}</p>
      )}
      {session && session.phase !== 'finished' && exercise && (
        <LessonRunner
          exercise={exercise}
          session={session}
          feedback={feedback}
          registry={registry}
          handlers={{
            onResult: submitResult,
            onContinue: continueLesson,
            onSkip: skipExercise,
          }}
        />
      )}
    </main>
  );
};

export default LessonRunnerContainer;
