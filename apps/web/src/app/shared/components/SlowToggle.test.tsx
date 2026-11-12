import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders, screen } from '@test/render';
import { AudioSpeedProvider } from '@shared/contexts/AudioSpeedContext';

import { ListenButton } from './ListenButton';
import { SlowToggle } from './SlowToggle';

/** Audio giả ở ranh giới: ghi lại tốc độ phát tại thời điểm `play()`. */
class FakeAudio extends EventTarget {
  src = '';
  currentTime = 0;
  playbackRate = 1;
  playCount = 0;
  rateAtLastPlay: number | null = null;

  play(): Promise<void> {
    this.playCount += 1;
    this.rateAtLastPlay = this.playbackRate;
    return Promise.resolve();
  }

  pause(): void {
    // Không cần ghi nhận.
  }
}

// AudioService giữ một element cho cả vòng đời module, nên dùng đúng một FakeAudio.
const fakeAudio = new FakeAudio();
const WORD_AUDIO = 'audio/0123456789abcdef.mp3';

function renderControls() {
  return renderWithProviders(
    <AudioSpeedProvider>
      <SlowToggle />
      <ListenButton audioPath={WORD_AUDIO} />
    </AudioSpeedProvider>,
  );
}

describe('SlowToggle', () => {
  beforeEach(() => {
    fakeAudio.src = '';
    fakeAudio.currentTime = 0;
    fakeAudio.playbackRate = 1;
    fakeAudio.playCount = 0;
    fakeAudio.rateAtLastPlay = null;
    vi.stubGlobal('Audio', function FakeAudioConstructor() {
      return fakeAudio;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('S4.4-AC2: mặc định phát tốc độ thường (playbackRate = 1)', async () => {
    const { user } = renderControls();

    expect(screen.getByRole('switch', { name: 'Nghe chậm' })).toHaveAttribute(
      'aria-checked',
      'false',
    );

    await user.click(screen.getByRole('button', { name: 'Nghe' }));

    expect(fakeAudio.playCount).toBe(1);
    expect(fakeAudio.rateAtLastPlay).toBe(1);
  });

  it('S4.4-AC2: bật Nghe chậm thì phát 0.75x và công tắc báo đã bật', async () => {
    const { user } = renderControls();

    await user.click(screen.getByRole('switch', { name: 'Nghe chậm' }));

    expect(screen.getByRole('switch', { name: 'Nghe chậm' })).toHaveAttribute(
      'aria-checked',
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'Nghe' }));

    expect(fakeAudio.rateAtLastPlay).toBe(0.75);
  });

  it('S4.4-AC2: tắt Nghe chậm thì về tốc độ thường', async () => {
    const { user } = renderControls();
    const toggle = screen.getByRole('switch', { name: 'Nghe chậm' });

    await user.click(toggle);
    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-checked', 'false');

    await user.click(screen.getByRole('button', { name: 'Nghe' }));

    expect(fakeAudio.rateAtLastPlay).toBe(1);
  });
});
