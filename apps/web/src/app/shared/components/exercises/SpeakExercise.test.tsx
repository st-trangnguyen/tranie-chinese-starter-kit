import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Sentence } from '@csk/shared';

import { renderWithProviders, screen, within } from '@test/render';
import { buildWord } from '@test/sound-pair.fixtures';
import {
  installRecordingEnvironment,
  restoreRecordingEnvironment,
} from '@test/record-compare.helpers';
import { AudioSpeedProvider } from '@shared/contexts/AudioSpeedContext';

import type { ExerciseContent, ExerciseProps } from './exercise.types';
import { exerciseRegistry } from './exercise.registry';

const nihao = buildWord('w-nihao', '你好', 'nǐ hǎo', 'xin chào');

const sentence: Sentence = {
  id: 's-xiexie',
  hanzi: '谢谢你',
  pinyin: 'xièxie nǐ',
  vi: 'Cảm ơn bạn',
  voice: 'female',
  audio: 'audio/s000000000000001.mp3',
};

function renderSpeak(
  exercise: { id: string; wordId?: string; sentenceId?: string },
  content: ExerciseContent,
  onResult: ExerciseProps<'speak'>['onResult'] = vi.fn(),
) {
  const SpeakExercise = exerciseRegistry.speak;
  return renderWithProviders(
    <AudioSpeedProvider>
      {SpeakExercise ? (
        <SpeakExercise
          exercise={{ kind: 'speak', ...exercise }}
          content={content}
          onResult={onResult}
          isLocked={false}
        />
      ) : null}
    </AudioSpeedProvider>,
  );
}

describe('SpeakExercise', () => {
  beforeEach(installRecordingEnvironment);
  afterEach(restoreRecordingEnvironment);

  it('S5.2-AC1: câu nói theo wordId hiện chữ Hán, pinyin, nghĩa và 3 nút đánh giá theo thứ tự', () => {
    renderSpeak(
      { id: 'ex-word', wordId: 'w-nihao' },
      { words: [nihao], sentences: [] },
    );

    expect(screen.getByText('你好')).toBeInTheDocument();
    expect(screen.getByText('nǐ hǎo')).toBeInTheDocument();
    expect(screen.getByText('xin chào')).toBeInTheDocument();

    const group = screen.getByRole('group', { name: 'Tự đánh giá phát âm' });
    expect(
      within(group)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual(['Chưa đúng', 'Gần đúng', 'Đúng']);
  });

  it('S5.2-AC1: câu nói theo sentenceId hiện chữ Hán, pinyin, nghĩa và 3 nút đánh giá', () => {
    renderSpeak(
      { id: 'ex-sentence', sentenceId: 's-xiexie' },
      { words: [], sentences: [sentence] },
    );

    expect(screen.getByText('谢谢你')).toBeInTheDocument();
    expect(screen.getByText('xièxie nǐ')).toBeInTheDocument();
    expect(screen.getByText('Cảm ơn bạn')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Chưa đúng' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Gần đúng' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Đúng' })).toBeEnabled();
  });

  it('S5.2-AC1: câu nói có khối ghi âm của S5.1 để người học đọc và thử', () => {
    renderSpeak(
      { id: 'ex-record', wordId: 'w-nihao' },
      { words: [nihao], sentences: [] },
    );

    expect(screen.getByRole('button', { name: 'Ghi âm' })).toBeEnabled();
  });

  it('S5.2-AC1: bấm "Gần đúng" khi chưa ghi âm thì onResult được gọi đúng một lần với kết quả sai', async () => {
    const onResult = vi.fn();
    const { user } = renderSpeak(
      { id: 'ex-close', wordId: 'w-nihao' },
      { words: [nihao], sentences: [] },
      onResult,
    );

    await user.click(screen.getByRole('button', { name: 'Gần đúng' }));

    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({ isCorrect: false }),
    );
  });

  it('S5.2-AC1: đã chọn "Gần đúng" rồi bấm "Đúng" thì vẫn theo "Gần đúng" và 3 nút bị khóa', async () => {
    const onResult = vi.fn();
    const { user } = renderSpeak(
      { id: 'ex-locked', wordId: 'w-nihao' },
      { words: [nihao], sentences: [] },
      onResult,
    );

    await user.click(screen.getByRole('button', { name: 'Gần đúng' }));
    await user.click(screen.getByRole('button', { name: 'Đúng' }));

    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({ isCorrect: false }),
    );
    const group = screen.getByRole('group', { name: 'Tự đánh giá phát âm' });
    within(group)
      .getAllByRole('button')
      .forEach((button) => expect(button).toBeDisabled());
  });

  it('S5.2-AC1: Tab tới "Đúng" rồi Enter thì onResult được gọi đúng một lần với kết quả đúng', async () => {
    const onResult = vi.fn();
    const { user } = renderSpeak(
      { id: 'ex-keyboard', wordId: 'w-nihao' },
      { words: [nihao], sentences: [] },
      onResult,
    );
    const correctButton = screen.getByRole('button', { name: 'Đúng' });

    const maxTabs = 20;
    for (
      let i = 0;
      i < maxTabs && document.activeElement !== correctButton;
      i++
    ) {
      await user.tab();
    }
    expect(correctButton).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({ isCorrect: true }),
    );
  });

  it('S5.2-AC1: mức đã chọn được báo bằng aria-pressed và chữ "Đã chọn" cạnh đúng nút đó, không chỉ màu', async () => {
    const { user } = renderSpeak(
      { id: 'ex-selected', wordId: 'w-nihao' },
      { words: [nihao], sentences: [] },
    );
    const group = screen.getByRole('group', { name: 'Tự đánh giá phát âm' });
    const buttons = within(group).getAllByRole('button');

    buttons.forEach((button) =>
      expect(button).toHaveAttribute('aria-pressed', 'false'),
    );
    expect(screen.queryByText('Đã chọn')).not.toBeInTheDocument();

    await user.click(within(group).getByRole('button', { name: /Gần đúng/ }));

    const [notYet, close, correct] = within(group).getAllByRole('button');
    expect(close).toHaveAttribute('aria-pressed', 'true');
    expect(notYet).toHaveAttribute('aria-pressed', 'false');
    expect(correct).toHaveAttribute('aria-pressed', 'false');

    const marker = screen.getByText('Đã chọn');
    expect(screen.getAllByText('Đã chọn')).toHaveLength(1);
    expect(notYet).not.toContainElement(marker);
    expect(correct).not.toContainElement(marker);
    const isInsideChosen = close?.contains(marker) ?? false;
    const isBesideChosen = close?.nextElementSibling === marker;
    const isInChosenWrapper =
      marker.parentElement !== group &&
      marker.parentElement?.contains(close ?? null) === true;
    expect(isInsideChosen || isBesideChosen || isInChosenWrapper).toBe(true);
  });
});
