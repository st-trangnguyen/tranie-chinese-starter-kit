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
import { findConfirmedPlacementTestLessonId } from '@shared/utils/learning-path.utils';
import {
  applyResult,
  finishedProgress,
  isTestPassed,
  moveToNext,
  nextProgress,
  resolveStartIndex,
  summarizeSession,
} from '@shared/utils/lesson-session.utils';
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
    return resolveStartIndex(savedCursor, exerciseCount);
  }

  // Rule: bài bắt đầu ở vị trí chỉ định (mặc định câu đầu) và chờ người học trả lời.
  startSession(
    exercises: readonly Exercise[],
    startIndex = 0,
    now: number = Date.now(),
  ): LessonSession {
    return {
      exerciseIds: exercises.map((exercise) => exercise.id),
      currentIndex: resolveStartIndex(startIndex, exercises.length),
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
    return applyResult(session, result);
  }

  // Rule: sang câu kế sau khi đã xem kết quả; hết câu cuối thì kết thúc bài.
  advance(session: LessonSession, now: number = Date.now()): LessonSession {
    return session.phase === 'feedback' ? moveToNext(session, now) : session;
  }

  // Rule: câu có dạng bài chưa được hỗ trợ thì được bỏ qua (có đếm), không có kết quả đúng/sai.
  skip(session: LessonSession, now: number = Date.now()): LessonSession {
    if (session.phase !== 'answering') {
      return session;
    }
    return moveToNext(
      { ...session, skippedCount: session.skippedCount + 1 },
      now,
    );
  }

  // Rule: điểm và trạng thái hoàn thành (chi tiết ở lesson-session.utils).
  summarize(
    session: LessonSession,
    lessonType: 'lesson' | 'test',
  ): LessonSummary {
    return summarizeSession(session, lessonType);
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
    return nextProgress(existing, lessonId, cursor);
  }

  // Rule: học xong bài thì không còn vị trí để nối lại; trạng thái hoàn thành được giữ nguyên.
  finishedProgress(
    existing: LessonProgress | undefined,
    lessonId: string,
  ): LessonProgress {
    return finishedProgress(existing, lessonId);
  }

  // Rule: bài kiểm tra đạt khi đúng ít nhất TEST_PASS_PERCENT% số câu.
  isTestPassed(correctCount: number, totalCount: number): boolean {
    return isTestPassed(correctCount, totalCount);
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
        ? finishedProgress(existing, lessonId)
        : nextProgress(existing, lessonId, session.currentIndex),
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

  // Loại các bài của chủ đề; bài nạp lỗi bị bỏ (không làm hỏng cả lô).
  private async resolveLessonTypes(
    lessonIds: readonly string[],
  ): Promise<Map<string, Lesson['type']>> {
    const entries = await Promise.all(
      lessonIds.map(
        async (id) => [id, await this.resolveLessonType(id)] as const,
      ),
    );
    return new Map(
      entries.flatMap(([id, type]) => (type === undefined ? [] : [[id, type]])),
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
      // Rule: chỉ bài test CUỐI của chủ đề mới hoàn thành cả chủ đề; test khác ghi như bài thường;
      // có bài thiếu loại (nạp lỗi) thì không chắc bài cuối nên ghi như bài thường.
      const isUnitFinalTest =
        lessonType === 'test' &&
        placement !== undefined &&
        findConfirmedPlacementTestLessonId(
          placement.lessonIds,
          await this.resolveLessonTypes(placement.lessonIds),
        ) === lessonId;
      await (isUnitFinalTest && placement !== undefined
        ? this.writeCompletedBatch(placement.lessonIds)
        : this.writeCursor({ lessonId, status: 'completed' }));
    } catch {
      // Ghi tiến độ lỗi không được chặn tổng kết: báo cho UI qua isSaved: false.
      return { ...summary, isSaved: false };
    }
    return { ...summary, isSaved };
  }
}
