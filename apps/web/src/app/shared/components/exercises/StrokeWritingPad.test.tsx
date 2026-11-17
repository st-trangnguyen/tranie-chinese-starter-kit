import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  StrokeAttemptResult,
  WritingPracticeState,
} from '@shared/models/writing-practice.model';
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

/** Trạng thái sai 3 lần liên tiếp ở nét 0 của 十, gợi ý đang hiện ở nét 0. */
const practiceWithHintAtFirstStroke = (): WritingPracticeState =>
  [1, 2, 3].reduce(
    (state) => practiceService.recordStrokeAttempt(state, 'mistake'),
    practiceService.startPractice(STROKE_DATA_SHI.strokes.length),
  );

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

  it('S6.2-AC1: Khung viết nhận focus bàn phím', async () => {
    const onStrokeAttempt = vi.fn<(result: StrokeAttemptResult) => void>();
    const { user } = renderWithProviders(
      <StrokeWritingPad
        character="十"
        strokeData={STROKE_DATA_SHI}
        practice={practiceService.startPractice(STROKE_DATA_SHI.strokes.length)}
        onStrokeAttempt={onStrokeAttempt}
      />,
    );
    await flushQuizStart();

    // Tab đưa focus vào khung viết; tên đọc được nêu chữ đang viết.
    await user.tab();
    const figure = screen.getByRole('figure', { name: /十/ });
    expect(figure).toHaveFocus();

    // Viết không cần bàn phím: phím chữ, số, Space, Enter, mũi tên không làm gì.
    const writer = FakeHanziWriter.last();
    const callCountBefore = writer.calls.length;
    await user.keyboard(
      'a5 {Enter}{ArrowUp}{ArrowDown}{ArrowLeft}{ArrowRight}',
    );

    expect(figure).toHaveFocus();
    expect(FakeHanziWriter.instances).toHaveLength(1);
    expect(writer.calls).toHaveLength(callCountBefore);
    expect(writer.isQuizActive).toBe(true);
    expect(onStrokeAttempt).not.toHaveBeenCalled();
    expect(figure).toHaveAttribute('data-completed-stroke-count', '0');
    expect(figure.querySelector('.writing-pad-hint')).toBeNull();
  });

  it.each([
    { isReducedMotion: true, label: 'bật giảm chuyển động' },
    { isReducedMotion: false, label: 'không giảm chuyển động' },
  ])(
    'S6.2-AC3: Gợi ý không phụ thuộc chuyển động ($label)',
    async ({ isReducedMotion }) => {
      stubReducedMotion(isReducedMotion);
      const practice = practiceWithHintAtFirstStroke();
      expect(practice.isHintVisible).toBe(true);

      renderWithProviders(
        <StrokeWritingPad
          character="十"
          strokeData={STROKE_DATA_SHI}
          practice={practice}
          onStrokeAttempt={vi.fn<(result: StrokeAttemptResult) => void>()}
        />,
      );
      await flushQuizStart();

      const figure = screen.getByRole('figure', { name: 'Khung viết chữ 十' });
      expect(figure).toHaveAttribute('data-hint-stroke-index', '0');

      // Đúng một nét gợi ý: nét hiện tại (nét 0 của 十).
      const hintPaths = [
        ...figure.querySelectorAll<SVGPathElement>('.writing-pad-hint path'),
      ];
      expect(hintPaths.map((path) => path.getAttribute('d'))).toEqual([
        STROKE_DATA_SHI.strokes[0],
      ]);

      // Gợi ý tĩnh: không có phần tử animation SVG trong lớp gợi ý.
      const hintLayer = figure.querySelector('.writing-pad-hint');
      expect(hintLayer).not.toBeNull();
      expect(
        hintLayer?.querySelectorAll('animate, animateTransform'),
      ).toHaveLength(0);

      // Phân biệt với nét mờ cả chữ: lớp gợi ý không nằm trong nhóm nét mờ.
      expect(hintLayer?.closest('.stroke-order-outline')).toBeNull();
    },
  );
});
