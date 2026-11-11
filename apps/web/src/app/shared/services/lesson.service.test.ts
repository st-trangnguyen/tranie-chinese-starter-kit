import type { Exercise } from '@csk/shared';

import { LessonService } from './lesson.service';

const EXERCISES: Exercise[] = [
  { id: 'e1', kind: 'tone-choice', wordId: '八' },
  { id: 'e2', kind: 'tone-choice', wordId: '白' },
  { id: 'e3', kind: 'tone-choice', wordId: '百' },
];

const service = new LessonService();

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
});
