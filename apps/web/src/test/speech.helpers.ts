import { vi } from 'vitest';

/** Web Speech giả ở ranh giới: stop() phát result rồi end; có thể phát error. */
export class FakeSpeechRecognition extends EventTarget {
  static instances: FakeSpeechRecognition[] = [];

  /** Văn bản mà lần nhận dạng kế tiếp trả về khi stop(). */
  static transcript = '';

  lang = '';
  continuous = false;
  interimResults = false;
  isListening = false;

  constructor() {
    super();
    FakeSpeechRecognition.instances.push(this);
  }

  start(): void {
    this.isListening = true;
    this.dispatchEvent(new Event('start'));
  }

  stop(): void {
    if (!this.isListening) {
      return;
    }
    this.isListening = false;
    const event = new Event('result');
    Object.defineProperty(event, 'results', {
      value: [
        [{ transcript: FakeSpeechRecognition.transcript, confidence: 1 }],
      ],
    });
    this.dispatchEvent(event);
    this.dispatchEvent(new Event('end'));
  }

  abort(): void {
    this.isListening = false;
    this.dispatchEvent(new Event('end'));
  }

  /** Phát lỗi (vd. 'no-speech', 'not-allowed') rồi end. */
  emitError(error: string): void {
    this.isListening = false;
    const event = new Event('error');
    Object.defineProperty(event, 'error', { value: error });
    this.dispatchEvent(event);
    this.dispatchEvent(new Event('end'));
  }

  static reset(): void {
    FakeSpeechRecognition.instances = [];
    FakeSpeechRecognition.transcript = '';
  }
}

/** Gắn bản giả vào window.SpeechRecognition (và webkit); trả về hàm gỡ. */
export function installSpeechRecognition(transcript = ''): () => void {
  FakeSpeechRecognition.reset();
  FakeSpeechRecognition.transcript = transcript;
  vi.stubGlobal('SpeechRecognition', FakeSpeechRecognition);
  vi.stubGlobal('webkitSpeechRecognition', FakeSpeechRecognition);
  return () => {
    vi.unstubAllGlobals();
    FakeSpeechRecognition.reset();
  };
}

/** Đặt navigator.onLine và phát sự kiện online/offline tương ứng. */
export function setOnline(isOnline: boolean): void {
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    value: isOnline,
  });
  window.dispatchEvent(new Event(isOnline ? 'online' : 'offline'));
}
