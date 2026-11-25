/**
 * Nội dung mẫu e2e S9.1 (design D10, D12): re-export dữ liệu của
 * `e2e/fixtures/reviewCardsFixtures.ts` và validate bằng Zod lúc nạp module, để dữ liệu mẫu sai làm
 * e2e fail sớm.
 */
import {
  contentRootSchema,
  lessonSchema,
  wordSchema,
  type ContentRoot,
  type Lesson,
  type Word,
} from '@csk/shared';

import {
  REVIEW_CONTENT_ROOT as FIXTURE_CONTENT_ROOT,
  REVIEW_LESSONS as FIXTURE_LESSONS,
  withExtraWords as fixtureWithExtraWords,
} from '../fixtures/reviewCardsFixtures';

export {
  NO_STROKE_CHARACTER,
  REVIEW_CARDS_FIXTURE,
  REVIEW_LESSON_IDS,
  REVIEW_LESSON_TITLES,
  REVIEW_UNIT_TITLES,
  SENTENCE_ID,
  UNKNOWN_CHARACTER,
  UNKNOWN_WORD_ID,
} from '../fixtures/reviewCardsFixtures';
export type { ReviewLessonKey } from '../fixtures/reviewCardsFixtures';

/** Mọi bài mẫu, đã validate bằng Zod. */
export const REVIEW_LESSONS: readonly Lesson[] = lessonSchema
  .array()
  .parse(FIXTURE_LESSONS);

/** Lộ trình mẫu, đã validate bằng Zod. */
export const REVIEW_CONTENT_ROOT: ContentRoot =
  contentRootSchema.parse(FIXTURE_CONTENT_ROOT);

export const findReviewLesson = (lessonId: string): Lesson | undefined =>
  REVIEW_LESSONS.find((item) => item.id === lessonId);

/** `words.json` phục vụ trong test (từ thật + từ thêm), đã validate bằng Zod. */
export const withExtraWords = (realWords: readonly Word[]): Word[] =>
  wordSchema.array().parse(fixtureWithExtraWords(realWords));
