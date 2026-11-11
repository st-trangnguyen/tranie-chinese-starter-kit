import type { Exercise } from '@csk/shared';

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

  it('S3.2-AC1: should count skipped exercises, not answered ones', () => {
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

  it('S3.2-AC1: should skip an exercise without showing a result', () => {
    const next = service.skip(service.startSession(EXERCISES));

    expect(next).toMatchObject({
      currentIndex: 1,
      phase: 'answering',
      lastResult: null,
    });
  });
});
