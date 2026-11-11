import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Lesson } from '@csk/shared';

import type { ExerciseResult } from '@shared/models/exercise.model';
import type { LessonSession } from '@shared/models/lesson-session.model';
import { LessonService } from '@shared/services/lesson.service';
import type { LessonFeedbackView } from '../components/LessonRunner';

export interface LessonRunnerState {
  /** null khi đang nạp hoặc lỗi. */
  lesson: Lesson | null;
  session: LessonSession | null;
  feedback: LessonFeedbackView | null;
  hasError: boolean;
  submitResult: (result: ExerciseResult) => void;
  continueLesson: () => void;
  skipExercise: () => void;
}

/** State của một lượt làm bài; quy tắc nằm ở `LessonService` (S3.2). */
export const useLessonRunner = (lessonId: string): LessonRunnerState => {
  const service = useMemo(() => new LessonService(), []);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [session, setSession] = useState<LessonSession | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isActive = true;
    service
      .openLesson(lessonId)
      .then((opened) => {
        if (isActive) {
          setLesson(opened.lesson);
          setSession(opened.session);
        }
      })
      .catch(() => {
        if (isActive) {
          setHasError(true);
        }
      });
    return () => {
      isActive = false;
    };
  }, [service, lessonId]);

  const submitResult = useCallback(
    (result: ExerciseResult) =>
      setSession((current) =>
        current ? service.submitResult(current, result) : current,
      ),
    [service],
  );
  const continueLesson = useCallback(
    () =>
      setSession((current) => (current ? service.advance(current) : current)),
    [service],
  );
  const skipExercise = useCallback(
    () => setSession((current) => (current ? service.skip(current) : current)),
    [service],
  );

  const result = session?.lastResult ?? null;
  const feedback: LessonFeedbackView | null =
    session?.phase === 'feedback' && result
      ? {
          isCorrect: result.isCorrect,
          explanation: service.shouldShowExplanation(result)
            ? result.explanation
            : undefined,
        }
      : null;

  return {
    lesson,
    session,
    feedback,
    hasError,
    submitResult,
    continueLesson,
    skipExercise,
  };
};
