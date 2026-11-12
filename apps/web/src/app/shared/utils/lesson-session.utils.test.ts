import type { LessonSession } from '@shared/models/lesson-session.model';
import {
  finishedProgress,
  isTestPassed,
  nextProgress,
  resolveStartIndex,
  summarizeSession,
} from './lesson-session.utils';

const makeSession = (
  overrides: Partial<LessonSession> = {},
): LessonSession => ({
  exerciseIds: ['e1', 'e2', 'e3', 'e4', 'e5'],
  currentIndex: 4,
  phase: 'finished',
  lastResult: null,
  skippedCount: 0,
  correctCount: 0,
  wrongCount: 0,
  wrongExerciseIds: [],
  startedAt: 1_000,
  finishedAt: 11_400,
  ...overrides,
});

describe('resolveStartIndex', () => {
  it('should resume at the saved cursor when it is an integer inside the lesson', () => {
    expect(resolveStartIndex(2, 5)).toBe(2);
    expect(resolveStartIndex(0, 5)).toBe(0);
    expect(resolveStartIndex(4, 5)).toBe(4);
  });

  it('should start from the beginning when the cursor is missing or invalid', () => {
    expect(resolveStartIndex(undefined, 5)).toBe(0);
    expect(resolveStartIndex(5, 5)).toBe(0);
    expect(resolveStartIndex(-1, 5)).toBe(0);
    expect(resolveStartIndex(1.5, 5)).toBe(0);
    expect(resolveStartIndex(Number.NaN, 5)).toBe(0);
  });
});

describe('isTestPassed', () => {
  it('should pass at exactly the threshold and above', () => {
    expect(isTestPassed(4, 5)).toBe(true);
    expect(isTestPassed(5, 5)).toBe(true);
  });

  it('should fail below the threshold', () => {
    expect(isTestPassed(3, 5)).toBe(false);
    expect(isTestPassed(79, 100)).toBe(false);
    expect(isTestPassed(80, 100)).toBe(true);
  });

  it('should fail when nothing was answered', () => {
    expect(isTestPassed(0, 0)).toBe(false);
  });
});

describe('summarizeSession', () => {
  it('should score correct over answered, rounded, with elapsed seconds', () => {
    const summary = summarizeSession(
      makeSession({ correctCount: 2, wrongCount: 1 }),
      'lesson',
    );

    expect(summary).toMatchObject({
      scorePercent: 67,
      correctCount: 2,
      answeredCount: 3,
      wrongCount: 1,
      skippedCount: 0,
      elapsedSeconds: 10,
      isPassed: null,
      isComplete: true,
    });
  });

  it('should return score 0 and elapsed 0 when nothing was answered and not finished', () => {
    const summary = summarizeSession(
      makeSession({ phase: 'answering', finishedAt: null }),
      'lesson',
    );

    expect(summary).toMatchObject({
      scorePercent: 0,
      answeredCount: 0,
      elapsedSeconds: 0,
      isComplete: false,
    });
  });

  it('should not complete a regular lesson that has skipped exercises', () => {
    const summary = summarizeSession(
      makeSession({ correctCount: 4, skippedCount: 1 }),
      'lesson',
    );

    expect(summary.isComplete).toBe(false);
  });

  it('should complete a test only when finished, without skips and passed', () => {
    expect(
      summarizeSession(makeSession({ correctCount: 4, wrongCount: 1 }), 'test'),
    ).toMatchObject({ isPassed: true, isComplete: true });
    expect(
      summarizeSession(makeSession({ correctCount: 3, wrongCount: 2 }), 'test'),
    ).toMatchObject({ isPassed: false, isComplete: false });
    expect(
      summarizeSession(
        makeSession({ correctCount: 4, wrongCount: 0, skippedCount: 1 }),
        'test',
      ),
    ).toMatchObject({ isPassed: true, isComplete: false });
  });
});

describe('nextProgress', () => {
  it('should record the cursor as in-progress for a new lesson', () => {
    expect(nextProgress(undefined, 'l1', 2)).toEqual({
      lessonId: 'l1',
      status: 'in-progress',
      cursor: 2,
    });
  });

  it('should keep the completed status when leaving a completed lesson midway', () => {
    expect(
      nextProgress({ lessonId: 'l1', status: 'completed' }, 'l1', 1),
    ).toEqual({ lessonId: 'l1', status: 'completed', cursor: 1 });
  });
});

describe('finishedProgress', () => {
  it('should drop the cursor and stay in-progress for a lesson not yet completed', () => {
    expect(
      finishedProgress(
        { lessonId: 'l1', status: 'in-progress', cursor: 3 },
        'l1',
      ),
    ).toEqual({ lessonId: 'l1', status: 'in-progress' });
  });

  it('should keep the completed status and drop the cursor', () => {
    expect(
      finishedProgress(
        { lessonId: 'l1', status: 'completed', cursor: 3 },
        'l1',
      ),
    ).toEqual({ lessonId: 'l1', status: 'completed' });
  });
});
