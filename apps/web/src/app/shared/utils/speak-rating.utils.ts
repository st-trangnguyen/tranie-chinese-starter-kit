export const SPEAK_RATINGS = ['not-yet', 'close', 'correct'] as const;

export type SpeakRating = (typeof SPEAK_RATINGS)[number];

// Rule: chỉ "correct" tính câu đúng; "close" và "not-yet" tính câu sai.
export const isRatingCorrect = (rating: SpeakRating): boolean =>
  rating === 'correct';
