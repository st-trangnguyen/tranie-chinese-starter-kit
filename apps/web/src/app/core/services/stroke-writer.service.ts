import HanziWriter, {
  type CharacterJson,
  type HanziWriterOptions,
  type Point,
} from 'hanzi-writer';
import type { StrokeData } from '@csk/shared';

export type StrokeAnimationResult = 'completed' | 'cancelled';

/** Kết quả một lần người viết vẽ nét (S6.2 D4). Cùng union với `StrokeAttemptResult` của model. */
export type StrokeAttemptEvent = 'correct' | 'mistake' | 'ignored';

export interface StrokeQuizOptions {
  isReducedMotion: boolean;
  onAttempt: (event: StrokeAttemptEvent) => void;
}

/** Phiên chấm nét trên một `<svg>` riêng do adapter tạo trong host (S6.2 D4). */
export interface StrokeQuiz {
  destroy(): void;
}

/** Vẽ từng nét của một chữ vào một `<g>` SVG. Adapter duy nhất bọc hanzi-writer (S6.1 D5). */
export interface StrokeWriter {
  animateStroke(index: number): Promise<StrokeAnimationResult>;
  clear(): void;
  destroy(): void;
}

/** Hộp vẽ trùng `viewBox="0 0 1024 1024"` của `StrokeGlyph`, nên transform khớp lớp chữ mờ. */
const WRITER_BOX_SIZE = 1024;

/**
 * Type của hanzi-writer 3.x khai báo đích là `string | HTMLElement`, nhưng `RenderTarget.init`
 * nhận cả phần tử `SVG`/`G` và vẽ thẳng vào đó. Nới chữ ký về `string | Element` ở một chỗ, không
 * cast: tham số của method được so bivariant, và `HTMLElement` là con của `Element`.
 */
interface HanziWriterFactory {
  create(
    target: string | Element,
    character: string,
    options: Partial<HanziWriterOptions>,
  ): HanziWriter;
}

const hanziWriterFactory: HanziWriterFactory = HanziWriter;

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Scenario "Chạm một điểm thì bỏ qua" (S6.2-AC1): nét sai ngắn hơn ngưỡng này (đơn vị hộp 1024,
 * khoảng 3 % cạnh khung) là chạm nhầm, báo `'ignored'` thay vì `'mistake'` (D4).
 */
const MIN_STROKE_LENGTH = 30;

/** Độ dài đường vẽ = tổng độ dài các đoạn thẳng nối các điểm liên tiếp. */
function measurePathLength(points: readonly Point[]): number {
  return points.reduce((total, point, index) => {
    const previous = index > 0 ? points[index - 1] : undefined;
    if (!previous) {
      return total;
    }
    return total + Math.hypot(point.x - previous.x, point.y - previous.y);
  }, 0);
}

function createWriterOptions(
  strokeData: StrokeData,
): Partial<HanziWriterOptions> {
  const characterJson = toCharacterJson(strokeData);
  return {
    charDataLoader: (_character, onLoad) => onLoad(characterJson),
    showCharacter: false,
    showOutline: false,
    width: WRITER_BOX_SIZE,
    height: WRITER_BOX_SIZE,
    padding: 0,
  };
}

function toCharacterJson(strokeData: StrokeData): CharacterJson {
  return {
    strokes: [...strokeData.strokes],
    medians: strokeData.medians.map((median) =>
      median.map((point) => [...point]),
    ),
  };
}

export function createStrokeWriter(
  target: SVGGElement,
  character: string,
  strokeData: StrokeData,
): StrokeWriter {
  const writer = hanziWriterFactory.create(
    target,
    character,
    createWriterOptions(strokeData),
  );

  const clear = (): void => {
    void writer.hideCharacter({ duration: 0 });
  };

  return {
    animateStroke: (index) =>
      new Promise<StrokeAnimationResult>((resolve) => {
        void writer.animateStroke(index, {
          onComplete: ({ canceled }) =>
            resolve(canceled ? 'cancelled' : 'completed'),
        });
      }),
    clear,
    destroy: () => {
      clear();
      target.replaceChildren();
    },
  };
}

/** Đặt các thuộc tính hộp 1024 tại gốc cho phần tử SVG. */
function setBox(element: Element): void {
  element.setAttribute('x', '0');
  element.setAttribute('y', '0');
  element.setAttribute('width', String(WRITER_BOX_SIZE));
  element.setAttribute('height', String(WRITER_BOX_SIZE));
}

/**
 * `<svg class="writing-pad-writer">` riêng cho mỗi lần chấm: `<svg>` có `createSVGPoint` nên
 * hanzi-writer đổi toạ độ con trỏ ra đơn vị hộp 1024; con đầu là `rect` trong suốt để nhấn vào
 * vùng trống cũng tới được nút đích (D4).
 */
function createOwnSvg(host: SVGGElement): SVGSVGElement {
  const ownSvg = host.ownerDocument.createElementNS(SVG_NS, 'svg');
  ownSvg.setAttribute('class', 'writing-pad-writer');
  setBox(ownSvg);
  const hitArea = host.ownerDocument.createElementNS(SVG_NS, 'rect');
  setBox(hitArea);
  hitArea.setAttribute('fill', 'transparent');
  hitArea.setAttribute('data-writing-hit-area', '');
  ownSvg.appendChild(hitArea);
  return ownSvg;
}

export function createStrokeQuiz(
  host: SVGGElement,
  character: string,
  strokeData: StrokeData,
  options: StrokeQuizOptions,
): StrokeQuiz {
  const ownSvg = createOwnSvg(host);
  host.appendChild(ownSvg);
  const writer = hanziWriterFactory.create(
    ownSvg,
    character,
    createWriterOptions(strokeData),
  );

  void writer.quiz({
    showHintAfterMisses: false,
    markStrokeCorrectAfterMisses: false,
    acceptBackwardsStrokes: false,
    onCorrectStroke: () => options.onAttempt('correct'),
    onMistake: ({ drawnPath }) =>
      options.onAttempt(
        measurePathLength(drawnPath.points) < MIN_STROKE_LENGTH
          ? 'ignored'
          : 'mistake',
      ),
  });

  return {
    destroy: () => {
      writer.cancelQuiz();
      ownSvg.remove();
    },
  };
}
