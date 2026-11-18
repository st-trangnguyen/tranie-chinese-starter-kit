import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders, screen, within } from '@test/render';
import { buildWord } from '@test/sound-pair.fixtures';
import { AudioSpeedProvider } from '@shared/contexts/AudioSpeedContext';
import { PinyinVisibilityProvider } from '@shared/contexts/PinyinVisibilityContext';

import { SoundPairExercise } from './SoundPairExercise';
import { ToneChoiceExercise } from './ToneChoiceExercise';

const si = buildWord('w-si', '四', 'sì', 'bốn');
const shi = buildWord('w-shi', '十', 'shí', 'mười');
const ba = buildWord('w-ba', '八', 'bā', 'tám');

describe('Bài phát âm khi tắt "Hiện pinyin"', () => {
  it('S8.2-AC3: tắt pinyin, câu phân biệt cặp âm 四/十 vẫn có hai lựa chọn ghi "sì" và "shí"', () => {
    renderWithProviders(
      <PinyinVisibilityProvider isVisible={false}>
        <AudioSpeedProvider>
          <SoundPairExercise
            exercise={{
              id: 'ex-sound-pair',
              kind: 'sound-pair',
              wordIds: ['w-si', 'w-shi'],
              answerWordId: 'w-si',
            }}
            content={{ words: [si, shi], sentences: [] }}
            onResult={vi.fn()}
            isLocked={false}
          />
        </AudioSpeedProvider>
      </PinyinVisibilityProvider>,
    );

    const options = within(screen.getByRole('group')).getAllByRole('button');

    expect(options).toHaveLength(2);
    expect(options.map((option) => option.textContent).sort()).toEqual([
      'shí',
      'sì',
    ]);
  });

  it('S8.2-AC3: tắt pinyin, câu chọn thanh 八 sau khi chọn vẫn hiện thanh đúng kèm "bā"', async () => {
    const { user } = renderWithProviders(
      <PinyinVisibilityProvider isVisible={false}>
        <AudioSpeedProvider>
          <ToneChoiceExercise
            exercise={{ id: 'ex-tone', kind: 'tone-choice', wordId: 'w-ba' }}
            content={{ words: [ba], sentences: [] }}
            onResult={vi.fn()}
            isLocked={false}
          />
        </AudioSpeedProvider>
      </PinyinVisibilityProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Thanh 3' }));

    expect(screen.getByText('Thanh đúng')).toBeInTheDocument();
    expect(screen.getAllByText('Thanh 1')).toHaveLength(2);
    expect(screen.getByText('bā')).toBeInTheDocument();
  });
});
