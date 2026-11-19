import { describe, expect, it } from 'vitest';

import { PLAYBACK_RATES } from '@core/constants/audio.constants';

import { AudioService } from './audio.service';

/**
 * Audio giả ở ranh giới: ghi lại thao tác, phát sự kiện `ended` theo lệnh của test.
 * Gán `src` mô phỏng thuật toán load của trình duyệt: `playbackRate` về `defaultPlaybackRate`
 * và `currentTime` về 0.
 */
class FakeAudio extends EventTarget {
  currentTime = 0;
  defaultPlaybackRate = 1;
  playbackRate = 1;
  playCount = 0;
  pauseCount = 0;
  /** `playbackRate` tại thời điểm mỗi lần `play()` được gọi. */
  playRates: number[] = [];

  private currentSrc = '';

  playResult: () => Promise<void> = () => Promise.resolve();

  get src(): string {
    return this.currentSrc;
  }

  set src(value: string) {
    this.currentSrc = value;
    this.playbackRate = this.defaultPlaybackRate;
    this.currentTime = 0;
  }

  play(): Promise<void> {
    this.playCount += 1;
    this.playRates.push(this.playbackRate);
    return this.playResult();
  }

  pause(): void {
    this.pauseCount += 1;
  }

  finish(): void {
    this.dispatchEvent(new Event('ended'));
  }

  fail(): void {
    this.dispatchEvent(new Event('error'));
  }
}

function createService(): { service: AudioService; audios: FakeAudio[] } {
  const audios: FakeAudio[] = [];
  const service = new AudioService(() => {
    const audio = new FakeAudio();
    audios.push(audio);
    return audio as unknown as HTMLAudioElement;
  });
  return { service, audios };
}

describe('AudioService', () => {
  it('S4.4-AC1: bấm Nghe thì phát audio của câu một lần từ đầu', async () => {
    const { service, audios } = createService();

    const result = service.play('/audio/0123456789abcdef.mp3', 1);
    const [audio] = audios;

    expect(audio).toBeDefined();
    expect(audio?.src).toBe('/audio/0123456789abcdef.mp3');
    expect(audio?.currentTime).toBe(0);
    expect(audio?.playbackRate).toBe(1);
    expect(audio?.playCount).toBe(1);

    audio?.finish();
    await expect(result).resolves.toBe('ended');
  });

  it('S4.4-AC2: bật Nghe chậm thì phát 0.75x, kể cả bấm lại cùng câu; tắt thì về 1x', () => {
    const { service, audios } = createService();
    const src = '/audio/ffffffffffffffff.mp3';

    void service.play(src, PLAYBACK_RATES.slow);
    const [audio] = audios;
    if (!audio) {
      throw new Error('AudioService chưa tạo element audio.');
    }

    expect(audio.playRates).toEqual([0.75]);
    expect(audio.playbackRate).toBe(0.75);

    void service.play(src, PLAYBACK_RATES.slow);

    expect(audio.playRates).toEqual([0.75, 0.75]);
    expect(audio.playbackRate).toBe(0.75);

    void service.play(src, PLAYBACK_RATES.normal);

    expect(audio.playRates).toEqual([0.75, 0.75, 1]);
    expect(audio.playbackRate).toBe(1);
    service.stop();
  });

  it('S4.4-AC1: bấm Nghe khi đang phát thì phát lại từ đầu, không có hai luồng âm', async () => {
    const { service, audios } = createService();

    const first = service.play('/audio/aaaaaaaaaaaaaaaa.mp3', 1);
    const [audio] = audios;
    if (!audio) {
      throw new Error('AudioService chưa tạo element audio.');
    }
    audio.currentTime = 2.5;

    const second = service.play('/audio/aaaaaaaaaaaaaaaa.mp3', 1);

    expect(audios).toHaveLength(1);
    expect(audio.currentTime).toBe(0);
    expect(audio.playCount).toBe(2);
    await expect(first).resolves.toBe('interrupted');

    audio.finish();
    await expect(second).resolves.toBe('ended');
  });

  it('S4.4-AC1: audio không phát được thì promise reject khi play() từ chối', async () => {
    const { service, audios } = createService();
    const blocked = new DOMException('Không được phép phát', 'NotAllowedError');
    const factoryAudio = (): void => {
      const [audio] = audios;
      if (audio) {
        audio.playResult = () => Promise.reject(blocked);
      }
    };
    // Audio được tạo khi play() gọi lần đầu: tạo trước bằng một lượt play rồi ngắt.
    const warmup = service.play('/audio/aaaaaaaaaaaaaaaa.mp3', 1);
    factoryAudio();
    service.stop();
    await warmup;

    await expect(
      service.play('/audio/bbbbbbbbbbbbbbbb.mp3', 1),
    ).rejects.toBeTruthy();
  });

  it('S4.4-AC1: audio không phát được thì promise reject khi có sự kiện error', async () => {
    const { service, audios } = createService();

    const result = service.play('/audio/cccccccccccccccc.mp3', 1);
    audios[0]?.fail();

    await expect(result).rejects.toBeInstanceOf(Error);
  });

  it('S4.4-AC1: ngắt chủ động rồi play() báo AbortError thì không reject', async () => {
    const { service, audios } = createService();
    let rejectPlay: (reason: unknown) => void = () => undefined;
    const result = service.play('/audio/dddddddddddddddd.mp3', 1);
    const audio = audios[0];
    if (!audio) {
      throw new Error('AudioService chưa tạo element audio.');
    }
    // play() đầu đã resolve sẵn; mô phỏng AbortError đến muộn bằng lượt play mới.
    audio.playResult = () =>
      new Promise<void>((_, reject) => {
        rejectPlay = reject;
      });
    const second = service.play('/audio/dddddddddddddddd.mp3', 1);
    await expect(result).resolves.toBe('interrupted');

    service.stop();
    rejectPlay(new DOMException('Bị ngắt', 'AbortError'));

    await expect(second).resolves.toBe('interrupted');
  });

  it('S4.4-AC1: sang câu khác thì stop() dừng luồng đang phát và luồng đó resolve interrupted', async () => {
    const { service, audios } = createService();

    const result = service.play('/audio/eeeeeeeeeeeeeeee.mp3', 1);
    const audio = audios[0];
    const pausesBefore = audio?.pauseCount ?? 0;

    service.stop();

    expect(audio?.pauseCount).toBe(pausesBefore + 1);
    await expect(result).resolves.toBe('interrupted');
  });
});
