import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { CardFacet, ReviewCard, Word } from '@csk/shared';
import { createDatabase } from '@core/helpers/db.helper';
import { progressStore } from '@core/services/progress-store.service';
import type { ExerciseResult } from '@shared/models/exercise.model';
import { mockContentFetch, wordOf } from '@test/mocks/content-fetch';
import { mockStrokeFetch } from '@test/mocks/stroke-fetch';
import { useLessonStrokeWrite } from './useLessonStrokeWrite';

const REN = '人';
/** Số nét của 人 trong file nét thật (`assets/content/strokes/人.json`). */
const REN_STROKE_COUNT = 2;

/** Xoá dữ liệu cũ trong IndexedDB thật (fake-indexeddb) của app: cả năm bảng. */
const clearDatabase = async (): Promise<void> => {
  const db = createDatabase();
  await db.settings.clear();
  await db.lessonProgress.clear();
  await db.dailyStats.clear();
  await db.cards.clear();
  await db.writtenCharacters.clear();
  db.close();
};

const WORDS: readonly Word[] = [
  { ...wordOf(REN), hanzi: REN, pinyin: 'rén', vi: ['người'] },
];

const newCardOf = (facet: CardFacet): ReviewCard => ({
  wordId: REN,
  facet,
  state: 'new',
  due: Date.UTC(2026, 10, 1),
  stability: 0,
  difficulty: 0,
  elapsedDays: 0,
  scheduledDays: 0,
  learningSteps: 0,
  reps: 0,
  lapses: 0,
});

/** Ranh giới ngoài: nội dung (`words.json`) và dữ liệu nét thật (`/content/strokes/...`). */
const mockContent = (): void => {
  const strokeFetch = mockStrokeFetch();
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    mockContentFetch((input) => strokeFetch.fetch(input), { words: WORDS }),
  );
};

const cardIdsOf = (cards: readonly ReviewCard[]): string[] =>
  cards.map((card) => `${card.wordId}:${card.facet}`).sort();

describe('useLessonStrokeWrite — thẻ ôn tập (S9.1)', () => {
  beforeEach(async () => {
    await clearDatabase();
    mockContent();
    // Người học đã làm xong bài học có từ 人: đã có thẻ nghĩa và nghe.
    await progressStore.addNewCards([
      newCardOf('meaning'),
      newCardOf('listening'),
    ]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderRen = (onResult: (result: ExerciseResult) => void) =>
    renderHook(() => useLessonStrokeWrite('e1', REN, onResult));

  const waitForPractice = async (
    result: ReturnType<typeof renderRen>['result'],
  ): Promise<void> => {
    await waitFor(() => expect(result.current?.practice).not.toBeNull());
  };

  it('S9.1-AC2 Viết xong ở câu viết trong bài cũng tính: should record 人 as written and create the 人 writing card when every stroke is written correctly', async () => {
    const onResult = vi.fn<(result: ExerciseResult) => void>();
    const { result } = renderRen(onResult);
    await waitForPractice(result);

    act(() => {
      for (let stroke = 0; stroke < REN_STROKE_COUNT; stroke += 1) {
        result.current?.recordStrokeAttempt('correct');
      }
    });

    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith({ isCorrect: true });
    await waitFor(async () => {
      expect(await progressStore.getWrittenCharacters()).toContain(REN);
      expect(cardIdsOf(await progressStore.getAllCards())).toContain(
        `${REN}:writing`,
      );
    });
    const writingCard = (await progressStore.getAllCards()).find(
      (card) => card.facet === 'writing',
    );
    expect(writingCard?.state).toBe('new');
  });

  it('S9.1-AC2 Viết xong ở câu viết trong bài cũng tính: should record nothing when 人 is written one stroke short', async () => {
    const onResult = vi.fn<(result: ExerciseResult) => void>();
    const { result, unmount } = renderRen(onResult);
    await waitForPractice(result);

    act(() => {
      for (let stroke = 0; stroke < REN_STROKE_COUNT - 1; stroke += 1) {
        result.current?.recordStrokeAttempt('correct');
      }
    });
    unmount();

    expect(onResult).not.toHaveBeenCalled();
    expect(await progressStore.getWrittenCharacters()).toEqual([]);
    expect(cardIdsOf(await progressStore.getAllCards())).toEqual([
      `${REN}:listening`,
      `${REN}:meaning`,
    ]);
  });
});
