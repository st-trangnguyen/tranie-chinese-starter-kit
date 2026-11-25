import { createEmptyCard, State } from 'ts-fsrs';

import {
  hanCharacterSchema,
  type CardFacet,
  type CardState,
  type Exercise,
  type ReviewCard,
  type Word,
} from '@csk/shared';

import type {
  LessonCardPlanInput,
  WritingCardPlanInput,
} from '@shared/models/review-card.model';

/** Trạng thái số của `ts-fsrs` → chuỗi lưu trong `ReviewCard`. */
const CARD_STATE_BY_FSRS_STATE: Record<State, CardState> = {
  [State.New]: 'new',
  [State.Learning]: 'learning',
  [State.Review]: 'review',
  [State.Relearning]: 'relearning',
};

/** Chiều luôn được tạo khi xong bài (chiều viết có điều kiện riêng). */
const LESSON_FACETS: readonly CardFacet[] = ['meaning', 'listening'];

export class SrsService {
  // ── PHẦN 1 — TRUY CẬP DỮ LIỆU ─────────────────────────

  // ── PHẦN 2 — QUY TẮC NGHIỆP VỤ ───────────────────────

  // Rule: từ của bài được tạo thẻ (bảng "Từ nào của bài được tạo thẻ").
  collectLessonWordIds(exercises: readonly Exercise[]): string[] {
    const wordIds = exercises.flatMap((exercise) => {
      if (exercise.kind === 'sound-pair') {
        return [...exercise.wordIds];
      }
      return exercise.wordId === undefined ? [] : [exercise.wordId];
    });
    return [...new Set(wordIds)];
  }

  // Rule: chữ Hán của một từ, giữ thứ tự, bỏ trùng; ký tự không phải chữ Hán bị bỏ.
  charactersOf(hanzi: string): string[] {
    const characters = Array.from(hanzi).filter(
      (character) => hanCharacterSchema.safeParse(character).success,
    );
    return [...new Set(characters)];
  }

  // Rule: từ được có thẻ chiều viết khi mọi chữ của từ có dữ liệu nét và đã viết xong.
  canHaveWritingCard(
    word: Word,
    writtenCharacters: ReadonlySet<string>,
    strokeCharacters: ReadonlySet<string>,
  ): boolean {
    const characters = this.charactersOf(word.hanzi);
    return (
      characters.length > 0 &&
      characters.every(
        (character) =>
          strokeCharacters.has(character) && writtenCharacters.has(character),
      )
    );
  }

  // Rule: thẻ "mới" của một chiều của từ, đến hạn ngay lúc tạo, chưa ôn (không có lastReview).
  createNewCard(wordId: string, facet: CardFacet, now: number): ReviewCard {
    const card = createEmptyCard(new Date(now));
    return {
      wordId,
      facet,
      state: CARD_STATE_BY_FSRS_STATE[card.state],
      due: card.due.getTime(),
      stability: card.stability,
      difficulty: card.difficulty,
      elapsedDays: 0,
      scheduledDays: card.scheduled_days,
      learningSteps: card.learning_steps,
      reps: card.reps,
      lapses: card.lapses,
    };
  }

  // Rule: thẻ cho bài vừa xong: nghĩa + nghe cho mọi từ của bài; viết cho từ có trong nội dung
  // và đủ điều kiện chiều viết.
  planLessonCards(input: LessonCardPlanInput): ReviewCard[] {
    return input.wordIds.flatMap((wordId) => {
      const word = input.wordsById.get(wordId);
      const isWritingAllowed =
        word !== undefined &&
        this.canHaveWritingCard(
          word,
          input.writtenCharacters,
          input.strokeCharacters,
        );
      const facets: readonly CardFacet[] = isWritingAllowed
        ? [...LESSON_FACETS, 'writing']
        : LESSON_FACETS;
      return facets.map((facet) =>
        this.createNewCard(wordId, facet, input.now),
      );
    });
  }

  // Rule: (skeleton) từ đã học xong cho thẻ chiều viết.
  isWordLearned(
    wordId: string,
    cards: readonly ReviewCard[],
    completingWordIds: ReadonlySet<string>,
  ): boolean {
    void [wordId, cards, completingWordIds];
    return false;
  }

  // Rule: (skeleton) thẻ chiều viết còn thiếu sau một lần viết.
  planWritingCards(input: WritingCardPlanInput): ReviewCard[] {
    void input;
    return [];
  }

  // ── PHẦN 3 — USE CASES ───────────────────────────────
}
