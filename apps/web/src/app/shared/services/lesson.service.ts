import type { Exercise, Lesson } from '@csk/shared';

import type { ExerciseResult } from '@shared/models/exercise.model';
import type { LessonSession } from '@shared/models/lesson-session.model';
import { ContentService } from './content.service';

export type LessonSource = Pick<ContentService, 'getLesson'>;

export interface OpenedLesson {
  lesson: Lesson;
  session: LessonSession;
}

export class LessonService {
  constructor(private readonly source: LessonSource = new ContentService()) {}

  // ── PHẦN 1 — TRUY CẬP DỮ LIỆU ─────────────────────────
  // Phiên làm bài chỉ nằm trong bộ nhớ (S3.3 sẽ lưu vị trí câu).

  private readLesson(lessonId: string): Promise<Lesson> {
    return this.source.getLesson(lessonId);
  }

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

  // Rule: câu có dạng bài chưa được hỗ trợ thì được bỏ qua, không có kết quả đúng/sai.
  skip(session: LessonSession): LessonSession {
    return this.advance({ ...session, phase: 'feedback' });
  }

  // Rule: chỉ giải thích khi trả lời sai; câu đúng không cần giải thích.
  shouldShowExplanation(result: ExerciseResult): boolean {
    return !result.isCorrect && result.explanation !== undefined;
  }

  // ── PHẦN 3 — USE CASES ───────────────────────────────

  async openLesson(lessonId: string): Promise<OpenedLesson> {
    const lesson = await this.readLesson(lessonId);
    return { lesson, session: this.startSession(lesson.exercises) };
  }
}
