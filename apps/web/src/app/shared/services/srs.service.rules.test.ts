import { describe, expect, it } from 'vitest';

import { reviewCardSchema, type ReviewCard, type Word } from '@csk/shared';

import type { LessonCardPlanInput } from '@shared/models/review-card.model';
import { makeWord } from '@test/content-service.fixtures';

import { SrsService } from './srs.service';

const NOW = Date.UTC(2026, 10, 25, 8, 30);

const wordOf = (hanzi: string): Word => ({ ...makeWord(hanzi), hanzi });

const lessonInput = (
  wordIds: readonly string[],
  overrides: Partial<LessonCardPlanInput> = {},
): LessonCardPlanInput => ({
  wordIds,
  wordsById: new Map(wordIds.map((id) => [id, wordOf(id)])),
  cards: [],
  writtenCharacters: new Set(),
  strokeCharacters: new Set(['人', '你', '好', '谢']),
  now: NOW,
  ...overrides,
});

const keysOf = (cards: readonly ReviewCard[]): string[] =>
  cards.map((card) => `${card.wordId}:${card.facet}:${card.state}`).sort();

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
});
