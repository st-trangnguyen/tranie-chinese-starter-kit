import type { Exercise, Lesson, LessonProgress } from '@csk/shared';

import { TEST_PASS_PERCENT } from '@core/constants/lesson.constants';
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

export type PlacementContext = { lessonIds: readonly string[] };

/** Cổng nhận các câu làm sai của bài kiểm tra (S3.5); bên ngoài quyết định lưu ở đâu. */
export interface WrongAnswerSink {
  record(lessonId: string, exerciseIds: readonly string[]): Promise<void>;
}

const NOOP_WRONG_ANSWER_SINK: WrongAnswerSink = {
  record: async () => undefined,
};

export interface OpenedLesson {
  lesson: Lesson;
  session: LessonSession;
}

export class LessonService {
  // Loại bài đã biết từ lần mở gần nhất, để saveCursor khỏi nạp lại bài.
  private readonly knownTypes = new Map<string, Lesson['type']>();

  constructor(
    private readonly source: LessonSource = new ContentService(),
    private readonly store: ProgressStore = progressStore,
    private readonly wrongAnswerSink: WrongAnswerSink = NOOP_WRONG_ANSWER_SINK,
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

  private writeCompletedBatch(lessonIds: readonly string[]): Promise<void> {
    return this.store.saveLessonProgressBatch(
      lessonIds.map((lessonId) => ({ lessonId, status: 'completed' as const })),
    );
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
      wrongExerciseIds: [],
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
      wrongExerciseIds: result.isCorrect
        ? session.wrongExerciseIds
        : [
            ...session.wrongExerciseIds,
            session.exerciseIds[session.currentIndex],
          ],
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

  // Rule: điểm = đúng / đã trả lời, làm tròn nguyên; chưa trả lời câu nào thì 0.
  // Bài thường trọn vẹn khi xong, không bỏ câu nào (isPassed = null); bài kiểm tra còn phải đạt ngưỡng.
  summarize(
    session: LessonSession,
    lessonType: 'lesson' | 'test',
  ): LessonSummary {
    const answeredCount = session.correctCount + session.wrongCount;
    const elapsedMs =
      session.finishedAt === null ? 0 : session.finishedAt - session.startedAt;
    const isPassed =
      lessonType === 'test'
        ? this.isTestPassed(session.correctCount, answeredCount)
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

  // Rule: bài kiểm tra đạt khi đúng ít nhất TEST_PASS_PERCENT% số câu; so sánh số nguyên, không float.
  isTestPassed(correctCount: number, totalCount: number): boolean {
    return (
      totalCount > 0 && correctCount * 100 >= TEST_PASS_PERCENT * totalCount
    );
  }

  // ── PHẦN 3 — USE CASES ───────────────────────────────

  async openLesson(lessonId: string): Promise<OpenedLesson> {
    const lesson = await this.readLesson(lessonId);
    // Đọc tiến độ lỗi thì coi như không có vị trí, mở ở câu 1.
    const progress = await this.readCursor(lessonId).catch(() => undefined);
    this.knownTypes.set(lessonId, lesson.type);
    // Bài kiểm tra luôn làm lại từ câu 1, bỏ qua vị trí đã lưu (S3.5).
    const startIndex =
      lesson.type === 'test'
        ? 0
        : this.resolveStartIndex(progress?.cursor, lesson.exercises.length);
    return { lesson, session: this.startSession(lesson.exercises, startIndex) };
  }

  async saveCursor(lessonId: string, session: LessonSession): Promise<void> {
    // Bài kiểm tra không lưu vị trí; không biết loại bài thì vẫn lưu (openLesson bỏ qua vị trí của test).
    if ((await this.resolveLessonType(lessonId)) === 'test') {
      return;
    }
    const existing = await this.readCursor(lessonId);
    await this.writeCursor(
      session.phase === 'finished'
        ? this.finishedProgress(existing, lessonId)
        : this.nextProgress(existing, lessonId, session.currentIndex),
    );
  }

  private async resolveLessonType(
    lessonId: string,
  ): Promise<Lesson['type'] | undefined> {
    const known = this.knownTypes.get(lessonId);
    if (known !== undefined) {
      return known;
    }
    return this.readLesson(lessonId).then(
      (lesson) => lesson.type,
      () => undefined,
    );
  }

  async finishLesson(
    lessonId: string,
    session: LessonSession,
    placement?: PlacementContext,
  ): Promise<LessonSummary & { isSaved: boolean }> {
    const lessonType = await this.resolveLessonType(lessonId);
    if (lessonType === undefined) {
      // Không biết loại bài thì không xét đạt/hoàn thành, không ghi gì; báo UI qua isSaved: false.
      return { ...this.summarize(session, 'lesson'), isSaved: false };
    }
    const summary = this.summarize(session, lessonType);
    let isSaved = true;
    // Bài kiểm tra: đạt hay không đều chuyển câu sai sang cổng ôn tập; lỗi cổng chỉ báo isSaved: false.
    if (lessonType === 'test' && session.wrongExerciseIds.length > 0) {
      isSaved = await this.wrongAnswerSink
        .record(lessonId, session.wrongExerciseIds)
        .then(
          () => true,
          () => false,
        );
    }
    if (!summary.isComplete) {
      return { ...summary, isSaved };
    }
    try {
      await (lessonType === 'test' && placement?.lessonIds.includes(lessonId)
        ? this.writeCompletedBatch(placement.lessonIds)
        : this.writeCursor({ lessonId, status: 'completed' }));
    } catch {
      // Ghi tiến độ lỗi không được chặn tổng kết: báo cho UI qua isSaved: false.
      return { ...summary, isSaved: false };
    }
    return { ...summary, isSaved };
  }
}
