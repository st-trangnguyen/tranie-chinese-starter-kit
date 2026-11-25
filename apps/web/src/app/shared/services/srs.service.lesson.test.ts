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

  it.each([
    {
      name: 'làm hết nhưng bỏ qua 1 câu',
      session: {
        ...finishedSession(['e1', 'e2']),
        skippedCount: 1,
        correctCount: 1,
      },
    },
    {
      name: 'thoát khi chưa làm hết các câu',
      session: {
        ...finishedSession(['e1', 'e2']),
        currentIndex: 0,
        phase: 'answering',
        correctCount: 0,
        finishedAt: null,
      },
    },
  ] satisfies readonly { name: string; session: LessonSession }[])(
    'S9.1-AC1 Bài chưa xong không tạo thẻ: $name → không có thẻ mới, không nạp từ',
    async ({ session }) => {
      const { store, source, service } = openService();

      await service.createCardsForFinishedLesson(GREETING_LESSON, session, NOW);

      expect(await store.getAllCards()).toEqual([]);
      expect(source.getWords).not.toHaveBeenCalled();
    },
  );

  it('S9.1-AC1 Bài kiểm tra không tạo thẻ: làm hết bài kiểm tra, đúng mọi câu → không có thẻ mới, không nạp từ', async () => {
    const { store, source, service } = openService();
    const testLesson: Lesson = {
      ...GREETING_LESSON,
      id: 'kiem-tra',
      type: 'test',
    };

    await service.createCardsForFinishedLesson(
      testLesson,
      finishedSession(['e1', 'e2']),
      NOW,
    );

    expect(await store.getAllCards()).toEqual([]);
    expect(source.getWords).not.toHaveBeenCalled();
  });

  it('S9.1-AC1 Bài đã xong từ trước không được tạo bù thẻ: bài 你好 "Đã xong" chưa có thẻ, mở app và viết chữ → không thẻ; làm lại hết bài → có thẻ nghĩa và nghe', async () => {
    const { store, source } = openService();
    await store.saveLessonProgress({
      lessonId: GREETING_LESSON.id,
      status: 'completed',
    });

    // Mở app: tạo service mới trên DB đã có tiến độ; viết một chữ của 你好 trên khung có gợi ý.
    const service = new SrsService(store, source);
    await service.recordCharacterWriting(
      { character: '你', isGuided: true },
      NOW,
    );

    const cardsBefore = await store.getAllCards();
    expect(cardsBefore.filter((card) => card.wordId === '你好')).toEqual([]);

    await service.createCardsForFinishedLesson(
      GREETING_LESSON,
      finishedSession(['e1', 'e2']),
      NOW,
    );

    const greetingKeys = keysOf(
      (await store.getAllCards()).filter((card) => card.wordId === '你好'),
    );
    expect(greetingKeys).toEqual(
      ['你好:meaning:new', '你好:listening:new'].sort(),
    );
  });
  it('S9.1-AC1 Làm hết bài được đánh dấu xong nhờ kiểm tra vượt cấp thì tạo thẻ: bài 你好 và bài 人 "Đã xong" nhờ vượt cấp, làm hết bài 你好 → chỉ thẻ 你好 nghĩa và nghe "mới", không thẻ 人', async () => {
    const { store, service } = openService();
    const skipLevelGreeting: Lesson = {
      id: 'vuot-cap-1',
      type: 'lesson',
      title: 'Vượt cấp 1',
      exercises: [{ id: 'v1', kind: 'tone-choice', wordId: '你好' }],
    };
    const skipLevelPerson: Lesson = {
      id: 'vuot-cap-2',
      type: 'lesson',
      title: 'Vượt cấp 2',
      exercises: [{ id: 'v2', kind: 'tone-choice', wordId: '人' }],
    };
    for (const lesson of [skipLevelGreeting, skipLevelPerson]) {
      await store.saveLessonProgress({
        lessonId: lesson.id,
        status: 'completed',
      });
    }

    await service.createCardsForFinishedLesson(
      skipLevelGreeting,
      finishedSession(['v1']),
      NOW,
    );

    const cards = await store.getAllCards();
    expect(keysOf(cards)).toEqual(
      ['你好:meaning:new', '你好:listening:new'].sort(),
    );
    expect(cards.filter((card) => card.wordId === '人')).toEqual([]);
  });

  it('S9.1-AC1 Làm lại bài đã xong không tạo trùng thẻ: có 你好 nghĩa (đã ôn, "review") và nghe "mới", làm lại hết bài 你好 → vẫn một thẻ mỗi chiều, thẻ nghĩa giữ trạng thái và ngày ôn', async () => {
    const { store, service } = openService();
    const firstFinish = NOW - 7 * 24 * 60 * 60 * 1000;
    const reviewedMeaning: ReviewCard = {
      ...service.createNewCard('你好', 'meaning', firstFinish),
      state: 'review',
      due: Date.UTC(2026, 11, 2, 8, 0, 0),
      stability: 3.2,
      difficulty: 5.1,
      scheduledDays: 7,
      reps: 1,
      lastReview: NOW - 60 * 60 * 1000,
    };
    const firstListening = service.createNewCard(
      '你好',
      'listening',
      firstFinish,
    );
    await store.addNewCards([reviewedMeaning, firstListening]);
    const retakeLesson: Lesson = {
      id: 'chao-hoi-lam-lai',
      type: 'lesson',
      title: 'Chào hỏi (làm lại)',
      exercises: [{ id: 'r1', kind: 'tone-choice', wordId: '你好' }],
    };

    await service.createCardsForFinishedLesson(
      retakeLesson,
      finishedSession(['r1']),
      NOW,
    );

    const cards = await store.getAllCards();
    expect(keysOf(cards)).toEqual(
      ['你好:meaning:review', '你好:listening:new'].sort(),
    );
    expect(cards.find((card) => card.facet === 'meaning')).toStrictEqual(
      reviewedMeaning,
    );
    expect(cards.find((card) => card.facet === 'listening')).toStrictEqual(
      firstListening,
    );
  });
});
