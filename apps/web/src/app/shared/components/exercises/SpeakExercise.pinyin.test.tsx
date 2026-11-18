import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Sentence } from '@csk/shared';

import { renderWithProviders, screen, waitFor, within } from '@test/render';
import { buildWord } from '@test/sound-pair.fixtures';
import {
  fakeAudio,
  installRecordingEnvironment,
  rejectGetUserMedia,
  restoreRecordingEnvironment,
} from '@test/record-compare.helpers';
import { AudioSpeedProvider } from '@shared/contexts/AudioSpeedContext';
import { PinyinVisibilityProvider } from '@shared/contexts/PinyinVisibilityContext';
import { RecordingModeProvider } from '@shared/contexts/RecordingModeContext';

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

// Bọc RecordingModeProvider giống LessonRunnerContainer để mic bị chặn chuyển sang chế độ đọc to.
function renderSpeakReadAloud(
  isPinyinVisible: boolean,
  exercise: { id: string; wordId?: string; sentenceId?: string },
  content: ExerciseContent,
) {
  const SpeakExercise = exerciseRegistry.speak;
  return renderWithProviders(
    <PinyinVisibilityProvider isVisible={isPinyinVisible}>
      <AudioSpeedProvider>
        <RecordingModeProvider>
          {SpeakExercise ? (
            <SpeakExercise
              exercise={{ kind: 'speak', ...exercise }}
              content={content}
              onResult={vi.fn()}
              isLocked={false}
            />
          ) : null}
        </RecordingModeProvider>
      </AudioSpeedProvider>
    </PinyinVisibilityProvider>,
  );
}

describe('SpeakExercise — Hiện pinyin ở chế độ đọc to', () => {
  beforeEach(() => {
    installRecordingEnvironment();
    rejectGetUserMedia('NotAllowedError');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    restoreRecordingEnvironment();
  });

  it('S8.2-AC3: đọc to rồi tự chấm khi tắt pinyin (từ) hiện chữ Hán, nghĩa, không pinyin, Nghe mẫu bấm được', async () => {
    const { user } = renderSpeakReadAloud(
      false,
      { id: 'ex-word', wordId: 'w-nihao' },
      { words: [nihao], sentences: [] },
    );
    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Hãy đọc to chữ trên màn rồi tự chọn mức bên dưới.',
    );

    expect(screen.getByText('你好')).toBeInTheDocument();
    expect(screen.getByText('xin chào')).toBeInTheDocument();
    expect(screen.queryByText('nǐ hǎo')).not.toBeInTheDocument();
    const listen = screen.getByRole('button', { name: 'Nghe mẫu' });
    expect(listen).toBeEnabled();

    await user.click(listen);

    await waitFor(() => {
      expect(fakeAudio.src).toContain(nihao.audio);
    });
  });

  it('S8.2-AC3: đọc to rồi tự chấm khi tắt pinyin (câu) hiện chữ Hán, nghĩa, không pinyin, Nghe mẫu bấm được', async () => {
    const { user } = renderSpeakReadAloud(
      false,
      { id: 'ex-sentence', sentenceId: 's-xiexie' },
      { words: [], sentences: [sentence] },
    );
    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Hãy đọc to chữ trên màn rồi tự chọn mức bên dưới.',
    );

    expect(screen.getByText('谢谢你')).toBeInTheDocument();
    expect(screen.getByText('Cảm ơn bạn')).toBeInTheDocument();
    expect(screen.queryByText('xièxie nǐ')).not.toBeInTheDocument();
    const listen = screen.getByRole('button', { name: 'Nghe mẫu' });
    expect(listen).toBeEnabled();

    await user.click(listen);

    await waitFor(() => {
      expect(fakeAudio.src).toContain(sentence.audio);
    });
  });
  it('S5.4-AC2: đọc to rồi tự chấm khi bật pinyin (từ) hiện chữ Hán, pinyin, nghĩa, Nghe mẫu bấm được', async () => {
    const { user } = renderSpeakReadAloud(
      true,
      { id: 'ex-word', wordId: 'w-nihao' },
      { words: [nihao], sentences: [] },
    );
    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Hãy đọc to chữ trên màn rồi tự chọn mức bên dưới.',
    );

    expect(screen.getByText('你好')).toBeInTheDocument();
    expect(screen.getByText('nǐ hǎo')).toBeInTheDocument();
    expect(screen.getByText('xin chào')).toBeInTheDocument();
    const listen = screen.getByRole('button', { name: 'Nghe mẫu' });
    expect(listen).toBeEnabled();

    await user.click(listen);

    await waitFor(() => {
      expect(fakeAudio.src).toContain(nihao.audio);
    });
  });

  it('S5.4-AC2: đọc to rồi tự chấm khi bật pinyin (câu) hiện chữ Hán, pinyin, nghĩa, Nghe mẫu bấm được', async () => {
    const { user } = renderSpeakReadAloud(
      true,
      { id: 'ex-sentence', sentenceId: 's-xiexie' },
      { words: [], sentences: [sentence] },
    );
    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Hãy đọc to chữ trên màn rồi tự chọn mức bên dưới.',
    );

    expect(screen.getByText('谢谢你')).toBeInTheDocument();
    expect(screen.getByText('xièxie nǐ')).toBeInTheDocument();
    expect(screen.getByText('Cảm ơn bạn')).toBeInTheDocument();
    const listen = screen.getByRole('button', { name: 'Nghe mẫu' });
    expect(listen).toBeEnabled();

    await user.click(listen);

    await waitFor(() => {
      expect(fakeAudio.src).toContain(sentence.audio);
    });
  });
});
