import type { StrokeData } from '@csk/shared';
import { FakeHanziWriter } from '@test/mocks/hanzi-writer';
import { createStrokeWriter } from './stroke-writer.service';

// Ranh giới ngoài: thư viện vẽ nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

const SVG_NS = 'http://www.w3.org/2000/svg';

const STROKE_DATA_REN: StrokeData = {
  strokes: ['M 475 485 Q 547 653 563 683 Z', 'M 462 456 Q 480 423 575 292 Z'],
  medians: [
    [
      [553, 714],
      [70, 94],
    ],
    [
      [470, 470],
      [978, 91],
    ],
  ],
};

interface Stage {
  svg: SVGSVGElement;
  group: SVGGElement;
}

/** `<svg viewBox="0 0 1024 1024">` chứa một `<g>` rỗng làm đích vẽ, như `StrokeGlyph` (D9). */
function createStage(): Stage {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 1024 1024');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  const group = document.createElementNS(SVG_NS, 'g');
  svg.appendChild(group);
  document.body.appendChild(svg);
  return { svg, group };
}

function hideCharacterCalls(writer: FakeHanziWriter): readonly unknown[][] {
  return writer.calls
    .filter((call) => call.method === 'hideCharacter')
    .map((call) => [...call.args]);
}

describe('createStrokeWriter', () => {
  beforeEach(() => {
    FakeHanziWriter.reset();
    document.body.innerHTML = '';
  });

  it('S6.1-AC1: tạo writer trên đúng <g> đích, hộp 1024 không padding, ẩn chữ và viền', () => {
    const { group } = createStage();

    createStrokeWriter(group, '人', STROKE_DATA_REN);

    expect(FakeHanziWriter.instances).toHaveLength(1);
    const writer = FakeHanziWriter.last();
    expect(writer.target).toBe(group);
    expect(writer.character).toBe('人');
    expect(writer.options).toMatchObject({
      width: 1024,
      height: 1024,
      padding: 0,
      showCharacter: false,
      showOutline: false,
    });
  });

  it('S6.1-AC1: dữ liệu nét được đưa vào qua charDataLoader, không tự fetch', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { group } = createStage();

    createStrokeWriter(group, '人', STROKE_DATA_REN);

    const loader = FakeHanziWriter.last().options.charDataLoader;
    expect(loader).toBeTypeOf('function');
    const onLoad = vi.fn<(data: unknown) => void>();
    const onError = vi.fn<(error?: unknown) => void>();
    loader?.('人', onLoad, onError);

    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(onLoad.mock.calls[0]?.[0]).toMatchObject({
      strokes: STROKE_DATA_REN.strokes,
      medians: STROKE_DATA_REN.medians,
    });
    expect(onError).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('S6.1-AC1: animateStroke(i) vẽ đúng nét i và resolve "completed" khi nét xong', async () => {
    const { group } = createStage();
    const strokeWriter = createStrokeWriter(group, '人', STROKE_DATA_REN);
    const writer = FakeHanziWriter.last();

    let settled = false;
    const result = strokeWriter.animateStroke(1).then((value) => {
      settled = true;
      return value;
    });
    await Promise.resolve();

    expect(writer.pendingStrokes).toEqual([1]);
    expect(settled).toBe(false);

    writer.finishStroke();

    await expect(result).resolves.toBe('completed');
  });

  it('S6.1-AC1: animateStroke(i) resolve "cancelled" khi nét bị huỷ', async () => {
    const { group } = createStage();
    const strokeWriter = createStrokeWriter(group, '人', STROKE_DATA_REN);
    const writer = FakeHanziWriter.last();

    const result = strokeWriter.animateStroke(0);
    await Promise.resolve();
    expect(writer.pendingStrokes).toEqual([0]);

    // Huỷ chain đang chạy như bản thật: mọi nét đang vẽ nhận onComplete({ canceled: true }).
    writer.hideCharacter({ duration: 0 });

    await expect(result).resolves.toBe('cancelled');
  });

  it('S6.1-AC1: clear() ẩn chữ ngay bằng hideCharacter({ duration: 0 }) và huỷ nét đang vẽ', async () => {
    const { group } = createStage();
    const strokeWriter = createStrokeWriter(group, '人', STROKE_DATA_REN);
    const writer = FakeHanziWriter.last();
    const result = strokeWriter.animateStroke(0);
    await Promise.resolve();

    strokeWriter.clear();

    expect(hideCharacterCalls(writer)).toEqual([[{ duration: 0 }]]);
    await expect(result).resolves.toBe('cancelled');
  });

  it('S6.1-AC1: destroy() huỷ animation trước rồi gỡ mọi con của <g>, giữ <g> và <svg>', () => {
    const { svg, group } = createStage();
    const strokeWriter = createStrokeWriter(group, '人', STROKE_DATA_REN);
    const writer = FakeHanziWriter.last();
    expect(group.childNodes.length).toBeGreaterThan(0);

    strokeWriter.destroy();

    const hides = writer.calls.filter(
      (call) => call.method === 'hideCharacter',
    );
    expect(hides).toHaveLength(1);
    expect(hides[0]?.args).toEqual([{ duration: 0 }]);
    // Lúc huỷ animation, lớp vẽ của writer vẫn còn trong <g> (gỡ sau khi huỷ).
    expect(hides[0]?.targetChildCount).toBeGreaterThan(0);
    expect(group.childNodes).toHaveLength(0);
    expect(group.parentNode).toBe(svg);
    expect(svg.isConnected).toBe(true);
    expect(svg.getAttribute('width')).toBe('100%');
    expect(svg.getAttribute('height')).toBe('100%');
    expect(svg.getAttribute('viewBox')).toBe('0 0 1024 1024');
  });
});
