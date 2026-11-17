import HanziWriter, {
  type CharacterJson,
  type HanziWriterOptions,
} from 'hanzi-writer';
import type { StrokeData } from '@csk/shared';

export type StrokeAnimationResult = 'completed' | 'cancelled';

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
  const characterJson = toCharacterJson(strokeData);
  const writer = hanziWriterFactory.create(target, character, {
    charDataLoader: (_character, onLoad) => onLoad(characterJson),
    showCharacter: false,
    showOutline: false,
    width: WRITER_BOX_SIZE,
    height: WRITER_BOX_SIZE,
    padding: 0,
  });

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
