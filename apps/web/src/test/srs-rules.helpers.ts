import type { ReviewCard, Word } from '@csk/shared';

import type {
  LessonCardPlanInput,
  WritingCardPlanInput,
} from '@shared/models/review-card.model';
import { makeWord } from '@test/content-service.fixtures';

/**
 * Helper dùng chung cho test quy tắc tạo thẻ ôn tập (S9.1, `SrsService` Phần 2):
 * `srs.service.rules.test.ts` và `srs.service.writing-rules.test.ts`.
 */

export const NOW = Date.UTC(2026, 10, 25, 8, 30);

export const wordOf = (hanzi: string): Word => ({ ...makeWord(hanzi), hanzi });

export const lessonInput = (
  wordIds: readonly string[],
  overrides: Partial<LessonCardPlanInput> = {},
): LessonCardPlanInput => ({
  wordIds,
  wordsById: new Map(wordIds.map((id) => [id, wordOf(id)])),
  cards: [],
  writtenCharacters: new Set(),
  strokeCharacters: new Set(['人', '你', '好', '谢']),
  now: NOW,
  ...overrides,
});

export const writingInput = (
  character: string,
  overrides: Partial<WritingCardPlanInput> = {},
): WritingCardPlanInput => ({
  character,
  words: [wordOf('你好'), wordOf('人')],
  cards: [],
  writtenCharacters: new Set([character]),
  strokeCharacters: new Set(['人', '你', '好', '谢']),
  now: NOW,
  ...overrides,
});

export const keysOf = (cards: readonly ReviewCard[]): string[] =>
  cards.map((card) => `${card.wordId}:${card.facet}:${card.state}`).sort();
