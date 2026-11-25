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

const PERSON_WRITING_LESSON: Lesson = {
  id: 'nguoi-viet',
  type: 'lesson',
  title: 'Người (có câu viết chữ)',
  exercises: [
    { id: 'c1', kind: 'stroke-write', wordId: '人' },
    { id: 'c2', kind: 'tone-choice', wordId: '人' },
  ],
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

  it('S9.1-AC2 Viết trước rồi học xong sau: DB rỗng, viết xong 人 → chưa có thẻ nào của 人; rồi xong bài 人 → có thẻ 人 chiều nghĩa, nghe và viết', async () => {
    const { store, service } = openService([PERSON_LESSON]);

    await service.recordCharacterWriting(
      { character: '人', isGuided: true },
      NOW,
    );

    expect(await store.getWrittenCharacters()).toContain('人');
    expect(
      (await store.getAllCards()).filter((card) => card.wordId === '人'),
    ).toEqual([]);

    await service.createCardsForFinishedLesson(
      PERSON_LESSON,
      finishedSession(['p1']),
      NOW + 60_000,
    );

    expect(keysOf(await store.getAllCards())).toEqual([
      '人:listening:new',
      '人:meaning:new',
      '人:writing:new',
    ]);
  });

  it('S9.1-AC2 Làm hết bài có câu viết chữ thì có đủ ba chiều: DB rỗng, viết xong 人 ở câu viết (chưa chờ ghi xong) rồi bài kết thúc ngay → có thẻ 人 chiều nghĩa, nghe và viết, cả ba "mới"', async () => {
    const { store, service } = openService([PERSON_WRITING_LESSON]);

    const writing = service.recordCharacterWriting(
      { character: '人', isGuided: true },
      NOW,
    );
    await service.createCardsForFinishedLesson(
      PERSON_WRITING_LESSON,
      finishedSession(['c1', 'c2']),
      NOW,
    );
    await writing;

    const cards = await store.getAllCards();
    expect(keysOf(cards.filter((card) => card.wordId === '人'))).toEqual([
      '人:listening:new',
      '人:meaning:new',
      '人:writing:new',
    ]);
    expect(cards).toHaveLength(3);
  });
});
