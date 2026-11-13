export interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export interface SpeechDeps {
  createRecognition: () => SpeechRecognitionLike | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractTranscript(event: Event): string {
  const results: unknown = Reflect.get(event, 'results');
  if (!isRecord(results)) {
    return '';
  }
  const parts: string[] = [];
  for (let index = 0; index < Number(results.length ?? 0); index += 1) {
    const alternatives = results[index];
    if (!isRecord(alternatives)) {
      continue;
    }
    const transcript = alternatives[0];
    if (isRecord(transcript) && typeof transcript.transcript === 'string') {
      parts.push(transcript.transcript);
    }
  }
  return parts.join('');
}

export class SpeechService {
  private recognition: SpeechRecognitionLike | null = null;

  constructor(private readonly deps: SpeechDeps) {}

  isSupported(): boolean {
    return this.deps.createRecognition() !== null;
  }

  start(): void {
    this.abort();
    const recognition = this.deps.createRecognition();
    if (!recognition) {
      throw new Error('Trình duyệt không hỗ trợ nhận diện giọng nói.');
    }
    try {
      recognition.start();
    } catch (error) {
      throw new Error('Không bắt đầu được nhận diện giọng nói.', {
        cause: error,
      });
    }
    this.recognition = recognition;
  }

  stop(): Promise<string> {
    const recognition = this.recognition;
    if (!recognition) {
      return Promise.reject(new Error('Chưa bắt đầu nhận diện.'));
    }
    return new Promise<string>((resolve, reject) => {
      let transcript = '';
      let failure: string | null = null;
      const handleResult = (event: Event): void => {
        transcript = extractTranscript(event);
      };
      const handleError = (event: Event): void => {
        const code: unknown = Reflect.get(event, 'error');
        failure = typeof code === 'string' ? code : 'unknown';
      };
      const handleEnd = (): void => {
        recognition.removeEventListener('result', handleResult);
        recognition.removeEventListener('error', handleError);
        recognition.removeEventListener('end', handleEnd);
        if (this.recognition === recognition) {
          this.recognition = null;
        }
        if (failure !== null && failure !== 'no-speech') {
          reject(new Error(`Nhận diện giọng nói lỗi: ${failure}`));
          return;
        }
        resolve(failure === null ? transcript : '');
      };
      recognition.addEventListener('result', handleResult);
      recognition.addEventListener('error', handleError);
      recognition.addEventListener('end', handleEnd);
      recognition.stop();
    });
  }

  abort(): void {
    const recognition = this.recognition;
    this.recognition = null;
    recognition?.abort();
  }
}

function isRecognitionConstructor(
  value: unknown,
): value is SpeechRecognitionConstructor {
  return typeof value === 'function';
}

function createRecognition(): SpeechRecognitionLike | null {
  const candidate: unknown =
    Reflect.get(window, 'SpeechRecognition') ??
    Reflect.get(window, 'webkitSpeechRecognition');
  if (!isRecognitionConstructor(candidate)) {
    return null;
  }
  const recognition = new candidate();
  recognition.lang = 'zh-CN';
  recognition.interimResults = false;
  recognition.continuous = false;
  return recognition;
}

export function createSpeechService(): SpeechService {
  return new SpeechService({ createRecognition });
}
