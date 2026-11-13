import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import {
  exerciseRegistry,
  type ExerciseRegistry,
} from '@shared/components/exercises/exercise.registry';
import { AudioSpeedProvider } from '@shared/contexts/AudioSpeedContext';
import { RecordingModeProvider } from '@shared/contexts/RecordingModeContext';
import { LessonRunner } from '../components/LessonRunner';
import { LessonSummary } from '../components/LessonSummary';
import { useLessonRunner } from '../hooks/useLessonRunner';

interface LessonRunnerContainerProps {
  /** Mặc định là registry thật; test truyền registry giả. */
  registry?: ExerciseRegistry;
  /** Bài cần chạy; mặc định lấy từ URL `lessons/:lessonId`. */
  lessonId?: string;
  /** Chủ đề đang vượt cấp (S3.6). */
  placementUnitId?: string;
}

/** Màn chạy bài (S3.2): lần lượt từng câu, chấm ngay, giải thích khi sai. */
const LessonRunnerContainer = ({
  registry = exerciseRegistry,
  lessonId: lessonIdProp,
  placementUnitId,
}: LessonRunnerContainerProps) => {
  const { t } = useTranslation('lesson');
  const { lessonId: lessonIdParam = '' } = useParams();
  const lessonId = lessonIdProp ?? lessonIdParam;
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
    restart,
  } = useLessonRunner(lessonId, { placementUnitId });
  const [restartedLessonId, setRestartedLessonId] = useState<string | null>(
    null,
  );
  const isRestarted = restartedLessonId === lessonId;
  const handleRestart = () => {
    setRestartedLessonId(lessonId);
    restart();
  };
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
      {!lesson && !hasError && <p role="status">{t('loading')}</p>}
      {summary && (
        <LessonSummary
          summary={summary}
          isSaved={isSaved}
          onRestart={handleRestart}
        />
      )}
      {session && session.phase !== 'finished' && exercise && content && (
        <AudioSpeedProvider key={lessonId}>
          <RecordingModeProvider key={lessonId}>
            <LessonRunner
              view={{
                exercise,
                content,
                current: session.currentIndex + 1,
                total: session.exerciseIds.length,
                feedback,
              }}
              registry={registry}
              shouldFocusProgress={isRestarted}
              handlers={{
                onResult: submitResult,
                onContinue: continueLesson,
                onSkip: skipExercise,
              }}
            />
          </RecordingModeProvider>
        </AudioSpeedProvider>
      )}
    </main>
  );
};

export default LessonRunnerContainer;
