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
const SLOW_LABEL = 'Nghe chậm';
const CHECK_MARK = '✓';

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

  it('S4.4-AC3 Bật Nghe chậm thì hiện dấu tick trước chữ: dấu tick ✓ ẩn với trình đọc màn hình, đứng trước nhãn', async () => {
    const { user } = renderControls();
    const toggle = screen.getByRole('switch', { name: SLOW_LABEL });

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-checked', 'true');
    const checkMark = toggle.querySelector('[aria-hidden="true"]');
    expect(checkMark).not.toBeNull();
    expect(checkMark?.tagName).toBe('SPAN');
    expect(checkMark?.textContent).toBe(CHECK_MARK);
    expect(toggle.firstElementChild).toBe(checkMark);

    const label = Array.from(toggle.children).find(
      (child) => child !== checkMark && child.textContent === SLOW_LABEL,
    );
    expect(label).toBeDefined();
    if (checkMark && label) {
      expect(
        checkMark.compareDocumentPosition(label) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
  });

  it('S4.4-AC3 Tắt thì không có dấu tick: mặc định công tắc tắt, chỉ hiện chữ "Nghe chậm"', () => {
    renderControls();
    const toggle = screen.getByRole('switch', { name: SLOW_LABEL });

    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(toggle.querySelector('[aria-hidden="true"]')).toBeNull();
    expect(toggle.textContent).toBe(SLOW_LABEL);
  });

  it('S4.4-AC3 Bật rồi tắt thì dấu tick biến mất: bấm hai lần thì công tắc tắt, không còn dấu tick', async () => {
    const { user } = renderControls();
    const toggle = screen.getByRole('switch', { name: SLOW_LABEL });

    await user.click(toggle);
    expect(toggle.querySelector('[aria-hidden="true"]')).not.toBeNull();

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(toggle.querySelector('[aria-hidden="true"]')).toBeNull();
    expect(toggle.textContent).toBe(SLOW_LABEL);
  });

  it('S4.4-AC3 Bật bằng bàn phím cũng hiện dấu tick: Tab tới công tắc, Space/Enter bật tắt kèm dấu tick', async () => {
    const { user } = renderControls();
    const toggle = screen.getByRole('switch', { name: SLOW_LABEL });

    await user.tab();
    expect(toggle).toHaveFocus();

    await user.keyboard(' ');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(toggle.querySelector('[aria-hidden="true"]')?.textContent).toBe(
      CHECK_MARK,
    );

    await user.keyboard(' ');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(toggle.querySelector('[aria-hidden="true"]')).toBeNull();

    await user.keyboard('{Enter}');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(toggle.querySelector('[aria-hidden="true"]')?.textContent).toBe(
      CHECK_MARK,
    );
  });

  it('S4.4-AC3 Tên truy cập và trạng thái cho trình đọc màn hình: tên đúng "Nghe chậm" cả lúc tắt và bật, aria-checked phản ánh trạng thái', async () => {
    const { user } = renderControls();
    const toggle = screen.getByRole('switch');

    expect(toggle).toHaveAccessibleName(SLOW_LABEL);
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    await user.click(toggle);

    expect(toggle).toHaveAccessibleName(SLOW_LABEL);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });
});
