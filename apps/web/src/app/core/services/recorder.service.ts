export type RecorderFailureReason = 'blocked' | 'no-device' | 'unsupported';

export class RecorderError extends Error {
  readonly reason: RecorderFailureReason;

  constructor(
    reason: RecorderFailureReason,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'RecorderError';
    this.reason = reason;
  }
}

const BLOCKED_ERROR_NAMES: readonly string[] = [
  'NotAllowedError',
  'SecurityError',
];

function readErrorName(error: unknown): string | null {
  if (typeof error === 'object' && error !== null && 'name' in error) {
    const { name } = error;
    return typeof name === 'string' ? name : null;
  }
  return null;
}

// Lỗi getUserMedia là dữ liệu ngoài: chỉ đọc `name` qua type guard.
function classifyFailure(error: unknown): RecorderFailureReason {
  const name = readErrorName(error);
  return name !== null && BLOCKED_ERROR_NAMES.includes(name)
    ? 'blocked'
    : 'no-device';
}

const OPEN_MIC_MESSAGE =
  'Không mở được micro. Hãy kiểm tra quyền micro rồi thử lại.';

export interface RecorderDeps {
  isSupported?: () => boolean;
  getUserMedia: () => Promise<MediaStream>;
  createRecorder: (stream: MediaStream) => MediaRecorder;
  createObjectUrl: (blob: Blob) => string;
  revokeObjectUrl: (url: string) => void;
}

export class RecorderService {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private currentUrl: string | null = null;
  private generation = 0;

  constructor(private readonly deps: RecorderDeps) {}

  async start(): Promise<void> {
    this.releaseStream();
    this.generation += 1;
    const generation = this.generation;
    if (!this.isSupported()) {
      throw new RecorderError('unsupported', OPEN_MIC_MESSAGE);
    }
    let stream: MediaStream;
    try {
      stream = await this.deps.getUserMedia();
    } catch (error) {
      throw new RecorderError(classifyFailure(error), OPEN_MIC_MESSAGE, {
        cause: error,
      });
    }
    if (generation !== this.generation) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }
    const recorder = this.deps.createRecorder(stream);
    this.chunks = [];
    recorder.addEventListener('dataavailable', (event: Event) => {
      const data = (event as Event & { data?: unknown }).data;
      if (data instanceof Blob && data.size > 0) {
        this.chunks = [...this.chunks, data];
      }
    });
    this.stream = stream;
    this.recorder = recorder;
    recorder.start();
  }

  /** Kiểm tra mic dùng được mà không bắt đầu ghi (nhả stream ngay). */
  async checkAvailability(): Promise<RecorderFailureReason | null> {
    if (!this.isSupported()) {
      return 'unsupported';
    }
    this.generation += 1;
    const generation = this.generation;
    try {
      const stream = await this.deps.getUserMedia();
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      return generation === this.generation ? classifyFailure(error) : null;
    }
    return null;
  }

  stop(): Promise<string> {
    const recorder = this.recorder;
    if (!recorder) {
      return Promise.reject(new Error('Chưa bắt đầu ghi âm.'));
    }
    const generation = this.generation;
    return new Promise<string>((resolve, reject) => {
      const handleStop = (): void => {
        recorder.removeEventListener('stop', handleStop);
        if (generation !== this.generation) {
          reject(new Error('Đã hủy ghi âm.'));
          return;
        }
        const blob = new Blob(this.chunks, { type: recorder.mimeType });
        this.chunks = [];
        this.revokeCurrentUrl();
        const url = this.deps.createObjectUrl(blob);
        this.currentUrl = url;
        this.releaseStream();
        resolve(url);
      };
      recorder.addEventListener('stop', handleStop);
      recorder.stop();
    });
  }

  discard(): void {
    this.generation += 1;
    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.stop();
    }
    this.releaseStream();
    this.revokeCurrentUrl();
    this.chunks = [];
  }

  private isSupported(): boolean {
    return this.deps.isSupported?.() ?? true;
  }

  private releaseStream(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.recorder = null;
  }

  private revokeCurrentUrl(): void {
    if (this.currentUrl) {
      this.deps.revokeObjectUrl(this.currentUrl);
      this.currentUrl = null;
    }
  }
}

export function createRecorderService(): RecorderService {
  return new RecorderService({
    isSupported: () =>
      typeof navigator.mediaDevices?.getUserMedia === 'function' &&
      typeof MediaRecorder !== 'undefined',
    getUserMedia: () => navigator.mediaDevices.getUserMedia({ audio: true }),
    createRecorder: (stream) => new MediaRecorder(stream),
    createObjectUrl: (blob) => URL.createObjectURL(blob),
    revokeObjectUrl: (url) => URL.revokeObjectURL(url),
  });
}
