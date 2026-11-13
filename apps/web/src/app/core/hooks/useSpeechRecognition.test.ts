import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  FakeSpeechRecognition,
  installSpeechRecognition,
} from '@test/speech.helpers';

import { useSpeechRecognition } from './useSpeechRecognition';

describe('useSpeechRecognition', () => {
  let uninstallSpeech: () => void;

  beforeEach(() => {
    uninstallSpeech = installSpeechRecognition('');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    uninstallSpeech();
  });

  it('S5.3-AC3: stop() gặp lỗi network thì hasError là true, không có transcript và không throw', async () => {
    vi.spyOn(FakeSpeechRecognition.prototype, 'stop').mockImplementation(
      function stopWithNetworkError(this: FakeSpeechRecognition): void {
        this.emitError('network');
      },
    );
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.start();
    });
    await act(async () => {
      await result.current.stop();
    });

    expect(result.current.hasError).toBe(true);
    expect(result.current.transcript).toBeNull();
    expect(result.current.isListening).toBe(false);
  });

  /** stop() chỉ phát result, chưa phát end: lần nhận dạng cũ còn treo chờ end. */
  function stopWithoutEnd(heard: string): void {
    vi.spyOn(FakeSpeechRecognition.prototype, 'stop').mockImplementationOnce(
      function stopHanging(this: FakeSpeechRecognition): void {
        const event = new Event('result');
        Object.defineProperty(event, 'results', {
          value: [[{ transcript: heard, confidence: 1 }]],
        });
        this.dispatchEvent(event);
      },
    );
  }

  it('S5.3-AC2: ghi lại khi stop() cũ còn treo thì lần cũ kết thúc không tắt isListening của lần mới', async () => {
    stopWithoutEnd('cũ');
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.start();
    });
    let oldStop: Promise<void> = Promise.resolve();
    act(() => {
      oldStop = result.current.stop();
    });
    act(() => {
      result.current.start();
    });
    await act(async () => {
      await oldStop;
    });

    expect(result.current.isListening).toBe(true);
  });

  it('S5.3-AC2: kết quả của lần cũ không ghi đè transcript khi đang ghi lần mới', async () => {
    stopWithoutEnd('cũ');
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.start();
    });
    let oldStop: Promise<void> = Promise.resolve();
    act(() => {
      oldStop = result.current.stop();
    });
    act(() => {
      result.current.start();
    });
    await act(async () => {
      await oldStop;
    });

    expect(result.current.transcript).toBeNull();
  });

  it('S5.3-AC3: start() lỗi thì hasError là true và không throw ra UI', () => {
    vi.spyOn(FakeSpeechRecognition.prototype, 'start').mockImplementation(
      () => {
        throw new Error('InvalidStateError');
      },
    );
    const { result } = renderHook(() => useSpeechRecognition());

    expect(() => {
      act(() => {
        result.current.start();
      });
    }).not.toThrow();

    expect(result.current.hasError).toBe(true);
    expect(result.current.isListening).toBe(false);
  });
});
