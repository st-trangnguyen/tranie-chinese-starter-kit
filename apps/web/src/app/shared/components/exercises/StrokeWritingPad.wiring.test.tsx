import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { StrokeAttemptResult } from '@shared/models/writing-practice.model';
import { WritingPracticeService } from '@shared/services/writing-practice.service';
import { act, renderWithProviders, screen } from '@test/render';
import { FakeHanziWriter } from '@test/mocks/hanzi-writer';
import { stubReducedMotion } from '@test/stroke-order-route';
import { countCalls } from '@test/stroke-quiz.helpers';
import { STROKE_DATA_SHI } from '@test/stroke.fixtures';

import { StrokeWritingPad } from './StrokeWritingPad';

// Ranh giới ngoài: thư viện chấm nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

const practiceService = new WritingPracticeService();
const STROKE_COUNT = STROKE_DATA_SHI.strokes.length;

/** Chờ effect tạo writer và quiz kích hoạt (microtask sau `quiz()`). */
const flushQuizStart = async (): Promise<void> => {
  await act(async () => {});
};

const createOnStrokeAttempt = () =>
  vi.fn<(result: StrokeAttemptResult) => void>();

/** Nét quá ngắn (một chạm): dưới ngưỡng độ dài tối thiểu của nét. */
const TAP_POINTS = [
  { x: 500, y: 500 },
  { x: 502, y: 501 },
];

/** Nét dài sai hướng/vị trí: đủ dài để tính là lần sai. */
const LONG_POINTS = [
  { x: 100, y: 100 },
  { x: 100, y: 700 },
];

const getHost = (): Element => {
  const figure = screen.getByRole('figure', { name: 'Khung viết chữ 十' });
  const host = figure.querySelector('g.writing-pad-writer-host');
  if (!host) {
    throw new Error('Khung viết chưa có g.writing-pad-writer-host');
  }
  return host;
};

describe('StrokeWritingPad nối sự kiện quiz tới onStrokeAttempt', () => {
  beforeEach(() => {
    FakeHanziWriter.reset();
    stubReducedMotion(false);
  });

  afterEach(() => {
    FakeHanziWriter.reset();
    vi.unstubAllGlobals();
  });

  it('chuyển nét đúng, nét sai dài và nét quá ngắn thành correct, mistake, ignored', async () => {
    const onStrokeAttempt = createOnStrokeAttempt();
    renderWithProviders(
      <StrokeWritingPad
        character="十"
        strokeData={STROKE_DATA_SHI}
        practice={practiceService.startPractice(STROKE_COUNT)}
        onStrokeAttempt={onStrokeAttempt}
      />,
    );
    await flushQuizStart();
    const writer = FakeHanziWriter.last();

    act(() => writer.emitCorrectStroke());
    expect(onStrokeAttempt).toHaveBeenLastCalledWith('correct');

    act(() => writer.emitMistake({ points: LONG_POINTS }));
    expect(onStrokeAttempt).toHaveBeenLastCalledWith('mistake');

    act(() => writer.emitMistake({ points: TAP_POINTS }));
    expect(onStrokeAttempt).toHaveBeenLastCalledWith('ignored');

    expect(onStrokeAttempt.mock.calls).toEqual([
      ['correct'],
      ['mistake'],
      ['ignored'],
    ]);
  });

  it('re-render với onStrokeAttempt ổn định và practice mới không tạo writer mới', async () => {
    const onStrokeAttempt = createOnStrokeAttempt();
    const initial = practiceService.startPractice(STROKE_COUNT);
    const { rerender } = renderWithProviders(
      <StrokeWritingPad
        character="十"
        strokeData={STROKE_DATA_SHI}
        practice={initial}
        onStrokeAttempt={onStrokeAttempt}
      />,
    );
    await flushQuizStart();
    const writer = FakeHanziWriter.last();

    act(() => writer.emitCorrectStroke());
    rerender(
      <StrokeWritingPad
        character="十"
        strokeData={STROKE_DATA_SHI}
        practice={practiceService.recordStrokeAttempt(initial, 'correct')}
        onStrokeAttempt={onStrokeAttempt}
      />,
    );
    await flushQuizStart();

    expect(FakeHanziWriter.instances).toHaveLength(1);
    expect(countCalls(writer, 'cancelQuiz')).toBe(0);
    expect(writer.isQuizActive).toBe(true);
    expect(
      getHost().querySelectorAll(':scope > svg.writing-pad-writer'),
    ).toHaveLength(1);

    // Writer cũ vẫn nối tới callback sau re-render.
    act(() => writer.emitCorrectStroke());
    expect(onStrokeAttempt).toHaveBeenCalledTimes(2);
  });

  it('unmount gọi cancelQuiz và gỡ svg.writing-pad-writer khỏi host', async () => {
    const onStrokeAttempt = createOnStrokeAttempt();
    const { unmount } = renderWithProviders(
      <StrokeWritingPad
        character="十"
        strokeData={STROKE_DATA_SHI}
        practice={practiceService.startPractice(STROKE_COUNT)}
        onStrokeAttempt={onStrokeAttempt}
      />,
    );
    await flushQuizStart();
    const writer = FakeHanziWriter.last();
    const host = getHost();
    expect(writer.target.parentNode).toBe(host);

    unmount();

    expect(countCalls(writer, 'cancelQuiz')).toBeGreaterThanOrEqual(1);
    expect(writer.isQuizActive).toBe(false);
    expect(host.querySelector('svg.writing-pad-writer')).toBeNull();
    expect(writer.target.parentNode).toBeNull();

    // Sau unmount không còn kết quả chấm nào tới callback.
    writer.emitCorrectStroke();
    writer.emitMistake({ points: LONG_POINTS });
    expect(onStrokeAttempt).not.toHaveBeenCalled();
  });

  it('trong StrictMode mỗi sự kiện của writer hiện tại gọi onStrokeAttempt đúng một lần', async () => {
    const onStrokeAttempt = createOnStrokeAttempt();
    renderWithProviders(
      <StrictMode>
        <StrokeWritingPad
          character="十"
          strokeData={STROKE_DATA_SHI}
          practice={practiceService.startPractice(STROKE_COUNT)}
          onStrokeAttempt={onStrokeAttempt}
        />
      </StrictMode>,
    );
    await flushQuizStart();

    const host = getHost();
    const ownSvgs = host.querySelectorAll('svg.writing-pad-writer');
    expect(ownSvgs).toHaveLength(1);

    const writer = FakeHanziWriter.last();
    expect(writer.target).toBe(ownSvgs[0]);
    expect(writer.isQuizActive).toBe(true);

    // Writer bị StrictMode huỷ (nếu có) không còn phát sự kiện.
    FakeHanziWriter.instances
      .filter((instance) => instance !== writer)
      .forEach((stale) => {
        expect(stale.isQuizActive).toBe(false);
        stale.emitCorrectStroke();
        stale.emitMistake({ points: LONG_POINTS });
      });
    expect(onStrokeAttempt).not.toHaveBeenCalled();

    act(() => writer.emitCorrectStroke());
    expect(onStrokeAttempt.mock.calls).toEqual([['correct']]);

    act(() => writer.emitMistake({ points: LONG_POINTS }));
    expect(onStrokeAttempt.mock.calls).toEqual([['correct'], ['mistake']]);

    act(() => writer.emitMistake({ points: TAP_POINTS }));
    expect(onStrokeAttempt.mock.calls).toEqual([
      ['correct'],
      ['mistake'],
      ['ignored'],
    ]);
  });
});
