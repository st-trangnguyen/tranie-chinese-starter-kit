import type { CardFacet, ReviewCard } from '@csk/shared';

import type { LessonCardPlanInput } from '@shared/models/review-card.model';

// Skeleton RED (tasks 4.1): chưa có hành vi.
const emptyCard = (wordId: string, facet: CardFacet): ReviewCard => ({
  wordId,
  facet,
  state: 'new',
  due: 0,
  stability: 0,
  difficulty: 0,
  elapsedDays: 0,
  scheduledDays: 0,
  learningSteps: 0,
  reps: 0,
  lapses: 0,
});

export class SrsService {
  // ── PHẦN 1 — TRUY CẬP DỮ LIỆU ─────────────────────────

  // ── PHẦN 2 — QUY TẮC NGHIỆP VỤ ───────────────────────

  // Rule: thẻ "mới" của một chiều của từ, đến hạn ngay lúc tạo.
  createNewCard(wordId: string, facet: CardFacet, now: number): ReviewCard {
    void now;
    return emptyCard(wordId, facet);
  }

  // Rule: thẻ còn thiếu cho bài vừa xong.
  planLessonCards(input: LessonCardPlanInput): ReviewCard[] {
    void input;
    return [];
  }

  // ── PHẦN 3 — USE CASES ───────────────────────────────
}
