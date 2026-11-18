import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ExerciseResult } from '@shared/models/exercise.model';
import { mockStrokeFetch } from '@test/mocks/stroke-fetch';
import { useLessonStrokeWrite } from './useLessonStrokeWrite';

const TEN = '十';

interface HookProps {
  exerciseId: string;
}

describe('useLessonStrokeWrite', () => {
  // Ranh giới ngoài: fetch file nét thật do content:build sinh.
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(mockStrokeFetch().fetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderTen = (onResult: (result: ExerciseResult) => void) =>
    renderHook(
      ({ exerciseId }: HookProps) =>
        useLessonStrokeWrite(exerciseId, TEN, onResult),
      { initialProps: { exerciseId: 'e3' } },
    );

  const waitForPractice = async (
    result: ReturnType<typeof renderTen>['result'],
  ): Promise<void> => {
    await waitFor(() => expect(result.current?.practice).not.toBeNull());
  };

  it('S7.1-AC1 Viết xong chữ thì câu được tính đúng: should call onResult exactly once with { isCorrect: true } when both strokes of 十 are written correctly within the same act', async () => {
    const onResult = vi.fn<(result: ExerciseResult) => void>();
    const { result } = renderTen(onResult);
    await waitForPractice(result);

    act(() => {
      result.current?.recordStrokeAttempt('correct');
      result.current?.recordStrokeAttempt('correct');
    });

    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith({ isCorrect: true });
    expect(result.current?.practice?.isComplete).toBe(true);
  });

  it('S7.1-AC1 Viết xong chữ thì câu được tính đúng: should not call onResult again when more correct or mistake strokes arrive after 十 is complete', async () => {
    const onResult = vi.fn<(result: ExerciseResult) => void>();
    const { result } = renderTen(onResult);
    await waitForPractice(result);

    act(() => {
      result.current?.recordStrokeAttempt('correct');
      result.current?.recordStrokeAttempt('correct');
    });
    act(() => {
      result.current?.recordStrokeAttempt('correct');
      result.current?.recordStrokeAttempt('mistake');
    });

    expect(onResult).toHaveBeenCalledTimes(1);
  });

  it('S7.1-AC1 Viết xong chữ thì câu được tính đúng: should keep the same recordStrokeAttempt reference across rerenders', async () => {
    const onResult = vi.fn<(result: ExerciseResult) => void>();
    const { result, rerender } = renderTen(onResult);
    await waitForPractice(result);
    const first = result.current?.recordStrokeAttempt;

    act(() => result.current?.recordStrokeAttempt('correct'));
    rerender({ exerciseId: 'e3' });

    expect(first).toBeDefined();
    expect(result.current?.recordStrokeAttempt).toBe(first);
  });

  it('S7.1-AC1 Viết xong chữ thì câu được tính đúng: should reload and restart practice at 0 completed strokes when switching to another exercise with the same character 十', async () => {
    const onResult = vi.fn<(result: ExerciseResult) => void>();
    const { result, rerender } = renderTen(onResult);
    await waitForPractice(result);
    act(() => {
      result.current?.recordStrokeAttempt('correct');
      result.current?.recordStrokeAttempt('correct');
    });

    rerender({ exerciseId: 'e4' });

    expect(result.current?.exerciseId).toBe('e4');
    await waitForPractice(result);
    expect(result.current?.practice?.completedStrokeCount).toBe(0);
    expect(result.current?.practice?.isComplete).toBe(false);
  });
});
