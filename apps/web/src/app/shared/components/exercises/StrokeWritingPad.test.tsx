import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { StrokeAttemptResult } from '@shared/models/writing-practice.model';
import { WritingPracticeService } from '@shared/services/writing-practice.service';
import { act, renderWithProviders, screen } from '@test/render';
import { FakeHanziWriter } from '@test/mocks/hanzi-writer';
import { stubReducedMotion } from '@test/stroke-order-route';
import { STROKE_DATA_SHI } from '@test/stroke.fixtures';

import { StrokeWritingPad } from './StrokeWritingPad';

// Ranh giới ngoài: thư viện chấm nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

const practiceService = new WritingPracticeService();

/** Path của lớp chữ mờ nền, không tính path do writer vẽ trong host. */
const getOutlinePaths = (figure: HTMLElement): SVGPathElement[] =>
  [
    ...figure.querySelectorAll<SVGPathElement>('.stroke-order-outline path'),
  ].filter((path) => path.closest('.writing-pad-writer-host') === null);

/** Chờ effect tạo writer và quiz kích hoạt (microtask sau `quiz()`). */
const flushQuizStart = async (): Promise<void> => {
  await act(async () => {});
};

describe('StrokeWritingPad', () => {
  beforeEach(() => {
    FakeHanziWriter.reset();
    stubReducedMotion(false);
  });

  afterEach(() => {
    FakeHanziWriter.reset();
    vi.unstubAllGlobals();
  });

  it('S6.2-AC1: Hiện khung viết có nét mờ của cả chữ', async () => {
    const onStrokeAttempt = vi.fn<(result: StrokeAttemptResult) => void>();
    renderWithProviders(
      <StrokeWritingPad
        character="十"
        strokeData={STROKE_DATA_SHI}
        practice={practiceService.startPractice(STROKE_DATA_SHI.strokes.length)}
        onStrokeAttempt={onStrokeAttempt}
      />,
    );
    await flushQuizStart();

    const figure = screen.getByRole('figure', { name: 'Khung viết chữ 十' });
    expect(figure.tagName).toBe('FIGURE');

    // Đủ 2 nét mờ của cả chữ 十, đúng dữ liệu nét.
    const outlinePaths = getOutlinePaths(figure);
    expect(outlinePaths.map((path) => path.getAttribute('d'))).toEqual(
      STROKE_DATA_SHI.strokes,
    );

    // Chưa có nét nào được đánh dấu là đã viết, chưa có gợi ý.
    expect(figure).toHaveAttribute('data-completed-stroke-count', '0');
    expect(figure).not.toHaveAttribute('data-hint-stroke-index');
    expect(figure.querySelector('.writing-pad-hint')).toBeNull();

    // Writer chấm nét được tạo trên svg riêng trong host, cùng <svg> với lớp mờ, đứng sau nét mờ.
    const host = figure.querySelector('g.writing-pad-writer-host');
    expect(host).not.toBeNull();
    const lastOutlinePath = outlinePaths.at(-1);
    expect(host?.closest('svg')).toBe(lastOutlinePath?.closest('svg'));
    expect(
      lastOutlinePath && host
        ? lastOutlinePath.compareDocumentPosition(host) &
            Node.DOCUMENT_POSITION_FOLLOWING
        : 0,
    ).toBeTruthy();

    expect(FakeHanziWriter.instances).toHaveLength(1);
    const writer = FakeHanziWriter.last();
    expect(writer.character).toBe('十');
    expect(writer.target).toBeInstanceOf(SVGSVGElement);
    expect(writer.target.classList.contains('writing-pad-writer')).toBe(true);
    expect(writer.target.parentElement).toBe(host);
    expect(writer.isQuizActive).toBe(true);

    // Mở khung không phát kết quả chấm nào.
    expect(onStrokeAttempt).not.toHaveBeenCalled();
  });
});
