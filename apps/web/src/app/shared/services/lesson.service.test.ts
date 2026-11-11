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
});
