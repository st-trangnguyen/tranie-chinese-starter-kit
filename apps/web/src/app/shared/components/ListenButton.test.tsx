import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { act, renderWithProviders, screen } from '@test/render';

import { ListenButton } from './ListenButton';

/** Audio giả ở ranh giới: ghi lại thao tác, phát `ended` theo lệnh của test. */
class FakeAudio extends EventTarget {
  src = '';
  currentTime = 0;
  playbackRate = 1;
  playCount = 0;
  /** Đặt giá trị để `play()` bị từ chối, giả lập audio không phát được. */
  playError: Error | null = null;

  play(): Promise<void> {
    this.playCount += 1;
    return this.playError ? Promise.reject(this.playError) : Promise.resolve();
  }

  pause(): void {
    // Không cần ghi nhận: các test này kiểm số lần phát và nguồn phát.
  }

  finish(): void {
    this.dispatchEvent(new Event('ended'));
  }
}

// AudioService giữ một element cho cả vòng đời module, nên dùng đúng một FakeAudio.
const fakeAudio = new FakeAudio();
const WORD_AUDIO = 'audio/0123456789abcdef.mp3';

describe('ListenButton', () => {
  beforeEach(() => {
    fakeAudio.src = '';
    fakeAudio.currentTime = 0;
    fakeAudio.playbackRate = 1;
    fakeAudio.playCount = 0;
    fakeAudio.playError = null;
    vi.stubGlobal('Audio', function FakeAudioConstructor() {
      return fakeAudio;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('S4.4-AC1: câu vừa hiện thì có nút Nghe và chưa phát audio', () => {
    renderWithProviders(<ListenButton audioPath={WORD_AUDIO} />);

    expect(screen.getByRole('button', { name: 'Nghe' })).toBeEnabled();
    expect(fakeAudio.playCount).toBe(0);
  });

  it('S4.4-AC1: bấm Nghe thì phát âm của từ đúng một lần', async () => {
    const { user } = renderWithProviders(
      <ListenButton audioPath={WORD_AUDIO} />,
    );

    await user.click(screen.getByRole('button', { name: 'Nghe' }));

    expect(fakeAudio.playCount).toBe(1);
    expect(fakeAudio.src).toBe(`/${WORD_AUDIO}`);
  });

  it('S4.4-AC1: nghe lại 10 lần thì phát đủ 10 lần và nút Nghe vẫn bấm được', async () => {
    const { user } = renderWithProviders(
      <ListenButton audioPath={WORD_AUDIO} />,
    );

    for (let index = 0; index < 10; index += 1) {
      await user.click(screen.getByRole('button', { name: 'Nghe' }));
      expect(fakeAudio.playCount).toBe(index + 1);
      await act(async () => {
        fakeAudio.finish();
      });
    }

    expect(fakeAudio.playCount).toBe(10);
    expect(screen.getByRole('button', { name: 'Nghe' })).toBeEnabled();
  });

  it('S4.4-AC1: audio không phát được thì báo lỗi, nút Nghe vẫn bấm được và nút khác không bị khóa', async () => {
    fakeAudio.playError = new Error('NotSupportedError');
    const { user } = renderWithProviders(
      <>
        <ListenButton audioPath={WORD_AUDIO} />
        <button type="button">Kiểm tra</button>
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Nghe' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Không phát được audio.',
    );
    expect(screen.getByRole('button', { name: 'Nghe' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Kiểm tra' })).toBeEnabled();
  });
});
