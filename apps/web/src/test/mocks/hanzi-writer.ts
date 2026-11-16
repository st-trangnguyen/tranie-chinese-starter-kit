/**
 * hanzi-writer giả ở ranh giới (S6.1 D5). Dùng với
 * `vi.mock('hanzi-writer', async () => ({ default: (await import('@test/mocks/hanzi-writer')).FakeHanziWriter }))`.
 *
 * Ghi lại đích, chữ, options lúc `create`, các lệnh đã gọi theo thứ tự, và các nét đang được
 * yêu cầu vẽ. Test điều khiển thời điểm nét vẽ xong bằng `finishStroke()`. `hideCharacter` huỷ
 * mọi nét đang vẽ (`onComplete({ canceled: true })`), giống `cancelMutations` của bản thật.
 * Lúc `create` writer giả vẽ một `<path>` vào đích, như bản thật dựng các lớp SVG của nó.
 */

type CompleteResult = { canceled: boolean };
type OnComplete = (result: CompleteResult) => void;

export type FakeCharDataLoader = (
  character: string,
  onLoad: (data: unknown) => void,
  onError: (error?: unknown) => void,
) => unknown;

export interface FakeHanziWriterOptions {
  width?: number;
  height?: number;
  padding?: number;
  showCharacter?: boolean;
  showOutline?: boolean;
  charDataLoader?: FakeCharDataLoader;
  [key: string]: unknown;
}

export interface FakeWriterCall {
  method: 'animateStroke' | 'hideCharacter' | 'showCharacter';
  args: readonly unknown[];
  /** Số con của đích tại thời điểm gọi (để kiểm thứ tự huỷ → gỡ). */
  targetChildCount: number;
}

interface PendingStroke {
  strokeNum: number;
  onComplete?: OnComplete;
  resolve: (result: CompleteResult) => void;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

export class FakeHanziWriter {
  static instances: FakeHanziWriter[] = [];

  static create(
    target: Element,
    character: string,
    options: FakeHanziWriterOptions = {},
  ): FakeHanziWriter {
    const writer = new FakeHanziWriter(target, character, options);
    FakeHanziWriter.instances.push(writer);
    return writer;
  }

  static reset(): void {
    FakeHanziWriter.instances = [];
  }

  static last(): FakeHanziWriter {
    const writer = FakeHanziWriter.instances.at(-1);
    if (!writer) {
      throw new Error('Chưa có FakeHanziWriter nào được tạo');
    }
    return writer;
  }

  readonly calls: FakeWriterCall[] = [];
  /** Các chỉ số nét đã được yêu cầu vẽ, theo thứ tự. */
  readonly requestedStrokes: number[] = [];
  private pending: PendingStroke[] = [];

  private constructor(
    readonly target: Element,
    readonly character: string,
    readonly options: FakeHanziWriterOptions,
  ) {
    target.appendChild(target.ownerDocument.createElementNS(SVG_NS, 'path'));
  }

  /** Các nét đang vẽ (chưa xong, chưa bị huỷ). */
  get pendingStrokes(): number[] {
    return this.pending.map((stroke) => stroke.strokeNum);
  }

  animateStroke(
    strokeNum: number,
    options: { onComplete?: OnComplete } = {},
  ): Promise<CompleteResult> {
    this.record('animateStroke', [strokeNum, options]);
    this.requestedStrokes.push(strokeNum);
    return new Promise<CompleteResult>((resolve) => {
      this.pending.push({ strokeNum, onComplete: options.onComplete, resolve });
    });
  }

  hideCharacter(
    options: { duration?: number; onComplete?: OnComplete } = {},
  ): Promise<CompleteResult> {
    this.record('hideCharacter', [options]);
    this.settleAll({ canceled: true });
    const result = { canceled: false };
    options.onComplete?.(result);
    return Promise.resolve(result);
  }

  showCharacter(
    options: { duration?: number; onComplete?: OnComplete } = {},
  ): Promise<CompleteResult> {
    this.record('showCharacter', [options]);
    this.settleAll({ canceled: true });
    const result = { canceled: false };
    options.onComplete?.(result);
    return Promise.resolve(result);
  }

  /** Cho nét đang vẽ lâu nhất hoàn tất. */
  finishStroke(): void {
    const stroke = this.pending.shift();
    if (!stroke) {
      throw new Error('Không có nét nào đang vẽ');
    }
    this.settle(stroke, { canceled: false });
  }

  private settleAll(result: CompleteResult): void {
    const strokes = this.pending;
    this.pending = [];
    strokes.forEach((stroke) => this.settle(stroke, result));
  }

  private settle(stroke: PendingStroke, result: CompleteResult): void {
    stroke.onComplete?.(result);
    stroke.resolve(result);
  }

  private record(
    method: FakeWriterCall['method'],
    args: readonly unknown[],
  ): void {
    this.calls.push({
      method,
      args,
      targetChildCount: this.target.childNodes.length,
    });
  }
}
