import { describe, expect, it } from 'vitest';

import { reviewCardSchema, type Lesson, type ReviewCard } from '@csk/shared';

import { makeSource } from '@test/content-service.fixtures';

import { createDatabase } from '@core/helpers/db.helper';
import { DexieProgressStore } from '@core/services/progress-store.service';
import type { LessonSession } from '@shared/models/lesson-session.model';

import { SrsService } from './srs.service';

const NOW = Date.UTC(2026, 10, 25, 8, 30);

const openService = () => {
  const store = new DexieProgressStore(
    createDatabase(`test-${crypto.randomUUID()}`),
  );
  const source = makeSource();
  return { store, source, service: new SrsService(store, source) };
};

const finishedSession = (exerciseIds: readonly string[]): LessonSession => ({
  exerciseIds,
  currentIndex: exerciseIds.length - 1,
  phase: 'finished',
  lastResult: null,
  skippedCount: 0,
  correctCount: exerciseIds.length,
  wrongCount: 0,
  wrongExerciseIds: [],
  startedAt: NOW - 60_000,
  finishedAt: NOW,
});

const GREETING_LESSON: Lesson = {
  id: 'chao-hoi',
  type: 'lesson',
  title: 'Chào hỏi',
  exercises: [
    { id: 'e1', kind: 'tone-choice', wordId: '你好' },
    { id: 'e2', kind: 'pinyin-type', wordId: '谢谢' },
  ],
};

const keysOf = (cards: readonly ReviewCard[]): string[] =>
  cards.map((card) => `${card.wordId}:${card.facet}:${card.state}`).sort();

describe('SrsService — Phần 3: createCardsForFinishedLesson', () => {
  it('S9.1-AC1 Xong bài học thì tạo thẻ nghĩa và nghe: chưa có thẻ, xong bài 你好 + 谢谢 không bỏ câu → đúng 4 thẻ nghĩa/nghe "mới"', async () => {
    const { store, service } = openService();
    const session = finishedSession(['e1', 'e2']);

    await service.createCardsForFinishedLesson(GREETING_LESSON, session, NOW);

    const cards = await store.getAllCards();
    expect(keysOf(cards)).toEqual(
      [
        '你好:meaning:new',
        '你好:listening:new',
        '谢谢:meaning:new',
        '谢谢:listening:new',
      ].sort(),
    );
    for (const card of cards) {
      expect(reviewCardSchema.safeParse(card).success).toBe(true);
    }
  });
});
