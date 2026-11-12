import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Word } from '@csk/shared';

import { act, renderWithProviders, screen, within } from '@test/render';
import { AudioSpeedProvider } from '@shared/contexts/AudioSpeedContext';

import { SoundPairExercise } from './SoundPairExercise';

const buildWord = (
  id: string,
  hanzi: string,
  pinyin: string,
  vi: string,
): Word => ({
  id,
  hanzi,
  pinyin,
  vi: [vi],
  viReviewed: true,
  hsk: 1,
  audio: `audio/${id.padEnd(16, '0')}.mp3`,
});

/** Audio giả ở ranh giới: ghi lại `src` của mỗi lần phát. */
class FakeAudio extends EventTarget {
  src = '';
  currentTime = 0;
  playbackRate = 1;
  playedSources: string[] = [];

  play(): Promise<void> {
    this.playedSources.push(this.src);
    return Promise.resolve();
  }

  pause(): void {
    // Không cần ghi nhận: test chỉ kiểm nguồn phát.
  }

  finish(): void {
    this.dispatchEvent(new Event('ended'));
  }
}

// AudioService giữ một element cho cả vòng đời module, nên dùng đúng một FakeAudio.
const fakeAudio = new FakeAudio();

const si = buildWord('w-si', '四', 'sì', 'bốn');
const shi = buildWord('w-shi', '十', 'shì', 'mười');

describe('SoundPairExercise', () => {
  it('S4.2-AC1: cặp sì/shì hiện đúng 2 nút lựa chọn ghi pinyin của hai từ và có nút Nghe', () => {
    renderWithProviders(
      <AudioSpeedProvider>
        <SoundPairExercise
          exercise={{
            id: 'ex-1',
            kind: 'sound-pair',
            wordIds: ['w-si', 'w-shi'],
            answerWordId: 'w-si',
          }}
          content={{ words: [si, shi], sentences: [] }}
          onResult={vi.fn()}
          isLocked={false}
        />
      </AudioSpeedProvider>,
    );

    const options = within(screen.getByRole('group')).getAllByRole('button');

    expect(options).toHaveLength(2);
    expect(options.map((option) => option.textContent).sort()).toEqual([
      'shì',
      'sì',
    ]);
    expect(screen.getByRole('button', { name: 'Nghe' })).toBeEnabled();
  });

  it('S4.2-AC1: thứ tự hai lựa chọn đổi theo ngẫu nhiên, đáp án lúc trước lúc sau', () => {
    const randomSpy = vi.spyOn(Math, 'random');
    const optionTexts = (): (string | null)[] =>
      within(screen.getByRole('group'))
        .getAllByRole('button')
        .map((option) => option.textContent);
    const mount = () =>
      renderWithProviders(
        <AudioSpeedProvider>
          <SoundPairExercise
            exercise={{
              id: 'ex-order',
              kind: 'sound-pair',
              wordIds: ['w-si', 'w-shi'],
              answerWordId: 'w-si',
            }}
            content={{ words: [si, shi], sentences: [] }}
            onResult={vi.fn()}
            isLocked={false}
          />
        </AudioSpeedProvider>,
      );

    randomSpy.mockReturnValue(0);
    const first = mount();
    const orderWhenLow = optionTexts();
    first.unmount();

    randomSpy.mockReturnValue(0.9);
    const second = mount();
    const orderWhenHigh = optionTexts();
    second.unmount();

    randomSpy.mockRestore();

    expect(orderWhenLow).toEqual(['sì', 'shì']);
    expect(orderWhenHigh).toEqual(['shì', 'sì']);
  });

  it('S4.2-AC2: chọn "sì" khi đáp án là sì thì onResult nhận isCorrect true và không có explanation', async () => {
    const onResult = vi.fn();

    const { user } = renderWithProviders(
      <AudioSpeedProvider>
        <SoundPairExercise
          exercise={{
            id: 'ex-ac2',
            kind: 'sound-pair',
            wordIds: ['w-si', 'w-shi'],
            answerWordId: 'w-si',
          }}
          content={{ words: [si, shi], sentences: [] }}
          onResult={onResult}
          isLocked={false}
        />
      </AudioSpeedProvider>,
    );

    await user.click(
      within(screen.getByRole('group')).getByRole('button', { name: 'sì' }),
    );

    expect(onResult).toHaveBeenCalledTimes(1);
    const result = onResult.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(result.isCorrect).toBe(true);
    expect(result.explanation).toBeUndefined();
  });

  it('S4.2-AC2: chọn "shì" khi đáp án là sì thì onResult nhận isCorrect false và explanation nêu âm đúng', async () => {
    const onResult = vi.fn();

    const { user } = renderWithProviders(
      <AudioSpeedProvider>
        <SoundPairExercise
          exercise={{
            id: 'ex-ac2-wrong',
            kind: 'sound-pair',
            wordIds: ['w-si', 'w-shi'],
            answerWordId: 'w-si',
          }}
          content={{ words: [si, shi], sentences: [] }}
          onResult={onResult}
          isLocked={false}
        />
      </AudioSpeedProvider>,
    );

    await user.click(
      within(screen.getByRole('group')).getByRole('button', { name: 'shì' }),
    );

    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith({
      isCorrect: false,
      explanation: 'Đáp án đúng: sì',
    });
  });

  it('S4.2-AC2: trước khi chấm chỉ có một nút Nghe, không có nút nghe riêng từng lựa chọn', () => {
    renderWithProviders(
      <AudioSpeedProvider>
        <SoundPairExercise
          exercise={{
            id: 'ex-ac2-listen',
            kind: 'sound-pair',
            wordIds: ['w-si', 'w-shi'],
            answerWordId: 'w-si',
          }}
          content={{ words: [si, shi], sentences: [] }}
          onResult={vi.fn()}
          isLocked={false}
        />
      </AudioSpeedProvider>,
    );

    expect(screen.getAllByRole('button', { name: /^Nghe/ })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Nghe' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nghe sì' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Nghe shì' })).toBeNull();

    const options = within(screen.getByRole('group')).getAllByRole('button');
    expect(options).toHaveLength(2);
    options.forEach((option) => {
      expect(within(option).queryAllByRole('button')).toHaveLength(0);
    });
  });

  it.each([
    ['zhǐ', 'zǐ'],
    ['qī', 'chī'],
    ['fàn', 'fàng'],
    ['nǚ', 'nǔ'],
  ])(
    'S4.2-AC1: cặp %s/%s chọn đúng đáp án thì onResult nhận isCorrect true',
    async (answerPinyin, otherPinyin) => {
      const answer = buildWord('w-answer', '甲', answerPinyin, 'đáp án');
      const other = buildWord('w-other', '乙', otherPinyin, 'từ còn lại');
      const onResult = vi.fn();

      const { user } = renderWithProviders(
        <AudioSpeedProvider>
          <SoundPairExercise
            exercise={{
              id: 'ex-pair',
              kind: 'sound-pair',
              wordIds: ['w-answer', 'w-other'],
              answerWordId: 'w-answer',
            }}
            content={{ words: [answer, other], sentences: [] }}
            onResult={onResult}
            isLocked={false}
          />
        </AudioSpeedProvider>,
      );

      await user.click(
        within(screen.getByRole('group')).getByRole('button', {
          name: answerPinyin,
        }),
      );

      expect(onResult).toHaveBeenCalledTimes(1);
      expect(onResult).toHaveBeenCalledWith(
        expect.objectContaining({ isCorrect: true }),
      );
    },
  );

  it('S4.2-AC2: chọn xong thì cả hai nút lựa chọn bị khóa và bấm lựa chọn kia không gọi onResult lần nữa', async () => {
    const onResult = vi.fn();

    const { user } = renderWithProviders(
      <AudioSpeedProvider>
        <SoundPairExercise
          exercise={{
            id: 'ex-ac2-lock',
            kind: 'sound-pair',
            wordIds: ['w-si', 'w-shi'],
            answerWordId: 'w-si',
          }}
          content={{ words: [si, shi], sentences: [] }}
          onResult={onResult}
          isLocked={false}
        />
      </AudioSpeedProvider>,
    );

    const group = within(screen.getByRole('group'));
    await user.click(group.getByRole('button', { name: 'shì' }));

    expect(group.getByRole('button', { name: 'sì' })).toBeDisabled();
    expect(group.getByRole('button', { name: 'shì' })).toBeDisabled();

    await user.click(group.getByRole('button', { name: 'sì' }));

    expect(onResult).toHaveBeenCalledTimes(1);
  });

  it('S4.2-AC2: render với isLocked thì bấm lựa chọn không gọi onResult', async () => {
    const onResult = vi.fn();

    const { user } = renderWithProviders(
      <AudioSpeedProvider>
        <SoundPairExercise
          exercise={{
            id: 'ex-ac2-locked',
            kind: 'sound-pair',
            wordIds: ['w-si', 'w-shi'],
            answerWordId: 'w-si',
          }}
          content={{ words: [si, shi], sentences: [] }}
          onResult={onResult}
          isLocked
        />
      </AudioSpeedProvider>,
    );

    const group = within(screen.getByRole('group'));
    await user.click(group.getByRole('button', { name: 'sì' }));
    await user.click(group.getByRole('button', { name: 'shì' }));

    expect(onResult).not.toHaveBeenCalled();
  });

  describe('nghe lại sau khi chấm', () => {
    beforeEach(() => {
      fakeAudio.src = '';
      fakeAudio.playedSources = [];
      vi.stubGlobal('Audio', function FakeAudioConstructor() {
        return fakeAudio;
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('S4.2-AC2: chọn xong thì nghe lại được cả hai âm, mỗi nút bấm nhiều lần đều phát đúng từ của nó', async () => {
      const { user } = renderWithProviders(
        <AudioSpeedProvider>
          <SoundPairExercise
            exercise={{
              id: 'ex-ac2-replay',
              kind: 'sound-pair',
              wordIds: ['w-si', 'w-shi'],
              answerWordId: 'w-si',
            }}
            content={{ words: [si, shi], sentences: [] }}
            onResult={vi.fn()}
            isLocked={false}
          />
        </AudioSpeedProvider>,
      );

      await user.click(
        within(screen.getByRole('group')).getByRole('button', { name: 'shì' }),
      );

      const listenSi = screen.getByRole('button', { name: 'Nghe sì' });
      const listenShi = screen.getByRole('button', { name: 'Nghe shì' });
      fakeAudio.playedSources = [];

      const press = async (button: HTMLElement): Promise<void> => {
        await user.click(button);
        await act(async () => {
          fakeAudio.finish();
        });
      };

      await press(listenSi);
      await press(listenShi);
      await press(listenSi);
      await press(listenShi);
      await press(listenSi);

      expect(fakeAudio.playedSources).toEqual([
        `/${si.audio}`,
        `/${shi.audio}`,
        `/${si.audio}`,
        `/${shi.audio}`,
        `/${si.audio}`,
      ]);
    });
  });
});
