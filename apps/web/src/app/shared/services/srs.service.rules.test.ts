import { describe, expect, it } from 'vitest';

import { reviewCardSchema, type Exercise } from '@csk/shared';

import { NOW, keysOf, lessonInput, wordOf } from '@test/srs-rules.helpers';

import type { LessonSession } from '@shared/models/lesson-session.model';

import { SrsService } from './srs.service';

const sessionOf = (overrides: Partial<LessonSession> = {}): LessonSession => ({
  exerciseIds: ['e1', 'e2', 'e3'],
  currentIndex: 2,
  phase: 'finished',
  lastResult: null,
  skippedCount: 0,
  correctCount: 3,
  wrongCount: 0,
  wrongExerciseIds: [],
  startedAt: NOW - 60_000,
  finishedAt: NOW,
  ...overrides,
});

describe('SrsService — Phần 2 (quy tắc tạo thẻ)', () => {
  const service = new SrsService();

  it('S9.1-AC1 Xong bài học thì tạo thẻ nghĩa và nghe: createNewCard tạo thẻ "mới" đến hạn ngay', () => {
    const card = service.createNewCard('你好', 'meaning', NOW);

    expect(reviewCardSchema.safeParse(card).success).toBe(true);
    expect(card).toMatchObject({
      wordId: '你好',
      facet: 'meaning',
      state: 'new',
      due: NOW,
      reps: 0,
      lapses: 0,
    });
    expect(card).not.toHaveProperty('lastReview');
  });

  it('S9.1-AC1 Xong bài học thì tạo thẻ nghĩa và nghe: planLessonCards cho 你好, 谢谢 khi chưa có thẻ → đúng 4 thẻ nghĩa/nghe "mới"', () => {
    const cards = service.planLessonCards(lessonInput(['你好', '谢谢']));

    expect(keysOf(cards)).toEqual(
      [
        '你好:meaning:new',
        '你好:listening:new',
        '谢谢:meaning:new',
        '谢谢:listening:new',
      ].sort(),
    );
    expect(cards.some((card) => card.facet === 'writing')).toBe(false);
    for (const card of cards) {
      expect(reviewCardSchema.safeParse(card).success).toBe(true);
      expect(card.due).toBe(NOW);
    }
  });

  it('S9.1-AC1 Câu cặp âm tạo thẻ cho cả hai từ: collectLessonWordIds lấy cả hai từ của cặp âm', () => {
    const exercises: readonly Exercise[] = [
      {
        id: 'e1',
        kind: 'sound-pair',
        wordIds: ['妈', '马'],
        answerWordId: '妈',
      },
    ];

    expect(service.collectLessonWordIds(exercises)).toEqual(['妈', '马']);
  });

  it('S9.1-AC1 Câu cặp âm tạo thẻ cho cả hai từ: câu một từ lấy từ của câu, trùng từ chỉ một lần', () => {
    const exercises: readonly Exercise[] = [
      { id: 'e1', kind: 'tone-choice', wordId: '人' },
      { id: 'e2', kind: 'pinyin-type', wordId: '你好' },
      { id: 'e3', kind: 'stroke-write', wordId: '人' },
      { id: 'e4', kind: 'speak', wordId: '谢谢' },
      {
        id: 'e5',
        kind: 'sound-pair',
        wordIds: ['妈', '马'],
        answerWordId: '马',
      },
      { id: 'e6', kind: 'tone-choice', wordId: '妈' },
    ];

    expect(service.collectLessonWordIds(exercises)).toEqual([
      '人',
      '你好',
      '谢谢',
      '妈',
      '马',
    ]);
  });

  it('S9.1-AC1 Câu nói theo câu không tạo thẻ: bài chỉ có câu nói theo một câu → không có từ, không có thẻ', () => {
    const exercises: readonly Exercise[] = [
      { id: 'e1', kind: 'speak', sentenceId: 's-ni-hao-ma' },
      { id: 'e2', kind: 'speak', sentenceId: 's-xie-xie-ni' },
    ];

    const wordIds = service.collectLessonWordIds(exercises);

    expect(wordIds).toEqual([]);
    expect(service.planLessonCards(lessonInput(wordIds))).toEqual([]);
  });

  it('S9.1-AC1 Học xong bài chưa có thẻ chiều viết: bài có 人, chưa từng viết 人 → chỉ thẻ nghĩa và nghe, không có chiều viết', () => {
    const input = lessonInput(['人'], {
      writtenCharacters: new Set(),
      strokeCharacters: new Set(['人']),
    });

    const cards = service.planLessonCards(input);

    expect(keysOf(cards)).toEqual(['人:listening:new', '人:meaning:new']);
    expect(cards.some((card) => card.facet === 'writing')).toBe(false);
    expect(
      service.canHaveWritingCard(wordOf('人'), new Set(), new Set(['人'])),
    ).toBe(false);
  });

  it('S9.1-AC1 Bài chưa xong không tạo thẻ: bài học thoát khi chưa làm hết câu, hoặc làm hết nhưng bỏ qua 1 câu → không đủ điều kiện tạo thẻ', () => {
    expect(service.isCardEligibleLesson('lesson', sessionOf())).toBe(true);

    const leftMidway = sessionOf({
      phase: 'answering',
      currentIndex: 1,
      correctCount: 1,
      finishedAt: null,
    });
    expect(service.isCardEligibleLesson('lesson', leftMidway)).toBe(false);

    const finishedWithSkip = sessionOf({ skippedCount: 1, correctCount: 2 });
    expect(service.isCardEligibleLesson('lesson', finishedWithSkip)).toBe(
      false,
    );
  });

  it('S9.1-AC1 Bài kiểm tra không tạo thẻ: bài kiểm tra làm hết, đúng mọi câu, không bỏ câu → không đủ điều kiện tạo thẻ', () => {
    const perfectRun = sessionOf();

    expect(service.isCardEligibleLesson('lesson', perfectRun)).toBe(true);
    expect(service.isCardEligibleLesson('test', perfectRun)).toBe(false);
  });
});
