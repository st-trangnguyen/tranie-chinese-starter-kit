import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { audioService } from '@core/services/audio.service';

import { useRecorder } from './useRecorder';

/** MediaRecorder giả ở ranh giới: stop() phát dataavailable rồi stop. */
class FakeMediaRecorder extends EventTarget {
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

/** Audio giả: hook gọi audioService.stop() khi bắt đầu ghi. */
class FakeAudio extends EventTarget {
  src = '';
  currentTime = 0;
  playbackRate = 1;
  play(): Promise<void> {
    return Promise.resolve();
  }
  pause(): void {}
}

const fakeAudio = new FakeAudio();
const originalMediaDevices = Object.getOwnPropertyDescriptor(
  navigator,
  'mediaDevices',
);

function setMediaDevices(getUserMedia: () => Promise<MediaStream>): void {
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia },
  });
}

describe('useRecorder', () => {
  beforeEach(() => {
    const stream = {
      getTracks: () => [{ stop: vi.fn() }],
    } as unknown as MediaStream;
    setMediaDevices(() => Promise.resolve(stream));
    vi.stubGlobal('MediaRecorder', FakeMediaRecorder);
    vi.stubGlobal('Audio', function FakeAudioConstructor() {
      return fakeAudio;
    });
    URL.createObjectURL = vi.fn(() => 'blob:recording-1');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalMediaDevices) {
      Object.defineProperty(navigator, 'mediaDevices', originalMediaDevices);
    } else {
      Reflect.deleteProperty(navigator, 'mediaDevices');
    }
  });

  it('S5.1-AC1: chưa ghi thì isRecording false, chưa có bản ghi và không lỗi', () => {
    const { result } = renderHook(() => useRecorder());

    expect(result.current.isRecording).toBe(false);
    expect(result.current.recordingUrl).toBeNull();
    expect(result.current.hasError).toBe(false);
  });

  it('S5.1-AC1: bấm Ghi âm (start) thì isRecording true và chưa có bản ghi', async () => {
    const { result } = renderHook(() => useRecorder());

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.isRecording).toBe(true);
    expect(result.current.recordingUrl).toBeNull();
    expect(result.current.hasError).toBe(false);
  });

  it('S5.1-AC1: bấm Dừng (stop) thì isRecording false và có recordingUrl', async () => {
    const { result } = renderHook(() => useRecorder());

    await act(async () => {
      await result.current.start();
    });
    await act(async () => {
      await result.current.stop();
    });

    expect(result.current.isRecording).toBe(false);
    expect(result.current.recordingUrl).toBe('blob:recording-1');
    expect(result.current.hasError).toBe(false);
  });

  it('S5.1-AC1: ghi lại thì bản mới thay bản cũ (recordingUrl đổi sang URL mới)', async () => {
    let counter = 0;
    URL.createObjectURL = vi.fn(() => {
      counter += 1;
      return `blob:recording-${counter}`;
    });
    const { result } = renderHook(() => useRecorder());

    await act(async () => {
      await result.current.start();
    });
    await act(async () => {
      await result.current.stop();
    });
    const firstUrl = result.current.recordingUrl;

    await act(async () => {
      await result.current.start();
    });
    await act(async () => {
      await result.current.stop();
    });

    expect(firstUrl).toBe('blob:recording-1');
    expect(result.current.recordingUrl).toBe('blob:recording-2');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:recording-1');
  });

  it('S5.1-AC1: bắt đầu ghi thì audio đang phát dừng (qua audioService)', async () => {
    const pauseSpy = vi.spyOn(fakeAudio, 'pause');
    let playResult: 'ended' | 'interrupted' | 'pending' = 'pending';
    void audioService.play('/audio/mau.mp3', 1).then((value) => {
      playResult = value;
    });
    const { result } = renderHook(() => useRecorder());

    await act(async () => {
      await result.current.start();
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(pauseSpy).toHaveBeenCalled();
    expect(playResult).toBe('interrupted');
    pauseSpy.mockRestore();
  });

  it('S5.1-AC1: rời màn khi đang ghi thì dừng ghi (track tắt, không setState sau unmount)', async () => {
    const trackStop = vi.fn();
    const stream = {
      getTracks: () => [{ stop: trackStop }],
    } as unknown as MediaStream;
    let resolveStream: (value: MediaStream) => void = () => {};
    setMediaDevices(
      () =>
        new Promise<MediaStream>((resolve) => {
          resolveStream = resolve;
        }),
    );
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result, unmount } = renderHook(() => useRecorder());

    let startPromise: Promise<void> = Promise.resolve();
    act(() => {
      startPromise = result.current.start();
    });
    resolveStream(stream);
    await act(async () => {
      await startPromise;
    });
    expect(result.current.isRecording).toBe(true);

    unmount();

    expect(trackStop).toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
