import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { act, renderWithProviders, screen } from '@test/render';
import { FakeHanziWriter } from '@test/mocks/hanzi-writer';
import {
  STROKE_DATA_BAI,
  STROKE_DATA_HAO,
  STROKE_DATA_REN,
} from '@test/stroke.fixtures';

import { StrokeOrderAnimation } from './StrokeOrderAnimation';

// Ranh giới ngoài: thư viện vẽ nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

/**
 * Các path của lớp chữ mờ nền (design D9/D10: class BEM `stroke-order-outline`), không tính nét
 * do writer vẽ trong `<g class="stroke-order-writer">`.
 */
const getOutlinePaths = (figure: HTMLElement): SVGPathElement[] => {
  const paths = figure.querySelectorAll<SVGPathElement>(
    '.stroke-order-outline path, path.stroke-order-outline',
  );
  return [...new Set(paths)].filter(
    (path) => path.closest('.stroke-order-writer') === null,
  );
};

const expectFullOutline = (figure: HTMLElement): void => {
  const outlinePaths = getOutlinePaths(figure);
  expect(outlinePaths).toHaveLength(STROKE_DATA_HAO.strokes.length);
  expect(outlinePaths.map((path) => path.getAttribute('d'))).toEqual(
    STROKE_DATA_HAO.strokes,
  );
};

describe('StrokeOrderAnimation', () => {
  beforeEach(() => {
    FakeHanziWriter.reset();
  });

  afterEach(() => {
    FakeHanziWriter.reset();
  });

  it('S6.1-AC1: Chữ hiện animation và tự phát khi mở', async () => {
    renderWithProviders(
      <StrokeOrderAnimation character="好" strokeData={STROKE_DATA_HAO} />,
    );

    const figure = screen.getByRole('img', { name: 'Thứ tự nét chữ 好' });
    expect(figure.tagName).toBe('FIGURE');
    expect(figure).toHaveAttribute('data-drawn-stroke-count', '0');

    // Tự phát: không bấm gì, nét đầu tiên (chỉ số 0) đã được yêu cầu vẽ.
    await vi.waitFor(() => {
      expect(FakeHanziWriter.last().requestedStrokes).toEqual([0]);
    });
    const writer = FakeHanziWriter.last();
    expect(writer.character).toBe('好');
    expect(writer.pendingStrokes).toEqual([0]);
    expect(figure).toHaveAttribute('data-drawn-stroke-count', '0');
  });

  it('S6.1-AC1: Chữ mờ nền hiện trong lúc vẽ', async () => {
    renderWithProviders(
      <StrokeOrderAnimation character="好" strokeData={STROKE_DATA_HAO} />,
    );

    const figure = screen.getByRole('img', { name: 'Thứ tự nét chữ 好' });

    // Ngay khi mở: đủ 6 path mờ của 好, nhưng chưa có nét nào được tính là đã vẽ.
    expectFullOutline(figure);
    expect(figure).toHaveAttribute('data-drawn-stroke-count', '0');

    // Đích vẽ của writer nằm trong cùng <svg> với lớp mờ và đứng sau mọi path mờ (vẽ đè lên).
    const writerTarget = figure.querySelector('g.stroke-order-writer');
    expect(writerTarget).not.toBeNull();
    const outlinePaths = getOutlinePaths(figure);
    const lastOutlinePath = outlinePaths.at(-1);
    expect(lastOutlinePath).toBeDefined();
    expect(writerTarget?.closest('svg')).toBe(lastOutlinePath?.closest('svg'));
    expect(
      lastOutlinePath && writerTarget
        ? lastOutlinePath.compareDocumentPosition(writerTarget) &
            Node.DOCUMENT_POSITION_FOLLOWING
        : 0,
    ).toBeTruthy();

    await vi.waitFor(() => {
      expect(FakeHanziWriter.last().pendingStrokes).toEqual([0]);
    });
    const writer = FakeHanziWriter.last();

    // Giữa chừng: xong nét đầu, lớp mờ vẫn đủ 6 path.
    await act(async () => {
      writer.finishStroke();
    });
    expectFullOutline(figure);

    // Cho các nét còn lại xong (vòng lặp tuần tự là task 7.6; ở đây chỉ chạy tiếp khi còn nét đang
    // vẽ). Số nét khi xong = 6 do Scenario "Mỗi lúc chỉ vẽ một nét" (7.5) kiểm.
    for (let step = 1; step < STROKE_DATA_HAO.strokes.length; step += 1) {
      if (writer.pendingStrokes.length === 0) {
        break;
      }
      await act(async () => {
        writer.finishStroke();
      });
      expectFullOutline(figure);
    }
    expectFullOutline(figure);
  });

  it('S6.1-AC1: Mỗi lúc chỉ vẽ một nét', async () => {
    renderWithProviders(
      <StrokeOrderAnimation character="好" strokeData={STROKE_DATA_HAO} />,
    );

    const figure = screen.getByRole('img', { name: 'Thứ tự nét chữ 好' });
    await vi.waitFor(() => {
      expect(FakeHanziWriter.last().pendingStrokes).toHaveLength(1);
    });
    const writer = FakeHanziWriter.last();
    expect(figure).toHaveAttribute('data-drawn-stroke-count', '0');

    const strokeCount = STROKE_DATA_HAO.strokes.length;
    for (let drawn = 1; drawn <= strokeCount; drawn += 1) {
      await act(async () => {
        writer.finishStroke();
      });

      // Mỗi bước chỉ tăng đúng một nét.
      await vi.waitFor(() => {
        expect(figure).toHaveAttribute(
          'data-drawn-stroke-count',
          String(drawn),
        );
      });
      // Không bao giờ có hai nét cùng đang vẽ; còn nét thì nét kế tiếp đang vẽ.
      expect(writer.pendingStrokes.length).toBeLessThanOrEqual(1);
      if (drawn < strokeCount) {
        await vi.waitFor(() => {
          expect(writer.pendingStrokes).toHaveLength(1);
        });
      }
    }

    expect(figure).toHaveAttribute(
      'data-drawn-stroke-count',
      String(strokeCount),
    );
    expect(writer.pendingStrokes).toEqual([]);
  });

  it('S6.1-AC1: Nét hiện đúng thứ tự viết', async () => {
    renderWithProviders(
      <StrokeOrderAnimation character="人" strokeData={STROKE_DATA_REN} />,
    );

    const figure = screen.getByRole('img', { name: 'Thứ tự nét chữ 人' });
    await vi.waitFor(() => {
      expect(FakeHanziWriter.last().pendingStrokes).toEqual([0]);
    });
    const writer = FakeHanziWriter.last();

    // Nét phẩy (0) đang vẽ: nét mác (1) chưa được yêu cầu.
    expect(writer.requestedStrokes).toEqual([0]);
    expect(figure).toHaveAttribute('data-drawn-stroke-count', '0');

    // Phẩy xong rồi mới tới mác.
    await act(async () => {
      writer.finishStroke();
    });
    await vi.waitFor(() => {
      expect(writer.requestedStrokes).toEqual([0, 1]);
    });
    expect(writer.pendingStrokes).toEqual([1]);
    expect(figure).toHaveAttribute('data-drawn-stroke-count', '1');

    await act(async () => {
      writer.finishStroke();
    });
    await vi.waitFor(() => {
      expect(figure).toHaveAttribute('data-drawn-stroke-count', '2');
    });
    expect(writer.requestedStrokes).toEqual([0, 1]);
    expect(writer.pendingStrokes).toEqual([]);
  });

  it('S6.1-AC1: Số nét được vẽ bằng số nét của chữ', async () => {
    renderWithProviders(
      <StrokeOrderAnimation character="白" strokeData={STROKE_DATA_BAI} />,
    );

    const figure = screen.getByRole('img', { name: 'Thứ tự nét chữ 白' });
    const strokeCount = STROKE_DATA_BAI.strokes.length;
    expect(strokeCount).toBe(5);

    await vi.waitFor(() => {
      expect(FakeHanziWriter.last().pendingStrokes).toEqual([0]);
    });
    const writer = FakeHanziWriter.last();

    // Phát hết: mỗi nét đang vẽ thì cho xong, tới khi không còn nét nào được yêu cầu.
    for (let drawn = 1; drawn <= strokeCount; drawn += 1) {
      await act(async () => {
        writer.finishStroke();
      });
      await vi.waitFor(() => {
        expect(figure).toHaveAttribute('data-drawn-stroke-count', String(drawn));
      });
    }

    // Chờ thêm: không có lần yêu cầu vẽ nét thứ 6 (chỉ số 5) nào xuất hiện sau đó.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(figure).toHaveAttribute('data-drawn-stroke-count', '5');
    expect(writer.requestedStrokes).toEqual([0, 1, 2, 3, 4]);
    expect(writer.requestedStrokes).not.toContain(5);
    expect(writer.pendingStrokes).toEqual([]);
  });
});
