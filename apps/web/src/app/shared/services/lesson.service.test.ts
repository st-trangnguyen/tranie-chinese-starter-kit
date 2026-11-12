import type { Exercise, Stage } from '@csk/shared';

import { createDatabase } from '@core/helpers/db.helper';
import {
  DexieProgressStore,
  type ProgressStore,
} from '@core/services/progress-store.service';
import { ProgressService } from './progress.service';
import { LessonService, type LessonSource } from './lesson.service';

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
    expect(service.summarize(session)).toMatchObject({
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

    expect(service.summarize(session)).toMatchObject({
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

    expect(service.summarize(session)).toMatchObject({
      scorePercent: 0,
      wrongCount: 5,
    });
  });

  it('S3.4-AC1: should round the score to an integer, 2 of 3 is 67%', () => {
    const session = answerAll(makeExercises(3), [true, false, true]);

    expect(service.summarize(session).scorePercent).toBe(67);
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
    expect(service.summarize(session)).toMatchObject({
      scorePercent: 100,
      answeredCount: 2,
      wrongCount: 0,
      skippedCount: 1,
      isComplete: false,
    });
  });

  it('S3.4-AC1: should be complete when finished with nothing skipped', () => {
    const session = answerAll(makeExercises(2), [true, false]);

    expect(service.summarize(session).isComplete).toBe(true);
  });

  it('S3.4-AC1: should not be complete before the last exercise is done', () => {
    const session = service.startSession(makeExercises(3), 0, START);

    expect(service.summarize(session).isComplete).toBe(false);
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

    expect(service.summarize(session)).toMatchObject({
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

    expect(service.summarize(session).elapsedSeconds).toBe(125);
  });

  it('S3.4-AC1: should never report negative elapsed time when the clock goes backwards', () => {
    let session = service.startSession(makeExercises(1), 0, START);
    session = service.advance(
      service.submitResult(session, { isCorrect: true }),
      START - 5_000,
    );

    expect(service.summarize(session).elapsedSeconds).toBe(0);
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
