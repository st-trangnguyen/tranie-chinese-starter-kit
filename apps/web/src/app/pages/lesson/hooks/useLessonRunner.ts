import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

/** Mốc vị trí đã ghi nhận gần nhất của một bài. */
interface SavedMark {
  lessonId: string;
  index: number;
  isFinished: boolean;
}

/** State của một lượt làm bài; quy tắc nằm ở `LessonService` (S3.2). */
export const useLessonRunner = (lessonId: string): LessonRunnerState => {
  const service = useMemo(() => new LessonService(), []);
  const [opened, setOpened] = useState<OpenedState | null>(null);
  const [failedLessonId, setFailedLessonId] = useState<string | null>(null);
  const savedMarkRef = useRef<SavedMark | null>(null);

  useEffect(() => {
    let isActive = true;
    service
      .openLesson(lessonId)
      .then((result) => {
        if (isActive) {
          setFailedLessonId(null);
          // Mốc khớp đúng session vừa nạp: mở bài không ghi, và lần đổi câu đầu tiên sau đó
          // luôn so với vị trí của session đang hiển thị.
          savedMarkRef.current = {
            lessonId,
            index: result.session.currentIndex,
            isFinished: result.session.phase === 'finished',
          };
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

  // Lưu vị trí khi đổi câu hoặc kết thúc bài (D4); không lưu khi chỉ xem kết quả.
  const latestSessionRef = useRef<LessonSession | null>(null);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => {
    latestSessionRef.current = session;
  });
  const openedLessonId = current?.lessonId ?? null;
  const currentIndex = session?.currentIndex ?? null;
  const isFinished = session?.phase === 'finished';
  useEffect(() => {
    if (openedLessonId === null || currentIndex === null) {
      return;
    }
    const previous = savedMarkRef.current;
    savedMarkRef.current = {
      lessonId: openedLessonId,
      index: currentIndex,
      isFinished,
    };
    const latest = latestSessionRef.current;
    // Lần đầu thấy session của bài này là lúc mở bài, chưa có thay đổi nào để lưu.
    if (!latest || previous === null || previous.lessonId !== openedLessonId) {
      return;
    }
    if (previous.index === currentIndex && previous.isFinished === isFinished) {
      return;
    }
    saveQueueRef.current = saveQueueRef.current
      .then(() => service.saveCursor(openedLessonId, latest))
      .catch(() => undefined);
  }, [service, openedLessonId, currentIndex, isFinished]);

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
