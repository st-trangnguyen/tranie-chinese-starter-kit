import type { Exercise } from '@csk/shared';

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
