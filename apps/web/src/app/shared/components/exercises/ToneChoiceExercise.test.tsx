import { describe, expect, it, vi } from 'vitest';

import type { Word } from '@csk/shared';

import { renderWithProviders, screen, within } from '@test/render';
import { AudioSpeedProvider } from '@shared/contexts/AudioSpeedContext';

import { ToneChoiceExercise } from './ToneChoiceExercise';

const buildWord = (pinyin: string): Word => ({
  id: 'w-ba',
  hanzi: '八',
  pinyin,
  vi: ['tám'],
  viReviewed: true,
  hsk: 1,
  audio: 'audio/0123456789abcdef.mp3',
});

describe('ToneChoiceExercise', () => {
  it('S4.1-AC1: hiện đúng 5 lựa chọn theo thứ tự thanh 1, 2, 3, 4, thanh nhẹ và có nút Nghe', () => {
    renderWithProviders(
      <AudioSpeedProvider>
        <ToneChoiceExercise
          exercise={{ id: 'ex-1', kind: 'tone-choice', wordId: 'w-ba' }}
          content={{ words: [buildWord('bā')], sentences: [] }}
          onResult={vi.fn()}
          isLocked={false}
        />
      </AudioSpeedProvider>,
    );

    const options = within(screen.getByRole('group')).getAllByRole('button');

    expect(options.map((option) => option.textContent)).toEqual([
      'Thanh 1',
      'Thanh 2',
      'Thanh 3',
      'Thanh 4',
      'Thanh nhẹ',
    ]);
    expect(screen.getByRole('button', { name: 'Nghe' })).toBeEnabled();
  });

  it('S4.1-AC1: chưa chọn thì không hiện thanh đúng và không hiện pinyin của từ', () => {
    const { container } = renderWithProviders(
      <AudioSpeedProvider>
        <ToneChoiceExercise
          exercise={{ id: 'ex-1', kind: 'tone-choice', wordId: 'w-ba' }}
          content={{ words: [buildWord('bā')], sentences: [] }}
          onResult={vi.fn()}
          isLocked={false}
        />
      </AudioSpeedProvider>,
    );

    expect(screen.queryByText(/Thanh đúng/)).not.toBeInTheDocument();
    expect(container).not.toHaveTextContent('bā');
    expect(container.innerHTML).not.toContain('bā');
  });

  it('S4.1-AC1: từ không có dấu là thanh nhẹ, chọn "Thanh nhẹ" thì đúng', async () => {
    const onResult = vi.fn();
    const { user } = renderWithProviders(
      <AudioSpeedProvider>
        <ToneChoiceExercise
          exercise={{ id: 'ex-1', kind: 'tone-choice', wordId: 'w-ba' }}
          content={{ words: [buildWord('ma')], sentences: [] }}
          onResult={onResult}
          isLocked={false}
        />
      </AudioSpeedProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Thanh nhẹ' }));

    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({ isCorrect: true }),
    );
  });

  it('S4.1-AC2: từ "nǐ", chọn "Thanh 3" thì chấm đúng và màn hiện "Thanh 3" kèm "nǐ"', async () => {
    const onResult = vi.fn();
    const { user } = renderWithProviders(
      <AudioSpeedProvider>
        <ToneChoiceExercise
          exercise={{ id: 'ex-1', kind: 'tone-choice', wordId: 'w-ba' }}
          content={{ words: [buildWord('nǐ')], sentences: [] }}
          onResult={onResult}
          isLocked={false}
        />
      </AudioSpeedProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Thanh 3' }));

    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({ isCorrect: true }),
    );
    const group = screen.getByRole('group');
    const answerTones = screen
      .getAllByText('Thanh 3')
      .filter((element) => !group.contains(element));
    expect(answerTones).toHaveLength(1);
    expect(screen.getByText('nǐ')).toBeInTheDocument();
  });

  it('S4.1-AC2: từ "nǐ", chọn "Thanh 1" thì chấm sai, báo đáp án đúng và màn hiện "Thanh 3" kèm "nǐ"', async () => {
    const onResult = vi.fn();
    const { user } = renderWithProviders(
      <AudioSpeedProvider>
        <ToneChoiceExercise
          exercise={{ id: 'ex-1', kind: 'tone-choice', wordId: 'w-ba' }}
          content={{ words: [buildWord('nǐ')], sentences: [] }}
          onResult={onResult}
          isLocked={false}
        />
      </AudioSpeedProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Thanh 1' }));

    expect(onResult).toHaveBeenCalledWith({
      isCorrect: false,
      explanation: 'Đáp án đúng: thanh 3 · nǐ',
    });
    const group = screen.getByRole('group');
    const answerTones = screen
      .getAllByText('Thanh 3')
      .filter((element) => !group.contains(element));
    expect(answerTones).toHaveLength(1);
    expect(screen.getByText('nǐ')).toBeInTheDocument();
  });

  it.each([
    { pinyin: 'bā', label: 'Thanh 1' },
    { pinyin: 'bái', label: 'Thanh 2' },
    { pinyin: 'bǎi', label: 'Thanh 3' },
    { pinyin: 'bà', label: 'Thanh 4' },
    { pinyin: 'ma', label: 'Thanh nhẹ' },
  ])(
    'S4.1-AC2: từ "$pinyin", chọn "$label" thì chấm đúng',
    async ({ pinyin, label }) => {
      const onResult = vi.fn();
      const { user } = renderWithProviders(
        <AudioSpeedProvider>
          <ToneChoiceExercise
            exercise={{ id: 'ex-1', kind: 'tone-choice', wordId: 'w-ba' }}
            content={{ words: [buildWord(pinyin)], sentences: [] }}
            onResult={onResult}
            isLocked={false}
          />
        </AudioSpeedProvider>,
      );

      await user.click(screen.getByRole('button', { name: label }));

      expect(onResult).toHaveBeenCalledWith(
        expect.objectContaining({ isCorrect: true }),
      );
    },
  );

  it('S4.1-AC2: chọn một thanh thì khóa các nút, bấm thêm nút khác không chấm lại', async () => {
    const onResult = vi.fn();
    const { user } = renderWithProviders(
      <AudioSpeedProvider>
        <ToneChoiceExercise
          exercise={{ id: 'ex-1', kind: 'tone-choice', wordId: 'w-ba' }}
          content={{ words: [buildWord('nǐ')], sentences: [] }}
          onResult={onResult}
          isLocked={false}
        />
      </AudioSpeedProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Thanh 1' }));

    const options = within(screen.getByRole('group')).getAllByRole('button');
    options.forEach((option) => expect(option).toBeDisabled());

    await user.click(screen.getByRole('button', { name: 'Thanh 3' }));

    expect(onResult).toHaveBeenCalledTimes(1);
  });

  it('S4.1-AC2: isLocked thì bấm nút không gọi onResult', async () => {
    const onResult = vi.fn();
    const { user } = renderWithProviders(
      <AudioSpeedProvider>
        <ToneChoiceExercise
          exercise={{ id: 'ex-1', kind: 'tone-choice', wordId: 'w-ba' }}
          content={{ words: [buildWord('nǐ')], sentences: [] }}
          onResult={onResult}
          isLocked
        />
      </AudioSpeedProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Thanh 3' }));

    expect(onResult).not.toHaveBeenCalled();
  });
});
