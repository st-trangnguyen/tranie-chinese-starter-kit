import { FakeHanziWriter } from '@test/mocks/hanzi-writer';
import { STROKE_DATA_SHI } from '@test/stroke.fixtures';
import {
  createStrokeQuiz,
  type StrokeAttemptEvent,
} from './stroke-writer.service';

// Ranh giới ngoài: thư viện chấm nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

const SVG_NS = 'http://www.w3.org/2000/svg';
const SCENARIO = 'S6.2-AC1 Viết bằng chuột / Viết bằng ngón tay';

interface Stage {
  svg: SVGSVGElement;
  host: SVGGElement;
}

/** `<svg viewBox="0 0 1024 1024">` chứa `<g>` host rỗng, như khung viết (D6). */
function createStage(): Stage {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 1024 1024');
  const host = document.createElementNS(SVG_NS, 'g');
  svg.appendChild(host);
  document.body.appendChild(svg);
  return { svg, host };
}

function startQuiz(host: SVGGElement): ReturnType<typeof createStrokeQuiz> {
  return createStrokeQuiz(host, '十', STROKE_DATA_SHI, {
    isReducedMotion: false,
    onAttempt: vi.fn(),
  });
}

/** Chờ quiz kích hoạt: thư viện bắt đầu quiz ở microtask sau `quiz()`. */
async function flushQuizStart(): Promise<void> {
  await Promise.resolve();
}

function ownSvgOf(host: SVGGElement): Element {
  const ownSvg = host.querySelector(':scope > svg.writing-pad-writer');
  if (!ownSvg) {
    throw new Error('Host chưa có svg.writing-pad-writer');
  }
  return ownSvg;
}

function countCalls(writer: FakeHanziWriter, method: string): number {
  return writer.calls.filter((call) => call.method === method).length;
}

describe('createStrokeQuiz', () => {
  beforeEach(() => {
    FakeHanziWriter.reset();
    document.body.innerHTML = '';
  });

  it(`${SCENARIO}: append một <svg class="writing-pad-writer"> riêng vào host, hộp 1024 tại gốc`, () => {
    const { host } = createStage();

    startQuiz(host);

    const children = Array.from(host.children);
    expect(children).toHaveLength(1);
    const ownSvg = ownSvgOf(host);
    expect(ownSvg.namespaceURI).toBe(SVG_NS);
    expect(ownSvg.getAttribute('x')).toBe('0');
    expect(ownSvg.getAttribute('y')).toBe('0');
    expect(ownSvg.getAttribute('width')).toBe('1024');
    expect(ownSvg.getAttribute('height')).toBe('1024');
  });

  it(`${SCENARIO}: tạo writer trên đúng <svg> riêng, hộp 1024 không padding, ẩn chữ và viền`, () => {
    const { host } = createStage();

    startQuiz(host);

    expect(FakeHanziWriter.instances).toHaveLength(1);
    const writer = FakeHanziWriter.last();
    expect(writer.target).toBe(ownSvgOf(host));
    expect(writer.character).toBe('十');
    expect(writer.options).toMatchObject({
      width: 1024,
      height: 1024,
      padding: 0,
      showCharacter: false,
      showOutline: false,
    });
  });

  it(`${SCENARIO}: dữ liệu nét đưa vào qua charDataLoader, không tự fetch`, () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { host } = createStage();

    startQuiz(host);

    const loader = FakeHanziWriter.last().options.charDataLoader;
    expect(loader).toBeTypeOf('function');
    const onLoad = vi.fn<(data: unknown) => void>();
    const onError = vi.fn<(error?: unknown) => void>();
    loader?.('十', onLoad, onError);

    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(onLoad.mock.calls[0]?.[0]).toMatchObject({
      strokes: STROKE_DATA_SHI.strokes,
      medians: STROKE_DATA_SHI.medians,
    });
    expect(onError).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it(`${SCENARIO}: con đầu tiên của <svg> riêng là vùng nhận trong suốt 1024×1024`, () => {
    const { host } = createStage();

    startQuiz(host);

    const hitArea = ownSvgOf(host).firstElementChild;
    expect(hitArea?.localName).toBe('rect');
    expect(hitArea?.hasAttribute('data-writing-hit-area')).toBe(true);
    expect(hitArea?.getAttribute('x')).toBe('0');
    expect(hitArea?.getAttribute('y')).toBe('0');
    expect(hitArea?.getAttribute('width')).toBe('1024');
    expect(hitArea?.getAttribute('height')).toBe('1024');
    expect(hitArea?.getAttribute('fill')).toBe('transparent');
  });

  it(`${SCENARIO}: bắt đầu quiz không gợi ý của thư viện, không tự đánh dấu đúng, không nhận nét ngược`, async () => {
    const { host } = createStage();

    startQuiz(host);
    await flushQuizStart();

    const writer = FakeHanziWriter.last();
    expect(countCalls(writer, 'quiz')).toBe(1);
    expect(writer.isQuizActive).toBe(true);
    expect(writer.quizOptions).toMatchObject({
      showHintAfterMisses: false,
      markStrokeCorrectAfterMisses: false,
      acceptBackwardsStrokes: false,
    });
  });

  it(`${SCENARIO}: destroy() sau khi quiz đã kích hoạt huỷ quiz và gỡ <svg> riêng khỏi host`, async () => {
    const { svg, host } = createStage();
    const quiz = startQuiz(host);
    await flushQuizStart();
    const writer = FakeHanziWriter.last();
    const ownSvg = ownSvgOf(host);

    quiz.destroy();

    expect(countCalls(writer, 'cancelQuiz')).toBeGreaterThanOrEqual(1);
    expect(writer.isQuizActive).toBe(false);
    expect(ownSvg.isConnected).toBe(false);
    expect(host.childNodes).toHaveLength(0);
    expect(host.parentNode).toBe(svg);
    expect(svg.getAttribute('viewBox')).toBe('0 0 1024 1024');
  });
});

const IGNORE_SCENARIO = 'S6.2-AC1 Chạm một điểm thì bỏ qua';

describe('createStrokeQuiz — lọc nét quá ngắn', () => {
  beforeEach(() => {
    FakeHanziWriter.reset();
    document.body.innerHTML = '';
  });

  async function startWithSpy(): Promise<{
    writer: FakeHanziWriter;
    onAttempt: ReturnType<typeof vi.fn<(event: StrokeAttemptEvent) => void>>;
  }> {
    const { host } = createStage();
    const onAttempt = vi.fn<(event: StrokeAttemptEvent) => void>();
    createStrokeQuiz(host, '十', STROKE_DATA_SHI, {
      isReducedMotion: false,
      onAttempt,
    });
    await flushQuizStart();
    return { writer: FakeHanziWriter.last(), onAttempt };
  }

  it(`${IGNORE_SCENARIO}: nét sai dài dưới 30 đơn vị (2 điểm cách 5) là 'ignored'`, async () => {
    const { writer, onAttempt } = await startWithSpy();

    writer.emitMistake({
      points: [
        { x: 500, y: 500 },
        { x: 505, y: 500 },
      ],
    });

    expect(onAttempt).toHaveBeenCalledTimes(1);
    expect(onAttempt).toHaveBeenCalledWith('ignored');
  });

  it(`${IGNORE_SCENARIO}: nét sai dài đúng 30 đơn vị là 'mistake'`, async () => {
    const { writer, onAttempt } = await startWithSpy();

    writer.emitMistake({
      points: [
        { x: 500, y: 500 },
        { x: 510, y: 500 },
        { x: 510, y: 520 },
      ],
    });

    expect(onAttempt).toHaveBeenCalledTimes(1);
    expect(onAttempt).toHaveBeenCalledWith('mistake');
  });

  it(`${IGNORE_SCENARIO}: nét đúng dù ngắn vẫn là 'correct'`, async () => {
    const { writer, onAttempt } = await startWithSpy();

    writer.emitCorrectStroke({
      points: [
        { x: 500, y: 500 },
        { x: 505, y: 500 },
      ],
    });

    expect(onAttempt).toHaveBeenCalledTimes(1);
    expect(onAttempt).toHaveBeenCalledWith('correct');
  });
});
