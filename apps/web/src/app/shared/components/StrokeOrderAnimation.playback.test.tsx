import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { act, renderWithProviders, screen } from '@test/render';
import { FakeHanziWriter } from '@test/mocks/hanzi-writer';
import { STROKE_DATA_REN } from '@test/stroke.fixtures';

import { StrokeOrderAnimation } from './StrokeOrderAnimation';

// Ranh giới ngoài: thư viện vẽ nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

const waitALittle = async (): Promise<void> => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
};

describe('StrokeOrderAnimation — lượt phát', () => {
  beforeEach(() => {
    FakeHanziWriter.reset();
  });

  afterEach(() => {
    FakeHanziWriter.reset();
  });

  it('S6.1-AC1: Animation chỉ tự phát một lần', async () => {
    const { rerender } = renderWithProviders(
      <StrokeOrderAnimation character="人" strokeData={STROKE_DATA_REN} />,
    );

    const figure = screen.getByRole('img', { name: 'Thứ tự nét chữ 人' });
    await vi.waitFor(() => {
      expect(FakeHanziWriter.last().pendingStrokes).toEqual([0]);
    });
    const writer = FakeHanziWriter.last();

    // Phát xong cả 2 nét của 人.
    for (let drawn = 1; drawn <= STROKE_DATA_REN.strokes.length; drawn += 1) {
      await act(async () => {
        writer.finishStroke();
      });
      await vi.waitFor(() => {
        expect(figure).toHaveAttribute(
          'data-drawn-stroke-count',
          String(drawn),
        );
      });
    }
    const instanceCount = FakeHanziWriter.instances.length;

    // Người học không bấm gì: chờ thêm, rồi component render lại với cùng props.
    await waitALittle();
    rerender(
      <StrokeOrderAnimation character="人" strokeData={STROKE_DATA_REN} />,
    );
    await waitALittle();

    // Không có lượt phát mới: không tạo writer mới, không yêu cầu vẽ thêm nét nào.
    expect(FakeHanziWriter.instances).toHaveLength(instanceCount);
    expect(FakeHanziWriter.last()).toBe(writer);
    expect(writer.requestedStrokes).toEqual([0, 1]);
    expect(writer.pendingStrokes).toEqual([]);

    // Chữ giữ nguyên đủ 2 nét đã vẽ.
    const currentFigure = screen.getByRole('img', {
      name: 'Thứ tự nét chữ 人',
    });
    expect(currentFigure).toHaveAttribute('data-drawn-stroke-count', '2');
  });

  it('S6.1-AC2: Có nút Phát lại bấm được', async () => {
    renderWithProviders(
      <StrokeOrderAnimation character="人" strokeData={STROKE_DATA_REN} />,
    );

    const figure = screen.getByRole('img', { name: 'Thứ tự nét chữ 人' });
    await vi.waitFor(() => {
      expect(FakeHanziWriter.last().pendingStrokes).toEqual([0]);
    });
    const writer = FakeHanziWriter.last();

    // Đang phát: nét đầu tiên đang vẽ, nút đã có và bấm được.
    const replayWhilePlaying = screen.getByRole('button', { name: 'Phát lại' });
    expect(replayWhilePlaying).toBeEnabled();

    // Phát xong cả 2 nét của 人.
    for (let drawn = 1; drawn <= STROKE_DATA_REN.strokes.length; drawn += 1) {
      await act(async () => {
        writer.finishStroke();
      });
      await vi.waitFor(() => {
        expect(figure).toHaveAttribute(
          'data-drawn-stroke-count',
          String(drawn),
        );
      });
    }

    // Sau khi phát xong: nút vẫn còn và bấm được.
    const replayAfterDone = screen.getByRole('button', { name: 'Phát lại' });
    expect(replayAfterDone).toBeEnabled();
  });
});
