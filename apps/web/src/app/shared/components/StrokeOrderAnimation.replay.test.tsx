import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { act, renderWithProviders, screen } from '@test/render';
import { FakeHanziWriter } from '@test/mocks/hanzi-writer';
import { STROKE_DATA_HAO, STROKE_DATA_REN } from '@test/stroke.fixtures';

import { StrokeOrderAnimation } from './StrokeOrderAnimation';

// Ranh giới ngoài: thư viện vẽ nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

const HAO_STROKE_COUNT = STROKE_DATA_HAO.strokes.length;
const ALL_HAO_STROKES = STROKE_DATA_HAO.strokes.map((_, index) => index);
const REN_STROKE_COUNT = STROKE_DATA_REN.strokes.length;
const ALL_REN_STROKES = STROKE_DATA_REN.strokes.map((_, index) => index);
const REPLAY_TIMES = 3;

/** Các nét được yêu cầu vẽ kể từ mốc `before` (writer cũ dùng lại, hoặc writer mới). */
const strokesRequestedSince = (
  previous: FakeHanziWriter,
  before: number,
): number[] => {
  const current = FakeHanziWriter.last();
  const offset = current === previous ? before : 0;
  return current.requestedStrokes.slice(offset);
};

const waitALittle = async (): Promise<void> => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
};

/** Cho từng nét đang vẽ xong, từ nét `from` tới hết `to` nét, chờ số nét đã vẽ tăng theo. */
const playStrokes = async (
  writer: FakeHanziWriter,
  figure: HTMLElement,
  from: number,
  to: number,
): Promise<void> => {
  for (let drawn = from + 1; drawn <= to; drawn += 1) {
    await vi.waitFor(() => {
      expect(writer.pendingStrokes).toEqual([drawn - 1]);
    });
    await act(async () => {
      writer.finishStroke();
    });
    await vi.waitFor(() => {
      expect(figure).toHaveAttribute('data-drawn-stroke-count', String(drawn));
    });
  }
};

/** Mở 好, phát tới nét thứ 3: đã xong 2 nét, nét chỉ số 2 đang vẽ. */
const renderHaoAtThirdStroke = async () => {
  const rendered = renderWithProviders(
    <StrokeOrderAnimation character="好" strokeData={STROKE_DATA_HAO} />,
  );
  const figure = screen.getByRole('img', { name: 'Thứ tự nét chữ 好' });
  await vi.waitFor(() => {
    expect(FakeHanziWriter.last().pendingStrokes).toEqual([0]);
  });
  const writer = FakeHanziWriter.last();
  await playStrokes(writer, figure, 0, 2);
  await vi.waitFor(() => {
    expect(writer.pendingStrokes).toEqual([2]);
  });
  return { ...rendered, figure, writer };
};

describe('StrokeOrderAnimation — phát lại khi đang phát', () => {
  beforeEach(() => {
    FakeHanziWriter.reset();
  });

  afterEach(() => {
    FakeHanziWriter.reset();
  });

  it('S6.1-AC2: Phát lại khi đang phát — huỷ nét đang vẽ, vẽ lại từ nét đầu đủ 6 nét', async () => {
    const { user, figure, writer } = await renderHaoAtThirdStroke();
    const requestedBefore = writer.requestedStrokes.length;

    await user.click(screen.getByRole('button', { name: 'Phát lại' }));

    // Ngay sau khi bấm: không còn nét nào của lượt trước.
    expect(figure).toHaveAttribute('data-drawn-stroke-count', '0');

    // Nét đang vẽ của lượt cũ bị huỷ; lượt mới chỉ đang vẽ nét đầu tiên.
    await vi.waitFor(() => {
      expect(strokesRequestedSince(writer, requestedBefore)).toEqual([0]);
    });
    expect(writer.pendingStrokes).not.toContain(2);
    const replayWriter = FakeHanziWriter.last();
    expect(replayWriter.pendingStrokes).toEqual([0]);

    await playStrokes(replayWriter, figure, 0, HAO_STROKE_COUNT);

    await waitALittle();
    expect(strokesRequestedSince(writer, requestedBefore)).toEqual(
      ALL_HAO_STROKES,
    );
    expect(replayWriter.pendingStrokes).toEqual([]);
    expect(figure).toHaveAttribute(
      'data-drawn-stroke-count',
      String(HAO_STROKE_COUNT),
    );
  });

  it('S6.1-AC2: Phát lại khi đang phát — nét cũ kết thúc muộn không làm tăng số nét', async () => {
    const { user, figure, writer } = await renderHaoAtThirdStroke();
    const requestedBefore = writer.requestedStrokes.length;

    // Mô phỏng nét cũ không bị huỷ kịp, còn kết thúc muộn sau khi lượt mới đã bắt đầu.
    FakeHanziWriter.cancelPendingOnHide = false;
    await user.click(screen.getByRole('button', { name: 'Phát lại' }));

    expect(figure).toHaveAttribute('data-drawn-stroke-count', '0');
    await vi.waitFor(() => {
      expect(strokesRequestedSince(writer, requestedBefore)).toEqual([0]);
    });

    // Nét chỉ số 2 của lượt cũ giờ mới xong: số nét của lượt mới không đổi theo.
    expect(writer.pendingStrokes[0]).toBe(2);
    await act(async () => {
      writer.finishStroke();
    });
    await waitALittle();
    expect(figure).toHaveAttribute('data-drawn-stroke-count', '0');

    // Lượt mới vẽ từ nét 0, xong có đúng 6 nét, không nét thừa.
    const replayWriter = FakeHanziWriter.last();
    await playStrokes(replayWriter, figure, 0, HAO_STROKE_COUNT);

    await waitALittle();
    expect(strokesRequestedSince(writer, requestedBefore)).toEqual(
      ALL_HAO_STROKES,
    );
    expect(replayWriter.pendingStrokes).toEqual([]);
    expect(figure).toHaveAttribute(
      'data-drawn-stroke-count',
      String(HAO_STROKE_COUNT),
    );
  });
});

describe('StrokeOrderAnimation — phát lại nhiều lần', () => {
  beforeEach(() => {
    FakeHanziWriter.reset();
  });

  afterEach(() => {
    FakeHanziWriter.reset();
  });

  it('S6.1-AC2: Phát lại nhiều lần — 3 lần bấm trên 人, mỗi lần vẽ đủ 2 nét theo thứ tự', async () => {
    const { user } = renderWithProviders(
      <StrokeOrderAnimation character="人" strokeData={STROKE_DATA_REN} />,
    );
    const figure = screen.getByRole('img', { name: 'Thứ tự nét chữ 人' });
    await vi.waitFor(() => {
      expect(FakeHanziWriter.last().pendingStrokes).toEqual([0]);
    });
    await playStrokes(FakeHanziWriter.last(), figure, 0, REN_STROKE_COUNT);
    await waitALittle();

    for (let round = 1; round <= REPLAY_TIMES; round += 1) {
      const writer = FakeHanziWriter.last();
      const requestedBefore = writer.requestedStrokes.length;

      await user.click(screen.getByRole('button', { name: 'Phát lại' }));

      // Ngay sau mỗi lần bấm: bắt đầu lại từ 0 nét.
      expect(figure).toHaveAttribute('data-drawn-stroke-count', '0');
      await vi.waitFor(() => {
        expect(strokesRequestedSince(writer, requestedBefore)).toEqual([0]);
      });

      const replayWriter = FakeHanziWriter.last();
      await playStrokes(replayWriter, figure, 0, REN_STROKE_COUNT);

      // Lượt này yêu cầu đúng nét 0 rồi nét 1, không nét thừa, xong có 2 nét.
      await waitALittle();
      expect(strokesRequestedSince(writer, requestedBefore)).toEqual(
        ALL_REN_STROKES,
      );
      expect(replayWriter.pendingStrokes).toEqual([]);
      expect(figure).toHaveAttribute(
        'data-drawn-stroke-count',
        String(REN_STROKE_COUNT),
      );
    }
  });
});
