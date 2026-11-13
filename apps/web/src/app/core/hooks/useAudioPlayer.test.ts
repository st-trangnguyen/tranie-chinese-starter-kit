import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAudioPlayer } from './useAudioPlayer';

/** Audio giả ở ranh giới: ghi lại thao tác, phát `ended` theo lệnh của test. */
class FakeAudio extends EventTarget {
  src = '';
  currentTime = 0;
  playbackRate = 1;
  playCount = 0;
  pauseCount = 0;

  play(): Promise<void> {
    this.playCount += 1;
    return Promise.resolve();
  }

  pause(): void {
    this.pauseCount += 1;
  }

  fail(): void {
    this.dispatchEvent(new Event('error'));
  }

  finish(): void {
    this.dispatchEvent(new Event('ended'));
  }
}

// AudioService giữ một element cho cả vòng đời module, nên dùng đúng một FakeAudio.
const fakeAudio = new FakeAudio();

describe('useAudioPlayer', () => {
  beforeEach(() => {
    fakeAudio.src = '';
    fakeAudio.currentTime = 0;
    fakeAudio.playbackRate = 1;
    fakeAudio.playCount = 0;
    fakeAudio.pauseCount = 0;
    vi.stubGlobal('Audio', function FakeAudioConstructor() {
      return fakeAudio;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('S4.4-AC1: nghe lại 10 lần sau khi lần trước phát xong thì phát đủ 10 lần', async () => {
    const { result } = renderHook(() => useAudioPlayer());

    for (let index = 0; index < 10; index += 1) {
      await act(async () => {
        void result.current.play('audio/0123456789abcdef.mp3', false);
      });
      expect(result.current.isPlaying).toBe(true);
      expect(fakeAudio.playCount).toBe(index + 1);
      expect(fakeAudio.src).toBe('/audio/0123456789abcdef.mp3');

      await act(async () => {
        fakeAudio.finish();
      });
      expect(result.current.isPlaying).toBe(false);
    }

    expect(fakeAudio.playCount).toBe(10);
    expect(result.current.hasError).toBe(false);
  });

  it('S4.4-AC1: bấm Nghe khi đang phát thì phát lại từ đầu và isPlaying vẫn true', async () => {
    const { result } = renderHook(() => useAudioPlayer());

    await act(async () => {
      void result.current.play('audio/0123456789abcdef.mp3', false);
    });
    fakeAudio.currentTime = 1.5;

    await act(async () => {
      void result.current.play('audio/0123456789abcdef.mp3', false);
    });

    expect(fakeAudio.playCount).toBe(2);
    expect(fakeAudio.currentTime).toBe(0);
    // Lần phát đầu bị ngắt ('interrupted') không được coi là đã xong.
    expect(result.current.isPlaying).toBe(true);

    await act(async () => {
      fakeAudio.finish();
    });
    expect(result.current.isPlaying).toBe(false);
  });

  it('S4.4-AC1: audio không phát được thì hasError true, bấm Nghe lại được và lần sau thành công thì xóa lỗi', async () => {
    const { result } = renderHook(() => useAudioPlayer());

    await act(async () => {
      void result.current.play('audio/0123456789abcdef.mp3', false);
    });
    await act(async () => {
      fakeAudio.fail();
    });

    expect(result.current.hasError).toBe(true);
    expect(result.current.isPlaying).toBe(false);

    await act(async () => {
      void result.current.play('audio/0123456789abcdef.mp3', false);
    });
    expect(fakeAudio.playCount).toBe(2);
    expect(result.current.hasError).toBe(false);

    await act(async () => {
      fakeAudio.finish();
    });
    expect(result.current.hasError).toBe(false);
    expect(result.current.isPlaying).toBe(false);
  });

  it('S4.4-AC1: sang câu khác (unmount) khi đang phát thì dừng audio, không cập nhật state và không cảnh báo', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result, unmount } = renderHook(() => useAudioPlayer());

    await act(async () => {
      void result.current.play('audio/0123456789abcdef.mp3', false);
    });
    expect(result.current.isPlaying).toBe(true);
    const pausesBefore = fakeAudio.pauseCount;

    unmount();
    expect(fakeAudio.pauseCount).toBeGreaterThan(pausesBefore);

    await act(async () => {
      fakeAudio.finish();
      fakeAudio.fail();
    });

    expect(consoleError).not.toHaveBeenCalled();
    expect(consoleWarn).not.toHaveBeenCalled();
    consoleError.mockRestore();
    consoleWarn.mockRestore();
  });

  it('S4.4-AC1: sang câu khác (unmount) hook không phát thì không cắt audio của hook đang phát', async () => {
    const hookA = renderHook(() => useAudioPlayer());
    const hookB = renderHook(() => useAudioPlayer());

    await act(async () => {
      void hookA.result.current.play('audio/0123456789abcdef.mp3', false);
    });
    expect(hookA.result.current.isPlaying).toBe(true);
    const pausesBefore = fakeAudio.pauseCount;

    hookB.unmount();

    expect(fakeAudio.pauseCount).toBe(pausesBefore);
    expect(hookA.result.current.isPlaying).toBe(true);

    await act(async () => {
      fakeAudio.finish();
    });
    expect(hookA.result.current.isPlaying).toBe(false);
  });

  it('S4.4-AC1: hook khác bấm phát thì isPlaying của hook bị ngắt về false và unmount hook đó không cắt audio mới', async () => {
    const hookA = renderHook(() => useAudioPlayer());
    const hookB = renderHook(() => useAudioPlayer());

    await act(async () => {
      void hookA.result.current.play('audio/0123456789abcdef.mp3', false);
    });
    expect(hookA.result.current.isPlaying).toBe(true);

    await act(async () => {
      void hookB.result.current.play('audio/fedcba9876543210.mp3', false);
    });
    expect(hookA.result.current.isPlaying).toBe(false);
    expect(hookB.result.current.isPlaying).toBe(true);
    const pausesBefore = fakeAudio.pauseCount;

    hookA.unmount();

    expect(fakeAudio.pauseCount).toBe(pausesBefore);
    expect(hookB.result.current.isPlaying).toBe(true);

    await act(async () => {
      fakeAudio.finish();
    });
    expect(hookB.result.current.isPlaying).toBe(false);
  });

  it('S4.4-AC1: sang câu khác thì dừng audio, hook không giữ luồng gọi stop không cắt audio của hook đang phát', async () => {
    const hookA = renderHook(() => useAudioPlayer());
    const hookB = renderHook(() => useAudioPlayer());

    await act(async () => {
      void hookA.result.current.play('audio/0123456789abcdef.mp3', false);
    });
    expect(hookA.result.current.isPlaying).toBe(true);
    const pausesBefore = fakeAudio.pauseCount;

    act(() => {
      hookB.result.current.stop();
    });

    expect(fakeAudio.pauseCount).toBe(pausesBefore);
    expect(hookA.result.current.isPlaying).toBe(true);

    await act(async () => {
      fakeAudio.finish();
    });
    expect(hookA.result.current.isPlaying).toBe(false);
  });

  it('S4.4-AC1: sang câu khác thì dừng audio, hook đang giữ luồng gọi stop thì audio dừng và isPlaying về false', async () => {
    const hookA = renderHook(() => useAudioPlayer());
    const hookB = renderHook(() => useAudioPlayer());

    await act(async () => {
      void hookA.result.current.play('audio/0123456789abcdef.mp3', false);
    });
    expect(hookA.result.current.isPlaying).toBe(true);
    const pausesBefore = fakeAudio.pauseCount;

    act(() => {
      hookA.result.current.stop();
    });

    expect(fakeAudio.pauseCount).toBeGreaterThan(pausesBefore);
    expect(hookA.result.current.isPlaying).toBe(false);
    expect(hookB.result.current.isPlaying).toBe(false);
  });

  it('S5.1-AC2: nghe bản ghi thì phát đúng src blob một lần từ đầu', async () => {
    const { result } = renderHook(() => useAudioPlayer());
    fakeAudio.currentTime = 2;

    await act(async () => {
      void result.current.playUrl('blob:http://localhost/rec-1', false);
    });

    expect(fakeAudio.src).toBe('blob:http://localhost/rec-1');
    expect(fakeAudio.playCount).toBe(1);
    expect(fakeAudio.currentTime).toBe(0);
    expect(result.current.isPlaying).toBe(true);

    await act(async () => {
      fakeAudio.finish();
    });
    expect(result.current.isPlaying).toBe(false);
    expect(fakeAudio.playCount).toBe(1);
  });

  it('S5.1-AC2: nghe bản ghi rồi nghe mẫu thì luồng bản ghi bị ngắt và chỉ một element phát mẫu từ đầu', async () => {
    const recordingHook = renderHook(() => useAudioPlayer());
    const sampleHook = renderHook(() => useAudioPlayer());

    await act(async () => {
      void recordingHook.result.current.playUrl(
        'blob:http://localhost/rec-1',
        false,
      );
    });
    expect(recordingHook.result.current.isPlaying).toBe(true);
    fakeAudio.currentTime = 1.2;

    await act(async () => {
      void sampleHook.result.current.play('audio/0123456789abcdef.mp3', false);
    });

    // Cùng một element: src đổi sang bản mẫu, phát lại từ đầu, không có luồng thứ hai.
    expect(fakeAudio.src).toBe('/audio/0123456789abcdef.mp3');
    expect(fakeAudio.currentTime).toBe(0);
    expect(fakeAudio.playCount).toBe(2);
    expect(recordingHook.result.current.isPlaying).toBe(false);
    expect(sampleHook.result.current.isPlaying).toBe(true);

    await act(async () => {
      fakeAudio.finish();
    });
    expect(sampleHook.result.current.isPlaying).toBe(false);
  });

  it('S5.1-AC2: nghe bản ghi 5 lần, mỗi lần sau khi lần trước phát xong thì phát đủ 5 lần và vẫn gọi được', async () => {
    const { result } = renderHook(() => useAudioPlayer());

    for (let index = 0; index < 5; index += 1) {
      await act(async () => {
        void result.current.playUrl('blob:http://localhost/rec-1', false);
      });
      expect(result.current.isPlaying).toBe(true);
      expect(fakeAudio.playCount).toBe(index + 1);
      expect(fakeAudio.src).toBe('blob:http://localhost/rec-1');

      await act(async () => {
        fakeAudio.finish();
      });
      expect(result.current.isPlaying).toBe(false);
    }

    expect(fakeAudio.playCount).toBe(5);
    expect(result.current.hasError).toBe(false);
  });

  it('S5.1-AC2: bản ghi không phát được thì hasError true, nghe mẫu vẫn chạy sau đó và xóa lỗi', async () => {
    const { result } = renderHook(() => useAudioPlayer());

    await act(async () => {
      void result.current.playUrl('blob:http://localhost/rec-hong', false);
    });
    await act(async () => {
      fakeAudio.fail();
    });

    expect(result.current.hasError).toBe(true);
    expect(result.current.isPlaying).toBe(false);

    await act(async () => {
      void result.current.play('audio/0123456789abcdef.mp3', false);
    });

    expect(fakeAudio.src).toBe('/audio/0123456789abcdef.mp3');
    expect(fakeAudio.playCount).toBe(2);
    expect(result.current.hasError).toBe(false);
    expect(result.current.isPlaying).toBe(true);

    await act(async () => {
      fakeAudio.finish();
    });
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.hasError).toBe(false);
  });
});
