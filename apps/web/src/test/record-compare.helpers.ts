import { vi } from 'vitest';

import { type renderWithProviders, screen } from '@test/render';

/** MediaRecorder giả ở ranh giới: stop() phát dataavailable rồi stop. */
export class FakeMediaRecorder extends EventTarget {
  state: 'inactive' | 'recording' = 'inactive';
  mimeType = 'audio/webm';

  constructor(readonly stream: MediaStream) {
    super();
  }

  start(): void {
    this.state = 'recording';
  }

  stop(): void {
    this.state = 'inactive';
    const event = new Event('dataavailable');
    Object.defineProperty(event, 'data', {
      value: new Blob(['voice'], { type: this.mimeType }),
    });
    this.dispatchEvent(event);
    this.dispatchEvent(new Event('stop'));
  }
}

/** Audio giả: audioService giữ một element cho cả vòng đời module. */
class FakeAudio extends EventTarget {
  src = '';
  currentTime = 0;
  playbackRate = 1;
  play(): Promise<void> {
    return Promise.resolve();
  }
  pause(): void {}
}

export const fakeAudio = new FakeAudio();
export const SAMPLE_AUDIO = 'audio/0123456789abcdef.mp3';

const originalMediaDevices = Object.getOwnPropertyDescriptor(
  navigator,
  'mediaDevices',
);

/** Thay navigator.mediaDevices bằng giá trị giả. */
export function stubMediaDevices(value: unknown): void {
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value,
  });
}

/** Dựng stream giả; `stopTrack` được gọi khi nhả micro. */
export function createFakeStream(stopTrack: () => void = vi.fn()): MediaStream {
  return {
    getTracks: () => [{ stop: stopTrack }],
  } as unknown as MediaStream;
}

/** Micro bị từ chối: getUserMedia reject DOMException với `name` (vd NotAllowedError). */
export function rejectGetUserMedia(name: string): void {
  stubMediaDevices({
    getUserMedia: () =>
      Promise.reject(new DOMException('microphone unavailable', name)),
  });
}

/** Cấp quyền micro (sau khi bị chặn): getUserMedia resolve stream giả. */
export function grantMicrophone(): void {
  const stream = createFakeStream();
  stubMediaDevices({ getUserMedia: () => Promise.resolve(stream) });
}

/** Cài ranh giới ngoài (micro, MediaRecorder, Audio, URL) cho mỗi ca. */
export function installRecordingEnvironment(): void {
  const stream = createFakeStream();
  stubMediaDevices({ getUserMedia: () => Promise.resolve(stream) });
  vi.stubGlobal('MediaRecorder', FakeMediaRecorder);
  vi.stubGlobal('Audio', function FakeAudioConstructor() {
    return fakeAudio;
  });
  URL.createObjectURL = vi.fn(() => 'blob:recording-1');
  URL.revokeObjectURL = vi.fn();
}

export function restoreRecordingEnvironment(): void {
  vi.unstubAllGlobals();
  if (originalMediaDevices) {
    Object.defineProperty(navigator, 'mediaDevices', originalMediaDevices);
  } else {
    Reflect.deleteProperty(navigator, 'mediaDevices');
  }
}

/** Đệ quy: có Blob hoặc chuỗi chứa `blob:` ở bất kỳ đâu trong dữ liệu lưu. */
export function containsRecording(value: unknown): boolean {
  if (value instanceof Blob) {
    return true;
  }
  if (typeof value === 'string') {
    return value.includes('blob:');
  }
  if (Array.isArray(value)) {
    return value.some(containsRecording);
  }
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).some(
      ([key, item]) => key.includes('blob:') || containsRecording(item),
    );
  }
  return false;
}

/** Ghi âm một lần: Ghi âm, rồi Dừng, rồi chờ nút Ghi âm quay lại. */
export async function recordOnce(
  user: ReturnType<typeof renderWithProviders>['user'],
): Promise<void> {
  await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
  await user.click(await screen.findByRole('button', { name: 'Dừng' }));
  await screen.findByRole('button', { name: 'Ghi âm' });
}
