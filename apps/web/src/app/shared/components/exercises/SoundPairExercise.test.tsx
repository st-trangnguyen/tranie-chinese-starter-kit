import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders, screen, within } from '@test/render';
import { buildWord, shi, si } from '@test/sound-pair.fixtures';
import { AudioSpeedProvider } from '@shared/contexts/AudioSpeedContext';

import { SoundPairExercise } from './SoundPairExercise';

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
});
