import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Lesson } from '@csk/shared';

import type {
  ExerciseContent,
  ExerciseResult,
} from '@shared/models/exercise.model';
import type {
  LessonFeedbackView,
  LessonSession,
  LessonSummary,
} from '@shared/models/lesson-session.model';
import { ContentService } from '@shared/services/content.service';
import { LessonService } from '@shared/services/lesson.service';

export interface LessonRunnerState {
  /** null khi đang nạp hoặc lỗi. */
  lesson: Lesson | null;
  session: LessonSession | null;
  feedback: LessonFeedbackView | null;
  /** Tổng kết khi hết câu; null khi chưa xong bài (S3.4). */
  summary: LessonSummary | null;
  /** false khi ghi tiến độ "đã xong" lỗi (S3.4). */
  isSaved: boolean;
  hasError: boolean;
  /** Từ/câu của từng câu bài tập theo exercise id; rỗng khi chưa mở bài (S4.4). */
  contents: ReadonlyMap<string, ExerciseContent>;
  submitResult: (result: ExerciseResult) => void;
  continueLesson: () => void;
  skipExercise: () => void;
  /** Làm lại bài kiểm tra từ câu 1, không nạp lại nội dung (S3.5). */
  restart: () => void;
}

/** Bài đã nạp, gắn với `lessonId` để đổi bài thì không lẫn sang bài cũ. */
interface OpenedState {
  lessonId: string;
  lesson: Lesson;
  session: LessonSession;
  contents: ReadonlyMap<string, ExerciseContent>;
}

const NO_CONTENTS: ReadonlyMap<string, ExerciseContent> = new Map();

/** Mốc vị trí đã ghi nhận gần nhất của một bài. */
interface SavedMark {
  lessonId: string;
  index: number;
  isFinished: boolean;
}

export interface LessonRunnerOptions {
  /** Chủ đề đang vượt cấp (S3.6): đạt thì đánh dấu xong mọi bài của chủ đề. */
  placementUnitId?: string;
}

/** State của một lượt làm bài; quy tắc nằm ở `LessonService` (S3.2). */
export const useLessonRunner = (
  lessonId: string,
  options?: LessonRunnerOptions,
): LessonRunnerState => {
  const placementUnitId = options?.placementUnitId;
  const service = useMemo(() => new LessonService(), []);
  const contentService = useMemo(() => new ContentService(), []);
  const [opened, setOpened] = useState<OpenedState | null>(null);
  const [failedLessonId, setFailedLessonId] = useState<string | null>(null);
  const [unsavedLessonId, setUnsavedLessonId] = useState<string | null>(null);
  const finishedLessonIdRef = useRef<string | null>(null);
  const savedMarkRef = useRef<SavedMark | null>(null);

  useEffect(() => {
    let isActive = true;
    service
      .openLesson(lessonId)
      .then(async (result) => ({
        ...result,
        contents: await contentService.getExerciseContents(result.lesson),
      }))
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
  }, [service, contentService, lessonId]);

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

  const restart = useCallback(() => {
    // Phiên mới là lượt đầu mới: gỡ cờ đã kết thúc và đặt mốc vị trí về câu 1 để việc ghi
    // và chuyển câu sai diễn ra đúng như lượt đầu.
    finishedLessonIdRef.current = null;
    savedMarkRef.current = { lessonId, index: 0, isFinished: false };
    setUnsavedLessonId(null);
    setOpened((current) =>
      current && current.lessonId === lessonId
        ? {
            ...current,
            session: service.startSession(current.lesson.exercises, 0),
          }
        : current,
    );
  }, [service, lessonId]);

  const current = opened?.lessonId === lessonId ? opened : null;
  const session = current?.session ?? null;
  const lessonType = current?.lesson.type ?? null;

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

  // Kết thúc bài đúng một lần khi hết câu (S3.4). Cờ chỉ được gỡ khi bài đó được làm lại
  // (session đang trả lời), nên session cũ còn sót lúc đổi bài không ghi lần hai. Kết quả
  // gắn với lessonId nên bài cũ không đè lên bài mới.
  useEffect(() => {
    if (openedLessonId === null) {
      return;
    }
    if (!isFinished) {
      finishedLessonIdRef.current = null;
      return;
    }
    const latest = latestSessionRef.current;
    if (!latest || finishedLessonIdRef.current === openedLessonId) {
      return;
    }
    finishedLessonIdRef.current = openedLessonId;
    // Xếp sau lần lưu vị trí trong cùng hàng đợi: ghi "completed" luôn đến sau ghi "in-progress".
    saveQueueRef.current = saveQueueRef.current
      .then(async () =>
        service.finishLesson(
          openedLessonId,
          latest,
          placementUnitId === undefined
            ? undefined
            : {
                lessonIds:
                  await contentService.getUnitLessonIds(placementUnitId),
              },
        ),
      )
      .then((outcome) =>
        setUnsavedLessonId(outcome.isSaved ? null : openedLessonId),
      )
      .catch(() => setUnsavedLessonId(openedLessonId));
  }, [service, contentService, placementUnitId, openedLessonId, isFinished]);

  const summary = useMemo(
    () =>
      session?.phase === 'finished' && lessonType
        ? service.summarize(session, lessonType)
        : null,
    [service, session, lessonType],
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
    lesson: current?.lesson ?? null,
    session,
    feedback,
    summary,
    isSaved: unsavedLessonId !== lessonId,
    hasError: failedLessonId === lessonId,
    contents: current?.contents ?? NO_CONTENTS,
    submitResult,
    continueLesson,
    skipExercise,
    restart,
  };
};
