import type { LessonProgress } from '@csk/shared';

import { TEST_PASS_PERCENT } from '@core/constants/lesson.constants';
import type { ExerciseResult } from '@shared/models/exercise.model';
import type {
  LessonSession,
  LessonSummary,
} from '@shared/models/lesson-session.model';

// Rule: chỉ nối lại ở vị trí đã lưu khi nó là số nguyên nằm trong bài; ngược lại bắt đầu từ đầu.
export function resolveStartIndex(
  savedCursor: number | undefined,
  exerciseCount: number,
): number {
  if (
    savedCursor !== undefined &&
    Number.isInteger(savedCursor) &&
    savedCursor >= 0 &&
    savedCursor < exerciseCount
  ) {
    return savedCursor;
  }
  return 0;
}

// Rule: trả lời xong thì chấm ngay, hiện kết quả trước khi sang câu kế.
export function applyResult(
  session: LessonSession,
  result: ExerciseResult,
): LessonSession {
  // Bấm đúp hoặc trả lời lặp thì giữ nguyên kết quả đầu.
  if (session.phase !== 'answering') {
    return session;
  }
  return {
    ...session,
    phase: 'feedback',
    lastResult: result,
    correctCount: session.correctCount + (result.isCorrect ? 1 : 0),
    wrongCount: session.wrongCount + (result.isCorrect ? 0 : 1),
    wrongExerciseIds: result.isCorrect
      ? session.wrongExerciseIds
      : [
          ...session.wrongExerciseIds,
          session.exerciseIds[session.currentIndex],
        ],
  };
}

// Rule: sang câu kế; hết câu cuối thì kết thúc bài.
export function moveToNext(session: LessonSession, now: number): LessonSession {
  const nextIndex = session.currentIndex + 1;
  if (nextIndex >= session.exerciseIds.length) {
    return {
      ...session,
      phase: 'finished',
      lastResult: null,
      finishedAt: now,
    };
  }
  return {
    ...session,
    currentIndex: nextIndex,
    phase: 'answering',
    lastResult: null,
  };
}

// Rule: bài kiểm tra đạt khi đúng ít nhất TEST_PASS_PERCENT% số câu; so sánh số nguyên, không float.
export function isTestPassed(
  correctCount: number,
  totalCount: number,
): boolean {
  return totalCount > 0 && correctCount * 100 >= TEST_PASS_PERCENT * totalCount;
}

// Rule: điểm = đúng / đã trả lời, làm tròn nguyên; chưa trả lời câu nào thì 0.
// Bài thường trọn vẹn khi xong, không bỏ câu nào (isPassed = null); bài kiểm tra còn phải đạt ngưỡng.
export function summarizeSession(
  session: LessonSession,
  lessonType: 'lesson' | 'test',
): LessonSummary {
  const answeredCount = session.correctCount + session.wrongCount;
  const elapsedMs =
    session.finishedAt === null ? 0 : session.finishedAt - session.startedAt;
  const isPassed =
    lessonType === 'test'
      ? isTestPassed(session.correctCount, answeredCount)
      : null;
  const isFinishedWithoutSkips =
    session.phase === 'finished' && session.skippedCount === 0;
  return {
    scorePercent:
      answeredCount === 0
        ? 0
        : Math.round((session.correctCount / answeredCount) * 100),
    correctCount: session.correctCount,
    answeredCount,
    wrongCount: session.wrongCount,
    skippedCount: session.skippedCount,
    elapsedSeconds: Math.max(0, Math.round(elapsedMs / 1000)),
    isPassed,
    isComplete:
      lessonType === 'test'
        ? isFinishedWithoutSkips && isPassed === true
        : isFinishedWithoutSkips,
  };
}

// Rule: thoát giữa chừng không làm bài đã hoàn thành mất trạng thái; luôn ghi vị trí mới.
export function nextProgress(
  existing: LessonProgress | undefined,
  lessonId: string,
  cursor: number,
): LessonProgress {
  const status = existing?.status === 'completed' ? 'completed' : 'in-progress';
  return { lessonId, status, cursor };
}

// Rule: học xong bài thì không còn vị trí để nối lại; trạng thái hoàn thành được giữ nguyên.
export function finishedProgress(
  existing: LessonProgress | undefined,
  lessonId: string,
): LessonProgress {
  const status = existing?.status === 'completed' ? 'completed' : 'in-progress';
  return { lessonId, status };
}
