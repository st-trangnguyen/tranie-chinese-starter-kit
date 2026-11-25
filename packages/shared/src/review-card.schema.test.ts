import { describe, expect, it } from 'vitest';

import {
  reviewCardId,
  reviewCardSchema,
  writtenCharacterSchema,
} from './review-card.schema';

const DUE = Date.UTC(2026, 10, 25, 8, 0, 0);

const NEW_CARD = {
  wordId: '你好',
  facet: 'meaning',
  state: 'new',
  due: DUE,
  stability: 0,
  difficulty: 0,
  elapsedDays: 0,
  scheduledDays: 0,
  learningSteps: 0,
  reps: 0,
  lapses: 0,
};

const REVIEWED_CARD = {
  ...NEW_CARD,
  facet: 'listening',
  state: 'review',
  stability: 3.17,
  difficulty: 5.28,
  elapsedDays: 1,
  scheduledDays: 3,
  reps: 2,
  lastReview: DUE - 86_400_000,
};

function withoutStability(card: typeof NEW_CARD): Partial<typeof NEW_CARD> {
  return Object.fromEntries(
    Object.entries(card).filter(([key]) => key !== 'stability'),
  );
}

describe('reviewCardSchema', () => {
  it('S9.1-AC1 Xong bài học thì tạo thẻ nghĩa và nghe: nhận thẻ mới và thẻ đã ôn, từ chối thẻ sai', () => {
    expect(reviewCardSchema.safeParse(NEW_CARD).success).toBe(true);
    expect(reviewCardSchema.parse(REVIEWED_CARD)).toEqual(REVIEWED_CARD);

    expect(
      reviewCardSchema.safeParse({ ...NEW_CARD, facet: 'speaking' }).success,
    ).toBe(false);
    expect(
      reviewCardSchema.safeParse({ ...NEW_CARD, state: 'mới' }).success,
    ).toBe(false);
    expect(reviewCardSchema.safeParse(withoutStability(NEW_CARD)).success).toBe(
      false,
    );
    expect(reviewCardSchema.safeParse({ ...NEW_CARD, due: -1 }).success).toBe(
      false,
    );
    expect(reviewCardSchema.safeParse({ ...NEW_CARD, reps: 1.5 }).success).toBe(
      false,
    );
  });
});

describe('reviewCardId', () => {
  it('S9.1-AC1 Xong bài học thì tạo thẻ nghĩa và nghe: khóa thẻ là từ + chiều', () => {
    expect(reviewCardId('你好', 'meaning')).toBe('你好:meaning');
    expect(reviewCardId('你好', 'listening')).toBe('你好:listening');
  });
});

describe('writtenCharacterSchema', () => {
  it('S9.1-AC1 Xong bài học thì tạo thẻ nghĩa và nghe: chỉ nhận đúng một chữ Hán', () => {
    expect(writtenCharacterSchema.safeParse({ character: '人' }).success).toBe(
      true,
    );
    expect(
      writtenCharacterSchema.safeParse({ character: '你好' }).success,
    ).toBe(false);
    expect(writtenCharacterSchema.safeParse({ character: 'a' }).success).toBe(
      false,
    );
  });
});
