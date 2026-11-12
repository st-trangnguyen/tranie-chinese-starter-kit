export type PlayResult = 'ended' | 'interrupted';

export type AudioFactory = () => HTMLAudioElement;

/** Hạ tầng phát mp3: một element dùng chung nên không bao giờ có hai luồng âm. */
export class AudioService {
  private audio: HTMLAudioElement | null = null;
  private interruptCurrent: (() => void) | null = null;

  constructor(private readonly createAudio: AudioFactory) {}

  play(src: string, rate: number): Promise<PlayResult> {
    const audio = this.getAudio();
    this.stop();

    return new Promise<PlayResult>((resolve, reject) => {
      let isSettled = false;
      const cleanup = (): void => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        if (this.interruptCurrent === interrupt) {
          this.interruptCurrent = null;
        }
      };
      const settle = (action: () => void): void => {
        if (isSettled) {
          return;
        }
        isSettled = true;
        cleanup();
        action();
      };
      const interrupt = (): void => settle(() => resolve('interrupted'));
      const handleEnded = (): void => settle(() => resolve('ended'));
      const handleError = (): void =>
        settle(() => reject(new Error('Không phát được audio. Hãy thử lại.')));

      this.interruptCurrent = interrupt;
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      audio.currentTime = 0;
      audio.playbackRate = rate;
      audio.src = src;
      audio.play().catch((error: unknown) => {
        // AbortError do chính ta ngắt (stop/play khác) không phải lỗi thật.
        if (isSettled) {
          return;
        }
        settle(() =>
          reject(
            error instanceof Error
              ? error
              : new Error('Không phát được audio. Hãy thử lại.'),
          ),
        );
      });
    });
  }

  stop(): void {
    this.audio?.pause();
    this.interruptCurrent?.();
  }

  private getAudio(): HTMLAudioElement {
    this.audio ??= this.createAudio();
    return this.audio;
  }
}

export const audioService = new AudioService(() => new Audio());
