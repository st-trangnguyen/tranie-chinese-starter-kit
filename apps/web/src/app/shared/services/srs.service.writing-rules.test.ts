import { describe, expect, it } from 'vitest';

import { reviewCardSchema } from '@csk/shared';

import {
  NOW,
  keysOf,
  lessonInput,
  wordOf,
  writingInput,
} from '@test/srs-rules.helpers';

import { SrsService } from './srs.service';

describe('SrsService — Phần 2 (quy tắc tạo thẻ chiều viết)', () => {
  const service = new SrsService();

  it('S9.1-AC2 Từ nhiều chữ cần viết xong mọi chữ: 你好 chỉ được thẻ chiều viết khi đã viết cả 你 và 好', () => {
    const strokeCharacters = new Set(['你', '好']);

    expect(service.charactersOf('你好')).toEqual(['你', '好']);
    expect(
      service.canHaveWritingCard(
        wordOf('你好'),
        new Set(['你']),
        strokeCharacters,
      ),
    ).toBe(false);
    expect(
      service.canHaveWritingCard(
        wordOf('你好'),
        new Set(['你', '好']),
        strokeCharacters,
      ),
    ).toBe(true);
  });

  it('S9.1-AC2 Từ nhiều chữ cần viết xong mọi chữ: planWritingCards sau khi viết 好 → thẻ 你好 chiều viết chỉ khi 你 đã viết', () => {
    const learnedCards = [
      service.createNewCard('你好', 'meaning', NOW),
      service.createNewCard('你好', 'listening', NOW),
    ];

    const onlyNi = service.planWritingCards(
      writingInput('你', {
        cards: learnedCards,
        writtenCharacters: new Set(['你']),
      }),
    );
    expect(onlyNi).toEqual([]);

    const bothWritten = service.planWritingCards(
      writingInput('好', {
        cards: learnedCards,
        writtenCharacters: new Set(['你', '好']),
      }),
    );
    expect(keysOf(bothWritten)).toEqual(['你好:writing:new']);
    for (const card of bothWritten) {
      expect(reviewCardSchema.safeParse(card).success).toBe(true);
      expect(card.due).toBe(NOW);
    }
  });
  it('S9.1-AC2 Viết xong chữ của từ đã học thì tạo thẻ chiều viết (TC-S9.1-AC2-25): 你好 có thẻ nghĩa + nghe, không bài nào đang xong, đã viết 你 rồi viết 好 → thẻ 你好 chiều viết "mới"', () => {
    const meaningCard = service.createNewCard('你好', 'meaning', NOW);
    const listeningCard = service.createNewCard('你好', 'listening', NOW);

    const cards = service.planWritingCards(
      writingInput('好', {
        words: [wordOf('你好')],
        cards: [meaningCard, listeningCard],
        writtenCharacters: new Set(['你', '好']),
        strokeCharacters: new Set(['你', '好']),
      }),
    );

    expect(keysOf(cards)).toEqual(['你好:writing:new']);
    for (const card of cards) {
      expect(reviewCardSchema.safeParse(card).success).toBe(true);
      expect(card.due).toBe(NOW);
    }
    expect(service.isWordLearned('你好', [meaningCard], new Set())).toBe(true);
    expect(service.isWordLearned('你好', [listeningCard], new Set())).toBe(
      false,
    );
  });

  it('S9.1-AC2 Bài được mở nhờ kiểm tra vượt cấp không đủ để tạo thẻ chiều viết: 人 chưa có thẻ nào, không bài nào đang xong, viết xong 人 → không học xong, không có thẻ', () => {
    expect(service.isWordLearned('人', [], new Set())).toBe(false);

    const cards = service.planWritingCards(
      writingInput('人', {
        words: [wordOf('人')],
        cards: [],
        writtenCharacters: new Set(['人']),
        strokeCharacters: new Set(['人']),
      }),
    );

    expect(cards).toEqual([]);
  });

  it('S9.1-AC2 Chữ đã viết dùng chung cho các từ: đã viết 你 và 好, xong bài có 你, 好, 你好 → cả ba từ có thẻ chiều viết', () => {
    const cards = service.planLessonCards(
      lessonInput(['你', '好', '你好'], {
        writtenCharacters: new Set(['你', '好']),
        strokeCharacters: new Set(['你', '好']),
      }),
    );

    expect(
      cards
        .filter((card) => card.facet === 'writing')
        .map((card) => card.wordId)
        .sort(),
    ).toEqual(['你', '你好', '好'].sort());
    expect(keysOf(cards)).toEqual(
      [
        '你:meaning:new',
        '你:listening:new',
        '你:writing:new',
        '好:meaning:new',
        '好:listening:new',
        '好:writing:new',
        '你好:meaning:new',
        '你好:listening:new',
        '你好:writing:new',
      ].sort(),
    );
    for (const card of cards) {
      expect(reviewCardSchema.safeParse(card).success).toBe(true);
      expect(card.due).toBe(NOW);
    }
  });

  it('S9.1-AC2 Từ có chữ không có dữ liệu nét: 杯 không có dữ liệu nét dù đã viết → xong bài có 杯 chỉ có thẻ nghĩa và nghe, không có chiều viết', () => {
    const strokeCharacters = new Set(['人', '你', '好']);
    const writtenCharacters = new Set(['杯']);

    expect(
      service.canHaveWritingCard(
        wordOf('杯'),
        writtenCharacters,
        strokeCharacters,
      ),
    ).toBe(false);

    const cards = service.planLessonCards(
      lessonInput(['杯'], { writtenCharacters, strokeCharacters }),
    );

    expect(keysOf(cards)).toEqual(
      ['杯:meaning:new', '杯:listening:new'].sort(),
    );
    for (const card of cards) {
      expect(reviewCardSchema.safeParse(card).success).toBe(true);
      expect(card.due).toBe(NOW);
    }
  });

  it('S9.1-AC2 Viết không gợi ý không tính: 人 đã học, chưa viết có gợi ý, viết xong 人 không gợi ý → không tính, không có thẻ chiều viết', () => {
    const meaningCard = service.createNewCard('人', 'meaning', NOW);
    const planAfter = (writing: { character: string; isGuided: boolean }) =>
      service.planWritingCards(
        writingInput('人', {
          words: [wordOf('人')],
          cards: [meaningCard],
          writtenCharacters: service.addWrittenCharacter(new Set(), writing),
          strokeCharacters: new Set(['人']),
        }),
      );
    const unguided = { character: '人', isGuided: false };
    const guided = { character: '人', isGuided: true };

    expect(service.countsAsStrokeWritten(unguided)).toBe(false);
    expect([...service.addWrittenCharacter(new Set(), unguided)]).toEqual([]);
    expect(planAfter(unguided)).toEqual([]);

    expect(service.countsAsStrokeWritten(guided)).toBe(true);
    expect([...service.addWrittenCharacter(new Set(), guided)]).toEqual(['人']);
    expect(keysOf(planAfter(guided))).toEqual(['人:writing:new']);
  });
});
