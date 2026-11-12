import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import {
  exerciseRegistry,
  type ExerciseRegistry,
} from '@shared/components/exercises/exercise.registry';
import { AudioSpeedProvider } from '@shared/contexts/AudioSpeedContext';
import { LessonRunner } from '../components/LessonRunner';
import { LessonSummary } from '../components/LessonSummary';
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
    contents,
    feedback,
    summary,
    isSaved,
    hasError,
    submitResult,
    continueLesson,
    skipExercise,
  } = useLessonRunner(lessonId);
  const exercise = lesson?.exercises[session?.currentIndex ?? 0];
  const content = exercise ? contents.get(exercise.id) : undefined;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-lg p-xl">
      {lesson && <h1 className="lesson-title">{lesson.title}</h1>}
      {hasError && (
        <p role="alert" className="lesson-error p-md">
          {t('loadError')}
        </p>
      )}
      {!lesson && !hasError && <p>{t('loading')}</p>}
      {summary && <LessonSummary summary={summary} isSaved={isSaved} />}
      {session && session.phase !== 'finished' && exercise && content && (
        <AudioSpeedProvider key={lessonId}>
          <LessonRunner
            view={{
              exercise,
              content,
              current: session.currentIndex + 1,
              total: session.exerciseIds.length,
              feedback,
            }}
            registry={registry}
            handlers={{
              onResult: submitResult,
              onContinue: continueLesson,
              onSkip: skipExercise,
            }}
          />
        </AudioSpeedProvider>
      )}
    </main>
  );
};

export default LessonRunnerContainer;
