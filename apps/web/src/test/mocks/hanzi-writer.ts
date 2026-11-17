/**
 * hanzi-writer giả ở ranh giới (S6.1 D5). Dùng với
 * `vi.mock('hanzi-writer', async () => ({ default: (await import('@test/mocks/hanzi-writer')).FakeHanziWriter }))`.
 *
 * Ghi lại đích, chữ, options lúc `create`, các lệnh đã gọi theo thứ tự, và các nét đang được
 * yêu cầu vẽ. Test điều khiển thời điểm nét vẽ xong bằng `finishStroke()`. `hideCharacter` huỷ
 * mọi nét đang vẽ (`onComplete({ canceled: true })`), giống `cancelMutations` của bản thật.
 * Lúc `create` writer giả vẽ một `<path>` vào đích, như bản thật dựng các lớp SVG của nó.
 *
 * Đặt `FakeHanziWriter.cancelPendingOnHide = false` để mô phỏng nét cũ "kết thúc muộn":
 * `hideCharacter` không huỷ nét đang vẽ, nét đó vẫn chờ và `finishStroke()` sau đó resolve nó
 * là đã xong.
 *
 * Chấm nét (S6.2 D4) bám vòng đời bản thật 3.7.3: `quiz()` trả `Promise`, quiz chỉ kích hoạt
 * trong microtask sau đó (bản thật chạy `_quiz` trong `.then` của `_withData`). Trước khi kích
 * hoạt, `emitCorrectStroke`/`emitMistake` không gọi callback và `cancelQuiz()` không có tác dụng
 * (quiz vẫn kích hoạt sau đó). `cancelQuiz()` sau khi kích hoạt thì `emit*` không gọi callback
 * nữa. Test chờ kích hoạt bằng `await Promise.resolve()`.
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

export interface FakePoint {
  x: number;
  y: number;
}

/** Dữ liệu callback chấm nét, tập con của `_getStrokeData` bản thật (bỏ `strokesRemaining`). */
export interface FakeStrokeData {
  character: string;
  strokeNum: number;
  mistakesOnStroke: number;
  totalMistakes: number;
  drawnPath: { pathString: string; points: FakePoint[] };
  isBackwards: boolean;
}

export interface FakeQuizOptions {
  onCorrectStroke?: (data: FakeStrokeData) => void;
  onMistake?: (data: FakeStrokeData) => void;
  onComplete?: (data: unknown) => void;
  [key: string]: unknown;
}

export interface FakeEmitStroke {
  points?: readonly FakePoint[];
  isBackwards?: boolean;
}

/** Đường mặc định đủ dài (300 đơn vị hộp 1024) cho `emit*` không truyền `points`. */
const DEFAULT_DRAWN_POINTS: readonly FakePoint[] = [
  { x: 200, y: 500 },
  { x: 500, y: 500 },
];

export interface FakeWriterCall {
  method:
    'animateStroke' | 'hideCharacter' | 'showCharacter' | 'quiz' | 'cancelQuiz';
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
  /** `hideCharacter`/`showCharacter` có huỷ nét đang vẽ không. Mặc định có; `reset()` đặt lại. */
  static cancelPendingOnHide = true;

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
    FakeHanziWriter.cancelPendingOnHide = true;
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
  /** Options của lần `quiz()` gần nhất (kể cả khi chưa kích hoạt). */
  quizOptions: FakeQuizOptions | null = null;
  private activeQuiz: FakeQuizOptions | null = null;
  private quizStrokeNum = 0;
  private mistakesOnStroke = 0;
  private totalMistakes = 0;

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
    this.cancelPending();
    const result = { canceled: false };
    options.onComplete?.(result);
    return Promise.resolve(result);
  }

  showCharacter(
    options: { duration?: number; onComplete?: OnComplete } = {},
  ): Promise<CompleteResult> {
    this.record('showCharacter', [options]);
    this.cancelPending();
    const result = { canceled: false };
    options.onComplete?.(result);
    return Promise.resolve(result);
  }

  /** Quiz đã kích hoạt và chưa bị huỷ. */
  get isQuizActive(): boolean {
    return this.activeQuiz !== null;
  }

  quiz(options: FakeQuizOptions = {}): Promise<void> {
    this.record('quiz', [options]);
    this.quizOptions = options;
    return Promise.resolve().then(() => {
      this.activeQuiz = options;
      this.quizStrokeNum = 0;
      this.mistakesOnStroke = 0;
      this.totalMistakes = 0;
    });
  }

  cancelQuiz(): void {
    this.record('cancelQuiz', []);
    this.activeQuiz = null;
  }

  /** Người viết vẽ đúng nét hiện tại. Không làm gì khi quiz chưa kích hoạt hoặc đã huỷ. */
  emitCorrectStroke(stroke: FakeEmitStroke = {}): void {
    const quiz = this.activeQuiz;
    if (!quiz) {
      return;
    }
    const data = this.strokeData(stroke);
    this.quizStrokeNum += 1;
    this.mistakesOnStroke = 0;
    quiz.onCorrectStroke?.(data);
  }

  /** Người viết vẽ sai nét hiện tại. Không làm gì khi quiz chưa kích hoạt hoặc đã huỷ. */
  emitMistake(stroke: FakeEmitStroke = {}): void {
    const quiz = this.activeQuiz;
    if (!quiz) {
      return;
    }
    this.mistakesOnStroke += 1;
    this.totalMistakes += 1;
    quiz.onMistake?.(this.strokeData(stroke));
  }

  /** Cho nét đang vẽ lâu nhất hoàn tất. */
  finishStroke(): void {
    const stroke = this.pending.shift();
    if (!stroke) {
      throw new Error('Không có nét nào đang vẽ');
    }
    this.settle(stroke, { canceled: false });
  }

  private cancelPending(): void {
    if (FakeHanziWriter.cancelPendingOnHide) {
      this.settleAll({ canceled: true });
    }
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

  private strokeData(stroke: FakeEmitStroke): FakeStrokeData {
    const points = (stroke.points ?? DEFAULT_DRAWN_POINTS).map((point) => ({
      ...point,
    }));
    return {
      character: this.character,
      strokeNum: this.quizStrokeNum,
      mistakesOnStroke: this.mistakesOnStroke,
      totalMistakes: this.totalMistakes,
      drawnPath: {
        pathString: points
          .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
          .join(' '),
        points,
      },
      isBackwards: stroke.isBackwards ?? false,
    };
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
