import { describe, expect, it, vi } from 'vitest';

import { reviewCardSchema, type Lesson, type ReviewCard } from '@csk/shared';

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

  it('S9.1-AC2 Viết lại không tạo trùng thẻ chiều viết: đã có thẻ 人 chiều viết (đã ôn, "review"), viết xong 人 thêm một lần → vẫn một thẻ 人 chiều viết, giữ trạng thái và ngày ôn', async () => {
    const { store, service } = openService([PERSON_LESSON]);
    const firstWrite = NOW - 7 * 24 * 60 * 60 * 1000;
    const meaning = service.createNewCard('人', 'meaning', firstWrite);
    const listening = service.createNewCard('人', 'listening', firstWrite);
    const reviewedWriting: ReviewCard = {
      ...service.createNewCard('人', 'writing', firstWrite),
      state: 'review',
      due: Date.UTC(2026, 11, 2, 8, 0, 0),
      stability: 3.2,
      difficulty: 5.1,
      scheduledDays: 7,
      reps: 1,
      lastReview: NOW - 60 * 60 * 1000,
    };
    await store.addNewCards([meaning, listening, reviewedWriting]);
    await store.addWrittenCharacter('人');

    await service.recordCharacterWriting(
      { character: '人', isGuided: true },
      NOW,
    );

    const cards = await store.getAllCards();
    expect(keysOf(cards)).toEqual([
      '人:listening:new',
      '人:meaning:new',
      '人:writing:review',
    ]);
    expect(
      cards.filter((card) => card.wordId === '人' && card.facet === 'writing'),
    ).toStrictEqual([reviewedWriting]);
    expect(await store.getWrittenCharacters()).toEqual(['人']);
  });

  it('S9.1-AC2 Thẻ chiều viết còn thiếu được tạo ở lần viết xong sau: đã có thẻ 人 nghĩa và nghe, lần viết 人 lưu lỗi → báo lỗi rõ nghĩa giữ lỗi gốc, 人 chưa là chữ đã viết, không thẻ 人 chiều viết (xong bài 人 lần nữa vẫn không); viết lại lưu được → có thẻ 人 chiều viết "mới"', async () => {
    const { store, service } = openService([PERSON_LESSON]);
    await service.createCardsForFinishedLesson(
      PERSON_LESSON,
      finishedSession(['p1']),
      NOW,
    );
    expect(keysOf(await store.getAllCards())).toEqual([
      '人:listening:new',
      '人:meaning:new',
    ]);
    const storageError = new Error('QuotaExceededError');
    vi.spyOn(store, 'addWrittenCharacter').mockRejectedValueOnce(storageError);

    const failedWrite = service.recordCharacterWriting(
      { character: '人', isGuided: true },
      NOW + 60_000,
    );

    await expect(failedWrite).rejects.toThrow(
      new Error('Không ghi nhận được chữ đã viết.'),
    );
    await expect(failedWrite).rejects.toHaveProperty('cause', storageError);
    expect(await store.getWrittenCharacters()).not.toContain('人');
    expect(keysOf(await store.getAllCards())).toEqual([
      '人:listening:new',
      '人:meaning:new',
    ]);

    await service.createCardsForFinishedLesson(
      PERSON_LESSON,
      finishedSession(['p1']),
      NOW + 120_000,
    );
    expect(keysOf(await store.getAllCards())).toEqual([
      '人:listening:new',
      '人:meaning:new',
    ]);

    await service.recordCharacterWriting(
      { character: '人', isGuided: true },
      NOW + 180_000,
    );

    expect(await store.getWrittenCharacters()).toEqual(['人']);
    expect(keysOf(await store.getAllCards())).toEqual([
      '人:listening:new',
      '人:meaning:new',
      '人:writing:new',
    ]);
  });

  it('S9.1-AC2 Thẻ chiều viết còn thiếu được tạo ở lần xong bài sau: đã có thẻ 人 nghĩa và nghe, viết xong 人 nhưng lưu thẻ chiều viết lỗi → báo lỗi rõ nghĩa giữ lỗi gốc, 人 đã là chữ đã viết, không thẻ 人 chiều viết; xong bài 人 lần nữa lưu được → có thẻ 人 chiều viết "mới", vẫn một thẻ nghĩa và một thẻ nghe', async () => {
    const { store, service } = openService([PERSON_LESSON]);
    await service.createCardsForFinishedLesson(
      PERSON_LESSON,
      finishedSession(['p1']),
      NOW,
    );
    expect(keysOf(await store.getAllCards())).toEqual([
      '人:listening:new',
      '人:meaning:new',
    ]);
    const storageError = new Error('QuotaExceededError');
    vi.spyOn(store, 'addNewCards').mockRejectedValueOnce(storageError);

    const failedWrite = service.recordCharacterWriting(
      { character: '人', isGuided: true },
      NOW + 60_000,
    );

    await expect(failedWrite).rejects.toThrow(
      new Error('Không tạo được thẻ chiều viết.'),
    );
    await expect(failedWrite).rejects.toHaveProperty('cause', storageError);
    expect(await store.getWrittenCharacters()).toEqual(['人']);
    expect(keysOf(await store.getAllCards())).toEqual([
      '人:listening:new',
      '人:meaning:new',
    ]);

    await service.createCardsForFinishedLesson(
      PERSON_LESSON,
      finishedSession(['p1']),
      NOW + 120_000,
    );

    const cards = await store.getAllCards();
    expect(keysOf(cards)).toEqual([
      '人:listening:new',
      '人:meaning:new',
      '人:writing:new',
    ]);
    expect(cards).toHaveLength(3);
  });
});
