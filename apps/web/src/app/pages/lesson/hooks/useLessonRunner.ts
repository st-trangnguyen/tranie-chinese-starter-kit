import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Lesson } from '@csk/shared';

import type { ExerciseResult } from '@shared/models/exercise.model';
import type {
  LessonFeedbackView,
  LessonSession,
} from '@shared/models/lesson-session.model';
import { LessonService } from '@shared/services/lesson.service';

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

/** Bài đã nạp, gắn với `lessonId` để đổi bài thì không lẫn sang bài cũ. */
interface OpenedState {
  lessonId: string;
  lesson: Lesson;
  session: LessonSession;
}

/** State của một lượt làm bài; quy tắc nằm ở `LessonService` (S3.2). */
export const useLessonRunner = (lessonId: string): LessonRunnerState => {
  const service = useMemo(() => new LessonService(), []);
  const [opened, setOpened] = useState<OpenedState | null>(null);
  const [failedLessonId, setFailedLessonId] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    service
      .openLesson(lessonId)
      .then((result) => {
        if (isActive) {
          setFailedLessonId(null);
          setOpened({ lessonId, ...result });
        }
      })
      .catch(() => {
        if (isActive) {
          setFailedLessonId(lessonId);
        }
      });
    return () => {
      isActive = false;
    };
  }, [service, lessonId]);

  const updateSession = useCallback(
    (change: (session: LessonSession) => LessonSession) =>
      setOpened((current) =>
        current ? { ...current, session: change(current.session) } : current,
      ),
    [],
  );
  const submitResult = useCallback(
    (result: ExerciseResult) =>
      updateSession((session) => service.submitResult(session, result)),
    [service, updateSession],
  );
  const continueLesson = useCallback(
    () => updateSession((session) => service.advance(session)),
    [service, updateSession],
  );
  const skipExercise = useCallback(
    () => updateSession((session) => service.skip(session)),
    [service, updateSession],
  );

  const current = opened?.lessonId === lessonId ? opened : null;
  const session = current?.session ?? null;
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
    lesson: current?.lesson ?? null,
    session,
    feedback,
    hasError: failedLessonId === lessonId,
    submitResult,
    continueLesson,
    skipExercise,
  };
};
