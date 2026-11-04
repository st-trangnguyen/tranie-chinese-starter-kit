import { describe, expect, it } from 'vitest';

import { lessonSchema, wordSchema } from './content.schema';

const WORD = {
  id: '你好',
  hanzi: '你好',
  pinyin: 'nǐ hǎo',
  vi: ['xin chào'],
  viReviewed: true,
  hsk: 1,
  audio: 'audio/0123456789abcdef.mp3',
};

const lessonWith = (exercises: unknown[]): unknown => ({
  id: 'intro-01',
  type: 'lesson',
  title: 'Thanh điệu',
  exercises,
});

describe('wordSchema', () => {
  it('accepts a complete word', () => {
    expect(wordSchema.safeParse(WORD).success).toBe(true);
  });

  it('rejects numbered pinyin and a malformed audio path', () => {
    expect(wordSchema.safeParse({ ...WORD, pinyin: 'ni3 hao3' }).success).toBe(
      false,
    );
    expect(wordSchema.safeParse({ ...WORD, audio: 'nihao.mp3' }).success).toBe(
      false,
    );
  });
});

describe('lessonSchema', () => {
  it('accepts every 0.1 exercise kind', () => {
    const result = lessonSchema.safeParse(
      lessonWith([
        { id: 'e1', kind: 'tone-choice', wordId: '好' },
        {
          id: 'e2',
          kind: 'sound-pair',
          wordIds: ['四', '十'],
          answerWordId: '四',
        },
        { id: 'e3', kind: 'pinyin-type', wordId: '好' },
        { id: 'e4', kind: 'speak', sentenceId: 's-nihao' },
        { id: 'e5', kind: 'stroke-write', wordId: '人' },
      ]),
    );
    expect(result.success).toBe(true);
  });

  it('rejects an unknown kind', () => {
    const result = lessonSchema.safeParse(
      lessonWith([{ id: 'e1', kind: 'karaoke', wordId: '好' }]),
    );
    expect(result.success).toBe(false);
  });

  it('requires exactly one target for speak', () => {
    const both = lessonSchema.safeParse(
      lessonWith([{ id: 'e1', kind: 'speak', wordId: '好', sentenceId: 's' }]),
    );
    const none = lessonSchema.safeParse(
      lessonWith([{ id: 'e1', kind: 'speak' }]),
    );
    expect(both.success).toBe(false);
    expect(none.success).toBe(false);
  });

  it('reports the path of a sound-pair answer outside the pair', () => {
    const result = lessonSchema.safeParse(
      lessonWith([
        {
          id: 'e1',
          kind: 'sound-pair',
          wordIds: ['四', '十'],
          answerWordId: '好',
        },
      ]),
    );
    expect(result.error?.issues[0]?.path).toEqual([
      'exercises',
      0,
      'answerWordId',
    ]);
  });

  it('rejects duplicated exercise ids', () => {
    const result = lessonSchema.safeParse(
      lessonWith([
        { id: 'e1', kind: 'tone-choice', wordId: '好' },
        { id: 'e1', kind: 'pinyin-type', wordId: '好' },
      ]),
    );
    expect(result.error?.issues[0]?.path).toEqual(['exercises', 1, 'id']);
  });
});
