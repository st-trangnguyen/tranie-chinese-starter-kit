import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  FakeSpeechRecognition,
  installSpeechRecognition,
} from '@test/speech.helpers';

import { createSpeechService } from './speech.service';

describe('createSpeechService', () => {
  let uninstallSpeech: (() => void) | null = null;

  afterEach(() => {
    uninstallSpeech?.();
    uninstallSpeech = null;
  });

  it('S5.3-AC1: isSupported() là false khi không có SpeechRecognition lẫn webkitSpeechRecognition', () => {
    installSpeechRecognition('')();

    expect(createSpeechService().isSupported()).toBe(false);
  });

  it('S5.3-AC1: isSupported() là true khi trình duyệt có SpeechRecognition', () => {
    uninstallSpeech = installSpeechRecognition('');

    expect(createSpeechService().isSupported()).toBe(true);
  });

  it('S5.3-AC2: lỗi no-speech thì stop() resolve chuỗi rỗng, không reject', async () => {
    uninstallSpeech = installSpeechRecognition('');
    const service = createSpeechService();
    service.start();
    const recognition = FakeSpeechRecognition.instances[0];
    if (!recognition) {
      throw new Error('Chưa có instance nhận dạng');
    }
    vi.spyOn(recognition, 'stop').mockImplementation(() => {
      recognition.emitError('no-speech');
    });

    await expect(service.stop()).resolves.toBe('');
  });

  it('S5.3-AC2: start lại thì stop() chỉ trả chữ của lần start mới', async () => {
    uninstallSpeech = installSpeechRecognition('你号');
    const service = createSpeechService();
    service.start();
    FakeSpeechRecognition.transcript = '你好';
    service.start();

    await expect(service.stop()).resolves.toBe('你好');
  });

  it('S5.3-AC2: kết quả đến muộn của lần start cũ bị bỏ khi đã start lại', async () => {
    uninstallSpeech = installSpeechRecognition('');
    const service = createSpeechService();
    service.start();
    const stale = FakeSpeechRecognition.instances[0];
    service.start();
    FakeSpeechRecognition.transcript = '你好';

    const pending = service.stop();
    const late = new Event('result');
    Object.defineProperty(late, 'results', {
      value: [[{ transcript: '你号', confidence: 1 }]],
    });
    stale?.dispatchEvent(late);

    await expect(pending).resolves.toBe('你好');
  });

  it('S5.3-AC2: stop() đang chờ của lần cũ không nhận chữ của lần start mới', async () => {
    uninstallSpeech = installSpeechRecognition('你号');
    const service = createSpeechService();
    service.start();
    const first = service.stop();
    await first;

    FakeSpeechRecognition.transcript = '你好';
    service.start();

    await expect(service.stop()).resolves.toBe('你好');
  });

  it('S5.3-AC3: lỗi network (khác no-speech) thì stop() reject', async () => {
    uninstallSpeech = installSpeechRecognition('');
    const service = createSpeechService();
    service.start();
    const recognition = FakeSpeechRecognition.instances[0];
    if (!recognition) {
      throw new Error('Chưa có instance nhận dạng');
    }
    vi.spyOn(recognition, 'stop').mockImplementation(() => {
      recognition.emitError('network');
    });

    await expect(service.stop()).rejects.toThrow();
  });
});
