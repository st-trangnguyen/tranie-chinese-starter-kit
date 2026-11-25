import { createEmptyCard, State } from 'ts-fsrs';

import type { CardFacet, CardState, ReviewCard } from '@csk/shared';

import type { LessonCardPlanInput } from '@shared/models/review-card.model';

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

  // Rule: thẻ cho bài vừa xong: nghĩa + nghe cho mọi từ của bài.
  planLessonCards(input: LessonCardPlanInput): ReviewCard[] {
    return input.wordIds.flatMap((wordId) =>
      LESSON_FACETS.map((facet) =>
        this.createNewCard(wordId, facet, input.now),
      ),
    );
  }

  // ── PHẦN 3 — USE CASES ───────────────────────────────
}
