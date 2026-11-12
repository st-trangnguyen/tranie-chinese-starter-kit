import type { Exercise, Lesson, LessonProgress } from '@csk/shared';

import {
  progressStore,
  type ProgressStore,
} from '@core/services/progress-store.service';
import type { ExerciseResult } from '@shared/models/exercise.model';
import type {
  LessonSession,
  LessonSummary,
} from '@shared/models/lesson-session.model';
import { ContentService } from './content.service';

export type LessonSource = Pick<ContentService, 'getLesson'>;

export interface OpenedLesson {
  lesson: Lesson;
  session: LessonSession;
}

export class LessonService {
  constructor(
    private readonly source: LessonSource = new ContentService(),
    private readonly store: ProgressStore = progressStore,
  ) {}

  // ── PHẦN 1 — TRUY CẬP DỮ LIỆU ─────────────────────────

  private readLesson(lessonId: string): Promise<Lesson> {
    return this.source.getLesson(lessonId);
  }

  private readCursor(lessonId: string): Promise<LessonProgress | undefined> {
    return this.store.getLessonProgress(lessonId);
  }

  private writeCursor(progress: LessonProgress): Promise<void> {
    return this.store.saveLessonProgress(progress);
  }

  // ── PHẦN 2 — QUY TẮC NGHIỆP VỤ ───────────────────────

  // Rule: chỉ nối lại ở vị trí đã lưu khi nó là số nguyên nằm trong bài; ngược lại bắt đầu từ đầu.
  resolveStartIndex(
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

  // Rule: bài bắt đầu ở vị trí chỉ định (mặc định câu đầu) và chờ người học trả lời.
  startSession(
    exercises: readonly Exercise[],
    startIndex = 0,
    now: number = Date.now(),
  ): LessonSession {
    return {
      exerciseIds: exercises.map((exercise) => exercise.id),
      currentIndex: this.resolveStartIndex(startIndex, exercises.length),
      phase: 'answering',
      lastResult: null,
      skippedCount: 0,
      correctCount: 0,
      wrongCount: 0,
      startedAt: now,
      finishedAt: null,
    };
  }

  // Rule: trả lời xong thì chấm ngay, hiện kết quả trước khi sang câu kế.
  submitResult(session: LessonSession, result: ExerciseResult): LessonSession {
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
    };
  }

  // Rule: sang câu kế sau khi đã xem kết quả; hết câu cuối thì kết thúc bài.
  advance(session: LessonSession, now: number = Date.now()): LessonSession {
    return session.phase === 'feedback'
      ? this.moveToNext(session, now)
      : session;
  }

  // Rule: câu có dạng bài chưa được hỗ trợ thì được bỏ qua (có đếm), không có kết quả đúng/sai.
  skip(session: LessonSession, now: number = Date.now()): LessonSession {
    if (session.phase !== 'answering') {
      return session;
    }
    return this.moveToNext(
      { ...session, skippedCount: session.skippedCount + 1 },
      now,
    );
  }

  private moveToNext(session: LessonSession, now: number): LessonSession {
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

  // Rule: điểm = đúng / đã trả lời, làm tròn nguyên; chưa trả lời câu nào thì 0. Bài trọn vẹn khi xong và không bỏ câu nào.
  summarize(session: LessonSession): LessonSummary {
    const answeredCount = session.correctCount + session.wrongCount;
    const elapsedMs =
      session.finishedAt === null ? 0 : session.finishedAt - session.startedAt;
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
      isComplete: session.phase === 'finished' && session.skippedCount === 0,
    };
  }

  // Rule: chỉ giải thích khi trả lời sai; câu đúng không cần giải thích.
  shouldShowExplanation(result: ExerciseResult): boolean {
    return !result.isCorrect && result.explanation !== undefined;
  }

  // Rule: thoát giữa chừng không làm bài đã hoàn thành mất trạng thái; luôn ghi vị trí mới.
  nextProgress(
    existing: LessonProgress | undefined,
    lessonId: string,
    cursor: number,
  ): LessonProgress {
    const status =
      existing?.status === 'completed' ? 'completed' : 'in-progress';
    return { lessonId, status, cursor };
  }

  // Rule: học xong bài thì không còn vị trí để nối lại; trạng thái hoàn thành được giữ nguyên.
  finishedProgress(
    existing: LessonProgress | undefined,
    lessonId: string,
  ): LessonProgress {
    const status =
      existing?.status === 'completed' ? 'completed' : 'in-progress';
    return { lessonId, status };
  }

  // ── PHẦN 3 — USE CASES ───────────────────────────────

  async openLesson(lessonId: string): Promise<OpenedLesson> {
    const lesson = await this.readLesson(lessonId);
    // Đọc tiến độ lỗi thì coi như không có vị trí, mở ở câu 1.
    const progress = await this.readCursor(lessonId).catch(() => undefined);
    const startIndex = this.resolveStartIndex(
      progress?.cursor,
      lesson.exercises.length,
    );
    return { lesson, session: this.startSession(lesson.exercises, startIndex) };
  }

  async saveCursor(lessonId: string, session: LessonSession): Promise<void> {
    const existing = await this.readCursor(lessonId);
    await this.writeCursor(
      session.phase === 'finished'
        ? this.finishedProgress(existing, lessonId)
        : this.nextProgress(existing, lessonId, session.currentIndex),
    );
  }

  async finishLesson(
    lessonId: string,
    session: LessonSession,
  ): Promise<LessonSummary & { isSaved: boolean }> {
    const summary = this.summarize(session);
    if (!summary.isComplete) {
      return { ...summary, isSaved: true };
    }
    try {
      await this.writeCursor({ lessonId, status: 'completed' });
    } catch {
      // Ghi tiến độ lỗi không được chặn tổng kết: báo cho UI qua isSaved: false.
      return { ...summary, isSaved: false };
    }
    return { ...summary, isSaved: true };
  }
}
