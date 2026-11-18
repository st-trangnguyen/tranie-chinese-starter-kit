import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Sentence } from '@csk/shared';

import { renderWithProviders, screen, within } from '@test/render';
import { buildWord } from '@test/sound-pair.fixtures';
import {
  installRecordingEnvironment,
  restoreRecordingEnvironment,
} from '@test/record-compare.helpers';
import { AudioSpeedProvider } from '@shared/contexts/AudioSpeedContext';
import { PinyinVisibilityProvider } from '@shared/contexts/PinyinVisibilityContext';

import type { ExerciseContent } from './exercise.types';
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

function renderSpeakWithPinyin(
  isPinyinVisible: boolean,
  exercise: { id: string; wordId?: string; sentenceId?: string },
  content: ExerciseContent,
) {
  const SpeakExercise = exerciseRegistry.speak;
  return renderWithProviders(
    <PinyinVisibilityProvider isVisible={isPinyinVisible}>
      <AudioSpeedProvider>
        {SpeakExercise ? (
          <SpeakExercise
            exercise={{ kind: 'speak', ...exercise }}
            content={content}
            onResult={vi.fn()}
            isLocked={false}
          />
        ) : null}
      </AudioSpeedProvider>
    </PinyinVisibilityProvider>,
  );
}

function expectThreeRatingButtons(): void {
  const group = screen.getByRole('group', { name: 'Tự đánh giá phát âm' });
  expect(
    within(group)
      .getAllByRole('button')
      .map((button) => button.textContent),
  ).toEqual(['Chưa đúng', 'Gần đúng', 'Đúng']);
}

describe('SpeakExercise — Hiện pinyin', () => {
  beforeEach(installRecordingEnvironment);
  afterEach(restoreRecordingEnvironment);

  it('S8.2-AC3: câu nói theo wordId khi tắt pinyin hiện chữ Hán, nghĩa, ba nút và không hiện pinyin', () => {
    renderSpeakWithPinyin(
      false,
      { id: 'ex-word', wordId: 'w-nihao' },
      { words: [nihao], sentences: [] },
    );

    expect(screen.getByText('你好')).toBeInTheDocument();
    expect(screen.getByText('xin chào')).toBeInTheDocument();
    expect(screen.queryByText('nǐ hǎo')).not.toBeInTheDocument();
    expectThreeRatingButtons();
  });

  it('S8.2-AC3: câu nói theo sentenceId khi tắt pinyin hiện chữ Hán, nghĩa, ba nút và không hiện pinyin', () => {
    renderSpeakWithPinyin(
      false,
      { id: 'ex-sentence', sentenceId: 's-xiexie' },
      { words: [], sentences: [sentence] },
    );

    expect(screen.getByText('谢谢你')).toBeInTheDocument();
    expect(screen.getByText('Cảm ơn bạn')).toBeInTheDocument();
    expect(screen.queryByText('xièxie nǐ')).not.toBeInTheDocument();
    expectThreeRatingButtons();
  });

  it('S5.2-AC1: câu nói theo wordId khi bật pinyin hiện chữ Hán, pinyin, nghĩa và ba nút', () => {
    renderSpeakWithPinyin(
      true,
      { id: 'ex-word', wordId: 'w-nihao' },
      { words: [nihao], sentences: [] },
    );

    expect(screen.getByText('你好')).toBeInTheDocument();
    expect(screen.getByText('nǐ hǎo')).toBeInTheDocument();
    expect(screen.getByText('xin chào')).toBeInTheDocument();
    expectThreeRatingButtons();
  });

  it('S5.2-AC1: câu nói theo sentenceId khi bật pinyin hiện chữ Hán, pinyin, nghĩa và ba nút', () => {
    renderSpeakWithPinyin(
      true,
      { id: 'ex-sentence', sentenceId: 's-xiexie' },
      { words: [], sentences: [sentence] },
    );

    expect(screen.getByText('谢谢你')).toBeInTheDocument();
    expect(screen.getByText('xièxie nǐ')).toBeInTheDocument();
    expect(screen.getByText('Cảm ơn bạn')).toBeInTheDocument();
    expectThreeRatingButtons();
  });
});
