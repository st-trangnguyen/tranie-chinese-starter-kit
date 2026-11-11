import type { Exercise } from '@csk/shared';

import type { ExerciseResult } from '@shared/models/exercise.model';
import type { LessonSession } from '@shared/models/lesson-session.model';

export class LessonService {
  // ── PHẦN 1 — TRUY CẬP DỮ LIỆU ─────────────────────────
  // Chưa có: phiên làm bài chỉ nằm trong bộ nhớ (S3.3 sẽ lưu vị trí câu).

  // ── PHẦN 2 — QUY TẮC NGHIỆP VỤ ───────────────────────

  // Rule: bài bắt đầu ở câu đầu tiên và chờ người học trả lời.
  startSession(exercises: readonly Exercise[]): LessonSession {
    return {
      exerciseIds: exercises.map((exercise) => exercise.id),
      currentIndex: 0,
      phase: 'answering',
      lastResult: null,
    };
  }

  // Rule: trả lời xong thì chấm ngay, hiện kết quả trước khi sang câu kế.
  submitResult(session: LessonSession, result: ExerciseResult): LessonSession {
    // Bấm đúp hoặc trả lời lặp thì giữ nguyên kết quả đầu.
    if (session.phase !== 'answering') {
      return session;
    }
    return { ...session, phase: 'feedback', lastResult: result };
  }

  // Rule: sang câu kế sau khi đã xem kết quả; hết câu cuối thì kết thúc bài.
  advance(session: LessonSession): LessonSession {
    if (session.phase !== 'feedback') {
      return session;
    }
    const nextIndex = session.currentIndex + 1;
    if (nextIndex >= session.exerciseIds.length) {
      return { ...session, phase: 'finished', lastResult: null };
    }
    return {
      ...session,
      currentIndex: nextIndex,
      phase: 'answering',
      lastResult: null,
    };
  }

  // Rule: chỉ giải thích khi trả lời sai; câu đúng không cần giải thích.
  shouldShowExplanation(result: ExerciseResult): boolean {
    return !result.isCorrect && result.explanation !== undefined;
  }

  // ── PHẦN 3 — USE CASES ───────────────────────────────
}
