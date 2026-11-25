import { describe, expect, it, vi } from 'vitest';

import { reviewCardSchema, type Lesson, type ReviewCard } from '@csk/shared';

import type { LessonSession } from '@shared/models/lesson-session.model';
import {
  finishedSession,
  GREETING_LESSON,
  keysOf,
  NOW,
  openService,
} from '@test/srs-lesson.helpers';

import { SrsService } from './srs.service';

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
  it('S9.1-AC1 Từ đã có thẻ từ bài khác: xong bài 你 rồi xong bài 你 + 好 → thêm thẻ nghĩa và nghe cho 好, vẫn một thẻ 你 mỗi chiều', async () => {
    const { store, service } = openService();
    const firstFinish = NOW - 24 * 60 * 60 * 1000;
    const youLesson: Lesson = {
      id: 'ban',
      type: 'lesson',
      title: 'Bạn',
      exercises: [{ id: 'y1', kind: 'tone-choice', wordId: '你' }],
    };
    const youGoodLesson: Lesson = {
      id: 'ban-tot',
      type: 'lesson',
      title: 'Bạn và tốt',
      exercises: [
        { id: 'g1', kind: 'tone-choice', wordId: '你' },
        { id: 'g2', kind: 'tone-choice', wordId: '好' },
      ],
    };

    await service.createCardsForFinishedLesson(
      youLesson,
      finishedSession(['y1']),
      firstFinish,
    );
    const youCardsBefore = await store.getAllCards();
    await service.createCardsForFinishedLesson(
      youGoodLesson,
      finishedSession(['g1', 'g2']),
      NOW,
    );

    const cards = await store.getAllCards();
    expect(keysOf(cards)).toEqual(
      [
        '你:meaning:new',
        '你:listening:new',
        '好:meaning:new',
        '好:listening:new',
      ].sort(),
    );
    const youCards = cards.filter((card) => card.wordId === '你');
    expect(youCards).toHaveLength(2);
    expect(youCards).toEqual(expect.arrayContaining(youCardsBefore));
  });

  it('S9.1-AC1 Không lưu được thẻ thì bài vẫn xong + Thẻ còn thiếu được tạo ở lần xong bài sau: lưu thẻ lỗi → báo lỗi rõ nghĩa giữ lỗi gốc, không thẻ 你好; làm lại hết bài, lưu được → có thẻ 你好 nghĩa và nghe', async () => {
    const { store, service } = openService();
    const storageError = new Error('QuotaExceededError');
    vi.spyOn(store, 'addNewCards').mockRejectedValueOnce(storageError);

    const failedFinish = service.createCardsForFinishedLesson(
      GREETING_LESSON,
      finishedSession(['e1', 'e2']),
      NOW,
    );

    await expect(failedFinish).rejects.toThrow(
      new Error('Không tạo được thẻ ôn tập.'),
    );
    await expect(failedFinish).rejects.toHaveProperty('cause', storageError);
    expect(
      (await store.getAllCards()).filter((card) => card.wordId === '你好'),
    ).toEqual([]);

    await service.createCardsForFinishedLesson(
      GREETING_LESSON,
      finishedSession(['e1', 'e2']),
      NOW + 60_000,
    );

    const greetingKeys = keysOf(
      (await store.getAllCards()).filter((card) => card.wordId === '你好'),
    );
    expect(greetingKeys).toEqual(
      ['你好:meaning:new', '你好:listening:new'].sort(),
    );
  });
});
