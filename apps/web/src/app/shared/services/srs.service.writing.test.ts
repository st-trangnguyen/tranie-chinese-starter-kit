import { describe, expect, it } from 'vitest';

import { reviewCardSchema, type Lesson } from '@csk/shared';

import {
  finishedSession,
  keysOf,
  NOW,
  openService,
} from '@test/srs-lesson.helpers';

const PERSON_LESSON: Lesson = {
  id: 'nguoi',
  type: 'lesson',
  title: 'Người',
  exercises: [{ id: 'p1', kind: 'tone-choice', wordId: '人' }],
};

describe('SrsService — Phần 3: recordCharacterWriting', () => {
  it('S9.1-AC2 Viết xong chữ của từ đã học thì tạo thẻ chiều viết: đã học xong bài 人, viết xong 人 trên khung có gợi ý → 人 là chữ đã viết, có thẻ 人 chiều viết "mới"', async () => {
    const { store, service } = openService();
    await service.createCardsForFinishedLesson(
      PERSON_LESSON,
      finishedSession(['p1']),
      NOW,
    );
    expect(keysOf(await store.getAllCards())).toEqual([
      '人:listening:new',
      '人:meaning:new',
    ]);

    await service.recordCharacterWriting(
      { character: '人', isGuided: true },
      NOW + 60_000,
    );

    expect(await store.getWrittenCharacters()).toContain('人');
    const cards = await store.getAllCards();
    expect(keysOf(cards)).toEqual([
      '人:listening:new',
      '人:meaning:new',
      '人:writing:new',
    ]);
    const writingCard = cards.find(
      (card) => card.wordId === '人' && card.facet === 'writing',
    );
    expect(reviewCardSchema.safeParse(writingCard).success).toBe(true);
  });
});
