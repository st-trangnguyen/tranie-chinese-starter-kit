export interface RecorderDeps {
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
    let stream: MediaStream;
    try {
      stream = await this.deps.getUserMedia();
    } catch (error) {
      throw new Error(
        'Không mở được micro. Hãy kiểm tra quyền micro rồi thử lại.',
        {
          cause: error,
        },
      );
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
    getUserMedia: () => navigator.mediaDevices.getUserMedia({ audio: true }),
    createRecorder: (stream) => new MediaRecorder(stream),
    createObjectUrl: (blob) => URL.createObjectURL(blob),
    revokeObjectUrl: (url) => URL.revokeObjectURL(url),
  });
}
