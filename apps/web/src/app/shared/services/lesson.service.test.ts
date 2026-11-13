import type { Exercise, Stage } from '@csk/shared';

import { createDatabase } from '@core/helpers/db.helper';
import {
  DexieProgressStore,
  type ProgressStore,
} from '@core/services/progress-store.service';
import {
  isRatingCorrect,
  type SpeakRating,
} from '@shared/utils/speak-rating.utils';
import { ProgressService } from './progress.service';
import {
  LessonService,
  type LessonSource,
  type WrongAnswerSink,
} from './lesson.service';

const EXERCISES: Exercise[] = [
  { id: 'e1', kind: 'tone-choice', wordId: '八' },
  { id: 'e2', kind: 'tone-choice', wordId: '白' },
  { id: 'e3', kind: 'tone-choice', wordId: '百' },
];

const makeContentService = (): LessonSource => ({
  getLesson: vi.fn(async (id: string) => ({
    id,
    type: 'lesson' as const,
    title: 'Bốn thanh điệu',
    exercises: EXERCISES,
  })),
});

const service = new LessonService(makeContentService());

describe('LessonService — quy tắc phiên làm bài', () => {
  it('S3.2-AC1: should start at the first exercise, waiting for an answer', () => {
    const session = service.startSession(EXERCISES);

    expect(session).toMatchObject({
      exerciseIds: ['e1', 'e2', 'e3'],
      currentIndex: 0,
      phase: 'answering',
      lastResult: null,
    });
  });

  it('S3.2-AC1: should move to the next exercise after feedback', () => {
    const graded = service.submitResult(service.startSession(EXERCISES), {
      isCorrect: true,
    });

    const next = service.advance(graded);

    expect(next).toMatchObject({
      currentIndex: 1,
      phase: 'answering',
      lastResult: null,
    });
  });

  it('S3.2-X1: should count skipped exercises, not answered ones', () => {
    let session = service.startSession(EXERCISES);
    session = service.skip(session);
    session = service.advance(
      service.submitResult(session, { isCorrect: true }),
    );
    session = service.skip(session);

    expect(session.phase).toBe('finished');
    expect(session.skippedCount).toBe(2);
  });

  it('S3.2-AC1: should finish after the last exercise', () => {
    let session = service.startSession(EXERCISES);
    for (let step = 0; step < EXERCISES.length; step += 1) {
      session = service.advance(
        service.submitResult(session, { isCorrect: true }),
      );
    }

    expect(session.phase).toBe('finished');
  });

  it('S3.2-AC2: should show no result before the learner answers', () => {
    const session = service.startSession(EXERCISES);

    expect(session.phase).toBe('answering');
    expect(session.lastResult).toBeNull();
  });

  it.each([
    ['correct', true],
    ['incorrect', false],
  ])('S3.2-AC2: should grade a %s answer immediately', (_label, isCorrect) => {
    const session = service.submitResult(service.startSession(EXERCISES), {
      isCorrect,
    });

    expect(session).toMatchObject({
      currentIndex: 0,
      phase: 'feedback',
      lastResult: { isCorrect },
    });
  });

  it('S3.2-AC2: should ignore a second answer to the same exercise', () => {
    const graded = service.submitResult(service.startSession(EXERCISES), {
      isCorrect: false,
    });

    const again = service.submitResult(graded, { isCorrect: true });

    expect(again).toEqual(graded);
  });

  it('S3.2-AC3: should not advance before the learner has seen the feedback', () => {
    const session = service.startSession(EXERCISES);

    expect(service.advance(session)).toEqual(session);
  });

  it('S3.2-AC3: should show the explanation for an incorrect answer that has one', () => {
    expect(
      service.shouldShowExplanation({ isCorrect: false, explanation: 'bā' }),
    ).toBe(true);
  });

  it('S3.2-AC3: should show no explanation for a correct answer', () => {
    expect(
      service.shouldShowExplanation({ isCorrect: true, explanation: 'bā' }),
    ).toBe(false);
  });

  it('S3.2-AC1: should open a lesson at its first exercise', async () => {
    const { lesson, session } = await service.openLesson('intro-01');

    expect(lesson.id).toBe('intro-01');
    expect(session).toMatchObject({ currentIndex: 0, phase: 'answering' });
  });

  it('S3.2-AC1: should fail with a clear message when the lesson cannot be opened', async () => {
    const failing: LessonSource = {
      getLesson: vi.fn(async () => {
        throw new Error('Không mở được bài học.');
      }),
    };

    await expect(new LessonService(failing).openLesson('x')).rejects.toThrow(
      'Không mở được bài học.',
    );
  });

  it('S3.2-X1: should skip an exercise without showing a result', () => {
    const next = service.skip(service.startSession(EXERCISES));

    expect(next).toMatchObject({
      currentIndex: 1,
      phase: 'answering',
      lastResult: null,
    });
  });
});

describe('LessonService — vị trí bắt đầu khi mở lại bài (S3.3)', () => {
  it('S3.3-AC2: should resume at the saved exercise when it is within the lesson', () => {
    expect(service.resolveStartIndex(2, 3)).toBe(2);
    expect(service.resolveStartIndex(0, 3)).toBe(0);
  });

  it('S3.3-AC2: should open a session at the saved position, waiting for an answer', () => {
    const session = service.startSession(EXERCISES, 2);

    expect(session).toMatchObject({
      exerciseIds: ['e1', 'e2', 'e3'],
      currentIndex: 2,
      phase: 'answering',
      lastResult: null,
    });
  });

  it('S3.3-AC2: should start at the first exercise when the lesson was never studied', () => {
    expect(service.resolveStartIndex(undefined, 3)).toBe(0);
    expect(service.startSession(EXERCISES).currentIndex).toBe(0);
  });

  it.each([
    ['not a number', Number.NaN],
    ['negative', -1],
    ['fractional', 1.5],
    ['infinite', Number.POSITIVE_INFINITY],
  ])(
    'S3.3-AC2: should start at the first exercise when the saved position is unusable (%s)',
    (_label, saved) => {
      expect(service.resolveStartIndex(saved, 3)).toBe(0);
    },
  );

  it('S3.3-AC2: should start at the first exercise when the lesson lost exercises', () => {
    expect(service.resolveStartIndex(5, 3)).toBe(0);
    expect(service.resolveStartIndex(3, 3)).toBe(0);
  });

  it('S3.3-AC2: should start at the first exercise when the lesson has no exercises', () => {
    expect(service.resolveStartIndex(0, 0)).toBe(0);
  });

  it('S3.3-AC2: should keep a start position outside the lesson from breaking the session', () => {
    expect(service.startSession(EXERCISES, 6).currentIndex).toBe(0);
  });
});

describe('LessonService — tiến độ khi thoát giữa chừng (S3.3)', () => {
  it('S3.3-X2: should keep a completed lesson completed when the learner leaves mid-way', () => {
    const next = service.nextProgress(
      { lessonId: 'intro-01', status: 'completed' },
      'intro-01',
      1,
    );

    expect(next).toEqual({
      lessonId: 'intro-01',
      status: 'completed',
      cursor: 1,
    });
  });

  it.each([
    ['never studied', undefined],
    [
      'in progress',
      { lessonId: 'intro-01', status: 'in-progress' as const, cursor: 0 },
    ],
  ])(
    'S3.3-X2: should mark a lesson in-progress when it is %s',
    (_label, existing) => {
      const next = service.nextProgress(existing, 'intro-01', 2);

      expect(next).toEqual({
        lessonId: 'intro-01',
        status: 'in-progress',
        cursor: 2,
      });
    },
  );

  it('S3.3-X2: should always write the new cursor over the old one', () => {
    const next = service.nextProgress(
      { lessonId: 'intro-01', status: 'in-progress', cursor: 1 },
      'intro-01',
      0,
    );

    expect(next.cursor).toBe(0);
  });

  it('S3.3-X2: should not mutate the existing progress', () => {
    const existing = {
      lessonId: 'intro-01',
      status: 'completed' as const,
      cursor: 0,
    };

    service.nextProgress(existing, 'intro-01', 2);

    expect(existing).toEqual({
      lessonId: 'intro-01',
      status: 'completed',
      cursor: 0,
    });
  });
});

const makeStoredService = () => {
  const store = new DexieProgressStore(
    createDatabase(`test-${crypto.randomUUID()}`),
  );
  return { store, stored: new LessonService(makeContentService(), store) };
};

describe('LessonService — lưu và mở lại vị trí (S3.3)', () => {
  it('S3.3-AC1: should remember the second exercise after the learner moves on and leaves', async () => {
    const { store, stored } = makeStoredService();
    const answered = stored.submitResult(stored.startSession(EXERCISES), {
      isCorrect: true,
    });

    await stored.saveCursor('intro-01', stored.advance(answered));

    await expect(store.getLessonProgress('intro-01')).resolves.toEqual({
      lessonId: 'intro-01',
      status: 'in-progress',
      cursor: 1,
    });
  });

  it('S3.3-AC1: should remember the second exercise after the learner skips the first', async () => {
    const { store, stored } = makeStoredService();

    await stored.saveCursor(
      'intro-01',
      stored.skip(stored.startSession(EXERCISES)),
    );

    await expect(store.getLessonProgress('intro-01')).resolves.toMatchObject({
      status: 'in-progress',
      cursor: 1,
    });
  });

  it('S3.3-AC1: should keep a separate position for each lesson', async () => {
    const { store, stored } = makeStoredService();

    await stored.saveCursor('lesson-a', stored.startSession(EXERCISES, 2));
    await stored.saveCursor('lesson-b', stored.startSession(EXERCISES, 1));

    await expect(store.getLessonProgress('lesson-a')).resolves.toMatchObject({
      cursor: 2,
    });
    await expect(store.getLessonProgress('lesson-b')).resolves.toMatchObject({
      cursor: 1,
    });
  });

  it('S3.3-AC2: should reopen a lesson at the saved exercise, waiting for an answer', async () => {
    const { stored } = makeStoredService();
    await stored.saveCursor('intro-01', stored.startSession(EXERCISES, 2));

    const { session } = await stored.openLesson('intro-01');

    expect(session).toMatchObject({
      currentIndex: 2,
      phase: 'answering',
      lastResult: null,
    });
  });

  it('S3.3-X1: should reopen at the first exercise after the last one was finished', async () => {
    const { stored } = makeStoredService();
    let session = stored.startSession(EXERCISES, 2);
    session = stored.advance(stored.submitResult(session, { isCorrect: true }));
    expect(session.phase).toBe('finished');

    await stored.saveCursor('intro-01', session);
    const { session: reopened } = await stored.openLesson('intro-01');

    expect(reopened).toMatchObject({ currentIndex: 0, phase: 'answering' });
  });

  it('S3.3-X1: should keep a completed lesson completed when its last exercise is finished again', async () => {
    const { store, stored } = makeStoredService();
    await store.saveLessonProgress({
      lessonId: 'intro-01',
      status: 'completed',
    });
    const finished = stored.advance(
      stored.submitResult(stored.startSession(EXERCISES, 2), {
        isCorrect: true,
      }),
    );

    await stored.saveCursor('intro-01', finished);

    const progress = await store.getLessonProgress('intro-01');
    expect(progress?.status).toBe('completed');
    expect(progress?.cursor).toBeUndefined();
  });

  it('S3.3-X2: should still show the lesson as completed on the map after the learner leaves a replay mid-way', async () => {
    const { store, stored } = makeStoredService();
    await store.saveLessonProgress({
      lessonId: 'intro-01',
      status: 'completed',
    });

    await stored.saveCursor('intro-01', stored.startSession(EXERCISES, 1));

    const completed = await new ProgressService(store).getCompletedLessonIds();
    expect(completed.has('intro-01')).toBe(true);
  });

  it('S3.3-AC2: should open at the first exercise, without failing, when the saved position cannot be read', async () => {
    const unreadable: ProgressStore = {
      ...new DexieProgressStore(createDatabase(`test-${crypto.randomUUID()}`)),
      getSettings: vi.fn(),
      saveSettings: vi.fn(),
      getAllLessonProgress: vi.fn(),
      saveLessonProgress: vi.fn(),
      saveLessonProgressBatch: vi.fn(),
      getLessonProgress: vi.fn(async () => {
        throw new Error('IndexedDB unavailable');
      }),
    };
    const reading = new LessonService(makeContentService(), unreadable);

    const { session } = await reading.openLesson('intro-01');

    expect(session).toMatchObject({ currentIndex: 0, phase: 'answering' });
  });
});

describe('LessonService — tổng kết bài (S3.4)', () => {
  const START = 1_000_000;

  const answerAll = (
    exercises: readonly Exercise[],
    outcomes: readonly boolean[],
  ): ReturnType<LessonService['startSession']> => {
    let session = service.startSession(exercises, 0, START);
    outcomes.forEach((isCorrect) => {
      session = service.advance(
        service.submitResult(session, { isCorrect }),
        START,
      );
    });
    return session;
  };

  const makeExercises = (count: number): Exercise[] =>
    Array.from({ length: count }, (_value, index) => ({
      id: `x${index}`,
      kind: 'tone-choice' as const,
      wordId: '八',
    }));

  it('S3.4-AC1: should count correct and wrong answers, 4 right and 1 wrong of 5', () => {
    const session = answerAll(makeExercises(5), [
      true,
      true,
      false,
      true,
      true,
    ]);

    expect(session.phase).toBe('finished');
    expect(service.summarize(session, 'lesson')).toMatchObject({
      scorePercent: 80,
      correctCount: 4,
      answeredCount: 5,
      wrongCount: 1,
    });
  });

  it('S3.4-AC1: should not count a double submit twice', () => {
    const start = service.startSession(makeExercises(2), 0, START);
    const once = service.submitResult(start, { isCorrect: false });
    const twice = service.submitResult(once, { isCorrect: false });

    expect(twice.wrongCount).toBe(1);
    expect(twice.correctCount).toBe(0);
  });

  it('S3.4-AC1: should score 100% with 0 wrong when all answers are correct', () => {
    const session = answerAll(makeExercises(5), [true, true, true, true, true]);

    expect(service.summarize(session, 'lesson')).toMatchObject({
      scorePercent: 100,
      wrongCount: 0,
    });
  });

  it('S3.4-AC1: should score 0% with 5 wrong when all answers are wrong', () => {
    const session = answerAll(makeExercises(5), [
      false,
      false,
      false,
      false,
      false,
    ]);

    expect(service.summarize(session, 'lesson')).toMatchObject({
      scorePercent: 0,
      wrongCount: 5,
    });
  });

  it('S3.4-AC1: should round the score to an integer, 2 of 3 is 67%', () => {
    const session = answerAll(makeExercises(3), [true, false, true]);

    expect(service.summarize(session, 'lesson').scorePercent).toBe(67);
  });

  it('S3.4-AC1: should score only answered exercises and mark the lesson incomplete when one is skipped', () => {
    let session = service.startSession(makeExercises(3), 0, START);
    session = service.skip(session, START);
    session = service.advance(
      service.submitResult(session, { isCorrect: true }),
      START,
    );
    session = service.advance(
      service.submitResult(session, { isCorrect: true }),
      START,
    );

    expect(session.phase).toBe('finished');
    expect(service.summarize(session, 'lesson')).toMatchObject({
      scorePercent: 100,
      answeredCount: 2,
      wrongCount: 0,
      skippedCount: 1,
      isComplete: false,
    });
  });

  it('S3.4-AC1: should be complete when finished with nothing skipped', () => {
    const session = answerAll(makeExercises(2), [true, false]);

    expect(service.summarize(session, 'lesson').isComplete).toBe(true);
  });

  it('S3.4-AC1: should not be complete before the last exercise is done', () => {
    const session = service.startSession(makeExercises(3), 0, START);

    expect(service.summarize(session, 'lesson').isComplete).toBe(false);
  });

  it('S3.4-AC1: should start counters at 0 and time from the opening moment when resuming mid-lesson', () => {
    let session = service.startSession(makeExercises(3), 2, START);

    expect(session).toMatchObject({
      currentIndex: 2,
      correctCount: 0,
      wrongCount: 0,
      startedAt: START,
    });

    session = service.advance(
      service.submitResult(session, { isCorrect: true }),
      START + 9_000,
    );

    expect(service.summarize(session, 'lesson')).toMatchObject({
      scorePercent: 100,
      answeredCount: 1,
      wrongCount: 0,
      elapsedSeconds: 9,
    });
  });

  it('S3.4-AC1: should report 125 seconds elapsed from open to the last exercise', () => {
    let session = service.startSession(makeExercises(1), 0, START);
    session = service.advance(
      service.submitResult(session, { isCorrect: true }),
      START + 125_000,
    );

    expect(service.summarize(session, 'lesson').elapsedSeconds).toBe(125);
  });

  it('S3.4-AC1: should never report negative elapsed time when the clock goes backwards', () => {
    let session = service.startSession(makeExercises(1), 0, START);
    session = service.advance(
      service.submitResult(session, { isCorrect: true }),
      START - 5_000,
    );

    expect(service.summarize(session, 'lesson').elapsedSeconds).toBe(0);
  });
});

describe('LessonService — mở khóa bài kế khi xong bài (S3.4)', () => {
  const NOW = 1_000_000;

  const STAGES: Stage[] = [
    {
      id: 'intro',
      title: 'intro',
      units: [
        { id: 'intro-a', title: 'a', lessonIds: ['l1', 'l2'] },
        { id: 'intro-b', title: 'b', lessonIds: ['l3'] },
      ],
    },
  ];

  const finishedSession = (
    stored: LessonService,
    outcomes: readonly boolean[],
  ) => {
    const exercises: Exercise[] = outcomes.map((_outcome, index) => ({
      id: `x${index}`,
      kind: 'tone-choice' as const,
      wordId: '八',
    }));
    let session = stored.startSession(exercises, 0, NOW);
    outcomes.forEach((isCorrect) => {
      session = stored.advance(
        stored.submitResult(session, { isCorrect }),
        NOW,
      );
    });
    return session;
  };

  const mapStatuses = async (store: DexieProgressStore) => {
    const progress = new ProgressService(store);
    const completed = await progress.getCompletedLessonIds();
    return Object.fromEntries(progress.deriveLessonStatuses(STAGES, completed));
  };

  it('S3.4-AC2: should mark the first lesson completed and open the second after finishing it', async () => {
    const { store, stored } = makeStoredService();

    await stored.finishLesson(
      'l1',
      finishedSession(stored, [true, true, false, true, true]),
    );

    await expect(mapStatuses(store)).resolves.toEqual({
      l1: 'completed',
      l2: 'open',
      l3: 'locked',
    });
  });

  it('S3.4-AC2: should still complete the lesson and open the next one when all 5 answers are wrong', async () => {
    const { store, stored } = makeStoredService();

    await stored.finishLesson(
      'l1',
      finishedSession(stored, [false, false, false, false, false]),
    );

    await expect(mapStatuses(store)).resolves.toMatchObject({
      l1: 'completed',
      l2: 'open',
    });
  });

  it('S3.4-AC2: should open the first lesson of the next group after finishing the last lesson of a group', async () => {
    const { store, stored } = makeStoredService();
    await store.saveLessonProgress({ lessonId: 'l1', status: 'completed' });

    await stored.finishLesson('l2', finishedSession(stored, [true, false]));

    await expect(mapStatuses(store)).resolves.toEqual({
      l1: 'completed',
      l2: 'completed',
      l3: 'open',
    });
  });

  const skippedSession = (stored: LessonService) => {
    const exercises: Exercise[] = [0, 1, 2].map((index) => ({
      id: `x${index}`,
      kind: 'tone-choice' as const,
      wordId: '八',
    }));
    let session = stored.skip(stored.startSession(exercises, 0, NOW), NOW);
    session = stored.advance(
      stored.submitResult(session, { isCorrect: true }),
      NOW,
    );
    return stored.advance(
      stored.submitResult(session, { isCorrect: true }),
      NOW,
    );
  };

  it('S3.4-AC2: should not complete the lesson nor open the next one when an exercise was skipped', async () => {
    const { store, stored } = makeStoredService();
    const session = skippedSession(stored);
    expect(session.phase).toBe('finished');

    await stored.finishLesson('l1', session);

    const statuses = await mapStatuses(store);
    expect(statuses.l1).not.toBe('completed');
    expect(statuses.l2).toBe('locked');
  });

  it('S3.4-AC2: should not complete the lesson nor open the next one when the learner leaves mid-way', async () => {
    const { store, stored } = makeStoredService();
    const midway = stored.skip(
      stored.startSession(
        [
          { id: 'x0', kind: 'tone-choice', wordId: '八' },
          { id: 'x1', kind: 'tone-choice', wordId: '白' },
        ],
        0,
        NOW,
      ),
      NOW,
    );
    expect(midway.phase).not.toBe('finished');

    await stored.finishLesson('l1', midway);
    await stored.saveCursor('l1', midway);

    const statuses = await mapStatuses(store);
    expect(statuses.l1).not.toBe('completed');
    expect(statuses.l2).toBe('locked');
  });

  it('S3.4-AC2: should keep a completed lesson and what it opened when a replay finishes with more wrong answers', async () => {
    const { store, stored } = makeStoredService();
    await stored.finishLesson('l1', finishedSession(stored, [true, true]));

    await stored.finishLesson('l1', finishedSession(stored, [false, false]));

    await expect(mapStatuses(store)).resolves.toMatchObject({
      l1: 'completed',
      l2: 'open',
    });
  });

  it('S3.4-AC2: should keep a completed lesson completed when a replay finishes with a skipped exercise', async () => {
    const { store, stored } = makeStoredService();
    await stored.finishLesson('l1', finishedSession(stored, [true, true]));

    await stored.finishLesson('l1', skippedSession(stored));

    await expect(mapStatuses(store)).resolves.toMatchObject({
      l1: 'completed',
      l2: 'open',
    });
  });

  it('S3.4-AC2: should open the first exercise again after the lesson was finished and completed', async () => {
    const { store, stored } = makeStoredService();
    await stored.saveCursor('intro-01', stored.startSession(EXERCISES, 2));
    const finished = finishedSession(stored, [true, true, true]);

    await stored.finishLesson('intro-01', finished);
    await stored.saveCursor('intro-01', finished);
    const { session } = await stored.openLesson('intro-01');

    expect(session).toMatchObject({ currentIndex: 0, phase: 'answering' });
    await expect(store.getLessonProgress('intro-01')).resolves.toMatchObject({
      status: 'completed',
    });
  });
});

describe('LessonService — ghi tiến độ lỗi khi xong bài (S3.4)', () => {
  const NOW = 1_000_000;

  it('S3.4-AC1: should still return the summary with isSaved false, without throwing, when saving progress fails', async () => {
    const unwritable: ProgressStore = {
      ...new DexieProgressStore(createDatabase(`test-${crypto.randomUUID()}`)),
      getSettings: vi.fn(),
      saveSettings: vi.fn(),
      getAllLessonProgress: vi.fn(async () => []),
      getLessonProgress: vi.fn(async () => undefined),
      saveLessonProgressBatch: vi.fn(),
      saveLessonProgress: vi.fn(async () => {
        throw new Error('IndexedDB write failed');
      }),
    };
    const failing = new LessonService(makeContentService(), unwritable);
    let session = failing.startSession(EXERCISES, 0, NOW);
    [true, true, false].forEach((isCorrect) => {
      session = failing.advance(
        failing.submitResult(session, { isCorrect }),
        NOW,
      );
    });

    const result = await failing.finishLesson('intro-01', session);

    expect(result).toMatchObject({
      correctCount: 2,
      wrongCount: 1,
      isComplete: true,
      isSaved: false,
    });
  });
});

describe('LessonService — ngưỡng đạt của bài kiểm tra (S3.5)', () => {
  it('S3.5-AC1: should pass a test at exactly 80%, 4 of 5 correct', () => {
    expect(service.isTestPassed(4, 5)).toBe(true);
  });

  it('S3.5-AC1: should pass a test above 80%, 5 of 5 correct', () => {
    expect(service.isTestPassed(5, 5)).toBe(true);
  });

  it('S3.5-AC1: should not pass a test below 80%, 23 of 30 correct', () => {
    expect(service.isTestPassed(23, 30)).toBe(false);
  });

  it('S3.5-AC1: should not pass a test just under 80%, 39 of 49 correct', () => {
    expect(service.isTestPassed(39, 49)).toBe(false);
  });
});

describe('LessonService — tổng kết theo loại bài (S3.5)', () => {
  const START = 1_000_000;

  const makeExercises = (count: number): Exercise[] =>
    Array.from({ length: count }, (_value, index) => ({
      id: `x${index}`,
      kind: 'tone-choice' as const,
      wordId: '八',
    }));

  // outcome: true/false = trả lời đúng/sai, 'skip' = bỏ qua câu.
  const playThrough = (
    outcomes: readonly (boolean | 'skip')[],
  ): ReturnType<LessonService['startSession']> => {
    let session = service.startSession(
      makeExercises(outcomes.length),
      0,
      START,
    );
    outcomes.forEach((outcome) => {
      session =
        outcome === 'skip'
          ? service.skip(session, START)
          : service.advance(
              service.submitResult(session, { isCorrect: outcome }),
              START,
            );
    });
    return session;
  };

  it('S3.5-AC1: should not pass a test with a skipped question even when all answered are correct', () => {
    const session = playThrough([true, true, true, true, 'skip']);

    expect(session.phase).toBe('finished');
    expect(service.summarize(session, 'test')).toMatchObject({
      skippedCount: 1,
      isPassed: true,
      isComplete: false,
    });
  });

  it('S3.5-AC1: should complete a test finished at 80% with nothing skipped', () => {
    const session = playThrough([true, true, true, true, false]);

    expect(service.summarize(session, 'test')).toMatchObject({
      isPassed: true,
      isComplete: true,
    });
  });

  it('S3.5-AC1: should not complete a test finished below 80%', () => {
    const session = playThrough([true, true, false, false, false]);

    expect(service.summarize(session, 'test')).toMatchObject({
      isPassed: false,
      isComplete: false,
    });
  });

  it('S3.5-AC1: should complete a regular lesson with all answers wrong, without a minimum score', () => {
    const session = playThrough([false, false, false, false, false]);

    expect(service.summarize(session, 'lesson')).toMatchObject({
      scorePercent: 0,
      isPassed: null,
      isComplete: true,
    });
  });
});

describe('LessonService — danh sách câu sai của phiên (S3.5)', () => {
  const START = 1_000_000;

  const makeExercises = (count: number): Exercise[] =>
    Array.from({ length: count }, (_value, index) => ({
      id: `x${index}`,
      kind: 'tone-choice' as const,
      wordId: '八',
    }));

  it('S3.5-AC2: should start a new session with no wrong exercises', () => {
    const session = service.startSession(makeExercises(3), 0, START);

    expect(session.wrongExerciseIds).toEqual([]);
  });

  it('S3.5-AC2: should record the id of the current exercise when answered wrong', () => {
    const session = service.submitResult(
      service.startSession(makeExercises(3), 0, START),
      { isCorrect: false },
    );

    expect(session.wrongExerciseIds).toEqual(['x0']);
  });

  it('S3.5-AC2: should not record an exercise answered correctly', () => {
    const session = service.submitResult(
      service.startSession(makeExercises(3), 0, START),
      { isCorrect: true },
    );

    expect(session.wrongExerciseIds).toEqual([]);
  });

  it('S3.5-AC2: should not record the same wrong exercise twice on a double submit', () => {
    const start = service.startSession(makeExercises(3), 0, START);
    const once = service.submitResult(start, { isCorrect: false });
    const twice = service.submitResult(once, { isCorrect: false });

    expect(twice.wrongExerciseIds).toEqual(['x0']);
  });

  it('S3.5-AC2: should collect wrong ids in order across the session, ignoring correct and skipped ones', () => {
    let session = service.startSession(makeExercises(4), 0, START);
    session = service.advance(
      service.submitResult(session, { isCorrect: false }),
      START,
    );
    session = service.advance(
      service.submitResult(session, { isCorrect: true }),
      START,
    );
    session = service.skip(session, START);
    session = service.submitResult(session, { isCorrect: false });

    expect(session.wrongExerciseIds).toEqual(['x0', 'x3']);
  });

  it('S3.5-AC2: should not carry wrong ids from a previous attempt into a retry session', () => {
    const exercises = makeExercises(2);
    const first = service.submitResult(
      service.startSession(exercises, 0, START),
      { isCorrect: false },
    );
    const retry = service.startSession(exercises, 0, START);

    expect(first.wrongExerciseIds).toEqual(['x0']);
    expect(retry.wrongExerciseIds).toEqual([]);
    expect(
      service.submitResult(retry, { isCorrect: true }).wrongExerciseIds,
    ).toEqual([]);
  });
});

describe('LessonService — kết thúc bài kiểm tra cuối chủ đề (S3.5)', () => {
  const NOW = 1_000_000;

  const STAGES: Stage[] = [
    {
      id: 'intro',
      title: 'intro',
      units: [
        { id: 'intro-a', title: 'a', lessonIds: ['a1', 'a-test'] },
        { id: 'intro-b', title: 'b', lessonIds: ['b1'] },
      ],
    },
  ];

  const makeTestService = () => {
    const store = new DexieProgressStore(
      createDatabase(`test-${crypto.randomUUID()}`),
    );
    const source: LessonSource = {
      getLesson: vi.fn(async (id: string) => ({
        id,
        type: id === 'a-test' ? ('test' as const) : ('lesson' as const),
        title: id,
        exercises: EXERCISES,
      })),
    };
    return { store, stored: new LessonService(source, store) };
  };

  // outcome: true/false = trả lời đúng/sai, 'skip' = bỏ qua câu.
  const finishedSession = (
    stored: LessonService,
    outcomes: readonly (boolean | 'skip')[],
  ) => {
    const exercises: Exercise[] = outcomes.map((_outcome, index) => ({
      id: `x${index}`,
      kind: 'tone-choice' as const,
      wordId: '八',
    }));
    let session = stored.startSession(exercises, 0, NOW);
    outcomes.forEach((outcome) => {
      session =
        outcome === 'skip'
          ? stored.skip(session, NOW)
          : stored.advance(
              stored.submitResult(session, { isCorrect: outcome }),
              NOW,
            );
    });
    return session;
  };

  const mapStatuses = async (store: DexieProgressStore) => {
    const progress = new ProgressService(store);
    const completed = await progress.getCompletedLessonIds();
    return Object.fromEntries(progress.deriveLessonStatuses(STAGES, completed));
  };

  const passFirstLesson = (store: DexieProgressStore) =>
    store.saveLessonProgress({ lessonId: 'a1', status: 'completed' });

  it('S3.5-AC1: should complete the test and open the next topic when finished at exactly 80%', async () => {
    const { store, stored } = makeTestService();
    await passFirstLesson(store);

    await stored.finishLesson(
      'a-test',
      finishedSession(stored, [true, true, true, true, false]),
    );

    await expect(mapStatuses(store)).resolves.toEqual({
      a1: 'completed',
      'a-test': 'completed',
      b1: 'open',
    });
  });

  it('S3.5-AC1: should keep the next topic locked when the test is finished below 80%', async () => {
    const { store, stored } = makeTestService();
    await passFirstLesson(store);

    await stored.finishLesson(
      'a-test',
      finishedSession(stored, [true, true, false, false, false]),
    );

    await expect(mapStatuses(store)).resolves.toEqual({
      a1: 'completed',
      'a-test': 'open',
      b1: 'locked',
    });
  });

  it('S3.5-AC1: should keep the next topic locked when the test has a skipped question, even if all answered are correct', async () => {
    const { store, stored } = makeTestService();
    await passFirstLesson(store);

    await stored.finishLesson(
      'a-test',
      finishedSession(stored, [true, true, true, true, 'skip']),
    );

    await expect(mapStatuses(store)).resolves.toMatchObject({
      'a-test': 'open',
      b1: 'locked',
    });
  });

  it('S3.5-AC1: should keep a passed test completed when a retry scores lower', async () => {
    const { store, stored } = makeTestService();
    await passFirstLesson(store);
    await stored.finishLesson(
      'a-test',
      finishedSession(stored, [true, true, true, true, true]),
    );

    await stored.finishLesson(
      'a-test',
      finishedSession(stored, [true, true, false, false, false]),
    );

    await expect(mapStatuses(store)).resolves.toMatchObject({
      'a-test': 'completed',
      b1: 'open',
    });
  });

  it('S3.5-AC1: should report a failed test as not passed in the returned summary', async () => {
    const { stored } = makeTestService();

    const result = await stored.finishLesson(
      'a-test',
      finishedSession(stored, [true, true, false, false, false]),
    );

    expect(result).toMatchObject({ isPassed: false, isComplete: false });
  });

  const makeSinkService = () => {
    const { store } = makeTestService();
    const record = vi.fn<WrongAnswerSink['record']>(async () => undefined);
    const source: LessonSource = {
      getLesson: vi.fn(async (id: string) => ({
        id,
        type: id === 'a-test' ? ('test' as const) : ('lesson' as const),
        title: id,
        exercises: EXERCISES,
      })),
    };
    return {
      store,
      record,
      stored: new LessonService(source, store, { record }),
    };
  };

  it('S3.5-AC2: should hand the wrong questions to the review sink when the test is not passed', async () => {
    const { stored, record } = makeSinkService();

    await stored.finishLesson(
      'a-test',
      finishedSession(stored, [true, true, false, false, false]),
    );

    expect(record).toHaveBeenCalledExactlyOnceWith('a-test', [
      'x2',
      'x3',
      'x4',
    ]);
  });

  it('S3.5-AC2: should still hand over the wrong questions when the test is passed with some wrong', async () => {
    const { stored, record } = makeSinkService();

    await stored.finishLesson(
      'a-test',
      finishedSession(stored, [true, true, true, true, false]),
    );

    expect(record).toHaveBeenCalledExactlyOnceWith('a-test', ['x4']);
  });

  it('S3.5-AC2: should hand over nothing when the test has no wrong question', async () => {
    const { stored, record } = makeSinkService();

    await stored.finishLesson(
      'a-test',
      finishedSession(stored, [true, true, true, true, true]),
    );

    expect(record).not.toHaveBeenCalled();
  });

  it('S3.5-AC2: should not call the review sink for a regular lesson even with wrong answers', async () => {
    const { stored, record } = makeSinkService();

    await stored.finishLesson(
      'b1',
      finishedSession(stored, [true, false, false]),
    );

    expect(record).not.toHaveBeenCalled();
  });

  it('S3.5-AC2: should report isSaved false when the review sink fails, and still return the summary', async () => {
    const { store } = makeTestService();
    const record = vi.fn(async () => {
      throw new Error('sink down');
    });
    const source: LessonSource = {
      getLesson: vi.fn(async (id: string) => ({
        id,
        type: 'test' as const,
        title: id,
        exercises: EXERCISES,
      })),
    };
    const stored = new LessonService(source, store, { record });

    const result = await stored.finishLesson(
      'a-test',
      finishedSession(stored, [true, true, false, false, false]),
    );

    expect(record).toHaveBeenCalled();
    expect(result).toMatchObject({ isSaved: false, isPassed: false });
  });

  it('S3.5-AC1: should report isSaved false and write nothing when the lesson cannot be read', async () => {
    const { store } = makeTestService();
    const source: LessonSource = {
      getLesson: vi.fn(async () => {
        throw new Error('content missing');
      }),
    };
    const stored = new LessonService(source, store);

    const result = await stored.finishLesson(
      'a-test',
      finishedSession(stored, [true, true, true, true, true]),
    );

    expect(result.isSaved).toBe(false);
    await expect(store.getLessonProgress('a-test')).resolves.toBeUndefined();
  });
});

describe('LessonService — mở lại bài kiểm tra đang làm dở (S3.5)', () => {
  const makeTestService = () => {
    const store = new DexieProgressStore(
      createDatabase(`test-${crypto.randomUUID()}`),
    );
    const source: LessonSource = {
      getLesson: vi.fn(async (id: string) => ({
        id,
        type: id === 'a-test' ? ('test' as const) : ('lesson' as const),
        title: id,
        exercises: EXERCISES,
      })),
    };
    return { store, stored: new LessonService(source, store) };
  };

  it('S3.5-X1: should open a test at the first question even when a position was saved', async () => {
    const { store, stored } = makeTestService();
    await store.saveLessonProgress({
      lessonId: 'a-test',
      status: 'in-progress',
      cursor: 2,
    });

    const { session } = await stored.openLesson('a-test');

    expect(session).toMatchObject({ currentIndex: 0, phase: 'answering' });
  });

  it('S3.5-X1: should not save a position when the learner leaves a test mid-way', async () => {
    const { store, stored } = makeTestService();

    await stored.saveCursor('a-test', stored.startSession(EXERCISES, 2));

    await expect(store.getLessonProgress('a-test')).resolves.toBeUndefined();
  });

  it('S3.5-X1: should leave an existing test progress row unchanged when the learner leaves mid-way', async () => {
    const { store, stored } = makeTestService();
    await store.saveLessonProgress({ lessonId: 'a-test', status: 'completed' });

    await stored.saveCursor('a-test', stored.startSession(EXERCISES, 1));

    await expect(store.getLessonProgress('a-test')).resolves.toEqual({
      lessonId: 'a-test',
      status: 'completed',
    });
  });

  it('S3.5-X1: should still save the position for a regular lesson', async () => {
    const { store, stored } = makeTestService();

    await stored.saveCursor('a1', stored.startSession(EXERCISES, 2));

    await expect(store.getLessonProgress('a1')).resolves.toEqual({
      lessonId: 'a1',
      status: 'in-progress',
      cursor: 2,
    });
  });
});

describe('LessonService — nguồn nội dung lỗi lúc kết thúc bài (S3.5)', () => {
  const NOW = 1_000_000;

  // Nguồn đọc được lúc mở bài rồi lỗi từ lần đọc kế tiếp (mất mạng giữa chừng).
  const makeFlakySetup = (type: 'lesson' | 'test') => {
    const store = new DexieProgressStore(
      createDatabase(`test-${crypto.randomUUID()}`),
    );
    const getLesson = vi
      .fn<LessonSource['getLesson']>()
      .mockResolvedValueOnce({
        id: 'l1',
        type,
        title: 'l1',
        exercises: EXERCISES,
      })
      .mockRejectedValue(new Error('mất mạng'));
    return { store, stored: new LessonService({ getLesson }, store) };
  };

  const finishedWith = (
    stored: LessonService,
    outcomes: readonly boolean[],
  ) => {
    let session = stored.startSession(EXERCISES, 0, NOW);
    outcomes.forEach((isCorrect) => {
      session = stored.advance(
        stored.submitResult(session, { isCorrect }),
        NOW,
      );
    });
    return session;
  };

  it('S3.5-AC1: should still mark a regular lesson completed and saved when the content source fails at finish', async () => {
    const { store, stored } = makeFlakySetup('lesson');
    await stored.openLesson('l1');

    const outcome = await stored.finishLesson(
      'l1',
      finishedWith(stored, [true, true, true]),
    );

    expect(outcome.isSaved).toBe(true);
    await expect(store.getLessonProgress('l1')).resolves.toEqual({
      lessonId: 'l1',
      status: 'completed',
    });
  });

  it('S3.5-AC1: should still score an opened test at 80% when the content source fails at finish', async () => {
    const { store, stored } = makeFlakySetup('test');
    await stored.openLesson('l1');

    const outcome = await stored.finishLesson(
      'l1',
      finishedWith(stored, [true, false, false]),
    );

    expect(outcome).toMatchObject({ isPassed: false, isComplete: false });
    await expect(store.getLessonProgress('l1')).resolves.toBeUndefined();
  });
});

describe('LessonService — kết thúc bài kiểm tra vượt cấp (S3.6)', () => {
  const NOW = 1_000_000;

  const unit = (n: number) => ({
    id: `u${n}`,
    title: `u${n}`,
    lessonIds: [`u${n}-1`, `u${n}-2`, `u${n}-test`],
  });

  const STAGES: Stage[] = [
    { id: 'main', title: 'main', units: [1, 2, 3, 4, 5, 6].map(unit) },
  ];

  const placementOf = (n: number) => ({ lessonIds: unit(n).lessonIds });

  const makeSetup = () => {
    const store = new DexieProgressStore(
      createDatabase(`test-${crypto.randomUUID()}`),
    );
    const source: LessonSource = {
      getLesson: vi.fn(async (id: string) => ({
        id,
        type: id.endsWith('-test') ? ('test' as const) : ('lesson' as const),
        title: id,
        exercises: EXERCISES,
      })),
    };
    return { store, stored: new LessonService(source, store) };
  };

  const passedSession = (stored: LessonService) => {
    let session = stored.startSession(EXERCISES, 0, NOW);
    EXERCISES.forEach(() => {
      session = stored.advance(
        stored.submitResult(session, { isCorrect: true }),
        NOW,
      );
    });
    return session;
  };

  const completeUnits = async (store: DexieProgressStore, count: number) => {
    for (const n of [1, 2, 3, 4, 5, 6].slice(0, count)) {
      for (const lessonId of unit(n).lessonIds) {
        await store.saveLessonProgress({ lessonId, status: 'completed' });
      }
    }
  };

  const mapStatuses = async (store: DexieProgressStore) => {
    const progress = new ProgressService(store);
    const completed = await progress.getCompletedLessonIds();
    return Object.fromEntries(progress.deriveLessonStatuses(STAGES, completed));
  };

  it('S3.6-AC2: should complete every lesson of the unit and open the next unit when the placement test is passed', async () => {
    const { store, stored } = makeSetup();
    await completeUnits(store, 1);

    const result = await stored.finishLesson(
      'u2-test',
      passedSession(stored),
      placementOf(2),
    );

    expect(result.isSaved).toBe(true);
    const statuses = await mapStatuses(store);
    expect(statuses).toMatchObject({
      'u2-1': 'completed',
      'u2-2': 'completed',
      'u2-test': 'completed',
      'u3-1': 'open',
      'u3-2': 'locked',
    });
  });

  it('S3.6-AC2: should not open the units in between when a far unit is passed by placement', async () => {
    const { store, stored } = makeSetup();
    await completeUnits(store, 2);

    await stored.finishLesson('u5-test', passedSession(stored), placementOf(5));

    const statuses = await mapStatuses(store);
    expect(statuses).toMatchObject({
      'u3-1': 'open',
      'u4-1': 'locked',
      'u4-2': 'locked',
      'u4-test': 'locked',
      'u5-1': 'completed',
      'u5-2': 'completed',
      'u5-test': 'completed',
      'u6-1': 'open',
    });
  });

  it('S3.6-AC2: should keep the unit locked and the next unit unchanged when the placement test is not passed', async () => {
    const { store, stored } = makeSetup();
    await completeUnits(store, 1);
    let session = stored.startSession(EXERCISES, 0, NOW);
    for (const isCorrect of [true, false, false]) {
      session = stored.advance(
        stored.submitResult(session, { isCorrect }),
        NOW,
      );
    }

    const result = await stored.finishLesson(
      'u2-test',
      session,
      placementOf(2),
    );

    expect(result).toMatchObject({ isPassed: false, isComplete: false });
    const statuses = await mapStatuses(store);
    expect(statuses).toMatchObject({
      'u2-1': 'open',
      'u2-2': 'locked',
      'u2-test': 'locked',
      'u3-1': 'locked',
    });
  });

  it('S3.6-AC2: should keep the unit locked when the placement test still has a skipped exercise', async () => {
    const { store, stored } = makeSetup();
    await completeUnits(store, 1);
    let session = stored.startSession(EXERCISES, 0, NOW);
    session = stored.advance(stored.skip(session, NOW), NOW);
    for (const isCorrect of [true, true]) {
      session = stored.advance(
        stored.submitResult(session, { isCorrect }),
        NOW,
      );
    }

    const result = await stored.finishLesson(
      'u2-test',
      session,
      placementOf(2),
    );

    expect(result).toMatchObject({ isComplete: false });
    const statuses = await mapStatuses(store);
    expect(statuses).toMatchObject({
      'u2-1': 'open',
      'u2-2': 'locked',
      'u2-test': 'locked',
      'u3-1': 'locked',
    });
  });

  it('S3.6-AC2: should report isSaved false and leave the unit locked when the batch write fails', async () => {
    const { store, stored } = makeSetup();
    await completeUnits(store, 1);
    vi.spyOn(store, 'saveLessonProgressBatch').mockRejectedValue(
      new Error('write failed'),
    );

    const result = await stored.finishLesson(
      'u2-test',
      passedSession(stored),
      placementOf(2),
    );

    expect(result.isSaved).toBe(false);
    const statuses = await mapStatuses(store);
    expect(statuses).toMatchObject({ 'u2-1': 'open', 'u3-1': 'locked' });
  });

  it('S3.6-AC2: should write a regular lesson like any lesson, without completing the whole unit, when a placement is passed along', async () => {
    const { store, stored } = makeSetup();
    await completeUnits(store, 1);

    const result = await stored.finishLesson(
      'u2-1',
      passedSession(stored),
      placementOf(2),
    );

    expect(result.isSaved).toBe(true);
    const statuses = await mapStatuses(store);
    expect(statuses).toMatchObject({
      'u2-1': 'completed',
      'u2-2': 'open',
      'u2-test': 'locked',
      'u3-1': 'locked',
    });
  });

  it('S3.6-AC2: should complete only the test itself and open the next lesson because the previous one is done, not because of the placement', async () => {
    const { store, stored } = makeSetup();
    await completeUnits(store, 1);

    await stored.finishLesson('u2-test', passedSession(stored), placementOf(3));

    const statuses = await mapStatuses(store);
    expect(statuses).toMatchObject({
      'u2-test': 'completed',
      'u3-1': 'open',
      'u3-2': 'locked',
      'u3-test': 'locked',
    });
    for (const lessonId of ['u3-1', 'u3-2', 'u3-test']) {
      await expect(store.getLessonProgress(lessonId)).resolves.toBeUndefined();
    }
  });

  it('S3.6-AC2: should write a test that is not the last test of the unit like a regular lesson, without completing the whole unit', async () => {
    const { store, stored } = makeSetup();
    await completeUnits(store, 1);
    const lessonIds = ['u2-1', 'u2-mid-test', 'u2-2', 'u2-test'];

    const result = await stored.finishLesson(
      'u2-mid-test',
      passedSession(stored),
      { lessonIds },
    );

    expect(result.isSaved).toBe(true);
    await expect(store.getLessonProgress('u2-mid-test')).resolves.toMatchObject(
      { status: 'completed' },
    );
    for (const lessonId of ['u2-1', 'u2-2', 'u2-test']) {
      await expect(store.getLessonProgress(lessonId)).resolves.toBeUndefined();
    }
  });

  it('S3.6-AC2: should write only the finished test like a regular lesson when the real last test of the unit fails to load', async () => {
    const store = new DexieProgressStore(
      createDatabase(`test-${crypto.randomUUID()}`),
    );
    const source: LessonSource = {
      getLesson: vi.fn(async (id: string) => {
        if (id === 'u2-test') {
          throw new Error('load failed');
        }
        return {
          id,
          type: id.endsWith('-test') ? ('test' as const) : ('lesson' as const),
          title: id,
          exercises: EXERCISES,
        };
      }),
    };
    const stored = new LessonService(source, store);
    await completeUnits(store, 1);
    const lessonIds = ['u2-1', 'u2-mid-test', 'u2-2', 'u2-test'];

    const result = await stored.finishLesson(
      'u2-mid-test',
      passedSession(stored),
      { lessonIds },
    );

    expect(result.isSaved).toBe(true);
    await expect(store.getLessonProgress('u2-mid-test')).resolves.toMatchObject(
      { status: 'completed' },
    );
    for (const lessonId of ['u2-1', 'u2-2', 'u2-test']) {
      await expect(store.getLessonProgress(lessonId)).resolves.toBeUndefined();
    }
  });
});

describe('LessonService — bài kiểm tra có câu nói (S5.2)', () => {
  it('S5.2-AC2: should score a 5-question test at 80% and complete it when 4 speak answers are "correct" and 1 is "close"', () => {
    const ratings: SpeakRating[] = [
      'correct',
      'correct',
      'correct',
      'correct',
      'close',
    ];
    const exercises: Exercise[] = ratings.map((_rating, index) => ({
      id: `sp${index}`,
      kind: 'speak' as const,
      sentenceId: 's-nihao',
    }));
    let session = service.startSession(exercises, 0, 0);
    ratings.forEach((rating) => {
      session = service.advance(
        service.submitResult(session, { isCorrect: isRatingCorrect(rating) }),
        0,
      );
    });

    expect(session.phase).toBe('finished');
    expect(service.summarize(session, 'test')).toMatchObject({
      scorePercent: 80,
      isPassed: true,
      isComplete: true,
    });
  });
});
