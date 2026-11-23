import type { Lesson } from '@csk/shared';

import {
  makeSentence,
  makeSource,
  makeWord,
} from '@test/content-service.fixtures';

import { ContentService } from './content.service';

describe('ContentService.getExerciseContents — use case', () => {
  const lesson: Lesson = {
    id: 'l1',
    type: 'lesson',
    title: 'Bài l1',
    exercises: [
      {
        id: 'e1',
        kind: 'sound-pair',
        wordIds: ['w3', 'w1'],
        answerWordId: 'w1',
      },
      { id: 'e2', kind: 'speak', sentenceId: 's2' },
      { id: 'e3', kind: 'tone-choice', wordId: 'w2' },
    ],
  };

  it('S4.4-AC1: should map each exercise id to its words and sentences in id order', async () => {
    const service = new ContentService(makeSource());

    const contents = await service.getExerciseContents(lesson);

    expect([...contents.keys()]).toEqual(['e1', 'e2', 'e3']);
    expect(contents.get('e1')).toEqual({
      words: [makeWord('w3'), makeWord('w1')],
      sentences: [],
    });
    expect(contents.get('e2')).toEqual({
      words: [],
      sentences: [makeSentence('s2')],
    });
    expect(contents.get('e3')).toEqual({
      words: [makeWord('w2')],
      sentences: [],
    });
  });

  it('S4.4-AC1: should fail with a clear message when a word id is missing', async () => {
    const service = new ContentService(makeSource());
    const broken: Lesson = {
      ...lesson,
      exercises: [{ id: 'e9', kind: 'tone-choice', wordId: 'nope' }],
    };

    await expect(service.getExerciseContents(broken)).rejects.toThrow(
      'Không tìm thấy từ "nope" của câu "e9".',
    );
  });

  it('S4.4-AC1: should fail naming the sentence when a sentence id is missing', async () => {
    const service = new ContentService(makeSource());
    const broken: Lesson = {
      ...lesson,
      exercises: [{ id: 'e8', kind: 'speak', sentenceId: 'gone' }],
    };

    await expect(service.getExerciseContents(broken)).rejects.toThrow(
      /gone.*e8/,
    );
  });

  it('S4.4-AC1: should wrap a load failure with a clear message and cause', async () => {
    const source = makeSource();
    const failure = new Error('404');
    vi.mocked(source.getWords).mockRejectedValueOnce(failure);
    const service = new ContentService(source);

    const error = await service.getExerciseContents(lesson).then(
      () => null,
      (e: unknown) => e,
    );

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).not.toBe('404');
    expect((error as Error).cause).toBe(failure);
  });
});
