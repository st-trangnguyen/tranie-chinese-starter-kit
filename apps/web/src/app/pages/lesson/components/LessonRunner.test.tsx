import { useState } from 'react';
import type { Exercise, Word } from '@csk/shared';

import type { ExerciseContent } from '@shared/models/exercise.model';
import type { LessonFeedbackView } from '@shared/models/lesson-session.model';
import {
  exerciseRegistry,
  type ExerciseRegistry,
} from '@shared/components/exercises/exercise.registry';
import { AudioSpeedProvider } from '@shared/contexts/AudioSpeedContext';
import { renderWithProviders, screen } from '@test/render';
import { LessonRunner } from './LessonRunner';

const EXERCISES: Exercise[] = [
  { id: 'e1', kind: 'tone-choice', wordId: '八' },
  { id: 'e2', kind: 'pinyin-type', wordId: '爸爸' },
];

const registry: ExerciseRegistry = {
  'tone-choice': ({ exercise }) => <p>Dạng thanh điệu: {exercise.wordId}</p>,
  'pinyin-type': ({ exercise }) => <p>Dạng gõ pinyin: {exercise.wordId}</p>,
};

describe('LessonRunner', () => {
  it('should render the component registered for the current exercise kind', () => {
    renderWithProviders(
      <LessonRunner
        view={{
          exercise: EXERCISES[1],
          content: { words: [], sentences: [] },
          current: 2,
          total: EXERCISES.length,
          feedback: null,
        }}
        registry={registry}
        handlers={{ onResult: vi.fn(), onContinue: vi.fn(), onSkip: vi.fn() }}
      />,
    );

    expect(screen.getByText('Dạng gõ pinyin: 爸爸')).toBeInTheDocument();
    expect(screen.queryByText(/Dạng thanh điệu/)).not.toBeInTheDocument();
  });

  it('S4.4-AC1: should pass the content of the current exercise down and update it on the next exercise', () => {
    const makeWord = (id: string, hanzi: string): Word => ({
      id,
      hanzi,
      pinyin: 'bā',
      vi: ['tám'],
      viReviewed: true,
      hsk: 1,
      audio: 'audio/0123456789abcdef.mp3',
    });
    const contents = new Map<string, ExerciseContent>([
      ['e1', { words: [makeWord('八', '八')], sentences: [] }],
      ['e2', { words: [makeWord('爸爸', '爸爸')], sentences: [] }],
    ]);
    const contentRegistry: ExerciseRegistry = {
      'tone-choice': ({ content }) => (
        <p>Nội dung: {content.words[0]?.hanzi}</p>
      ),
      'pinyin-type': ({ content }) => (
        <p>Nội dung: {content.words[0]?.hanzi}</p>
      ),
    };
    const handlers = {
      onResult: vi.fn(),
      onContinue: vi.fn(),
      onSkip: vi.fn(),
    };
    const renderAt = (index: number) => {
      const exercise = EXERCISES[index];
      const content = contents.get(exercise?.id ?? '');
      return (
        <LessonRunner
          view={{
            exercise: exercise as Exercise,
            content: content as ExerciseContent,
            current: index + 1,
            total: EXERCISES.length,
            feedback: null,
          }}
          registry={contentRegistry}
          handlers={handlers}
        />
      );
    };

    const { rerender } = renderWithProviders(renderAt(0));
    expect(screen.getByText('Nội dung: 八')).toBeInTheDocument();

    rerender(renderAt(1));
    expect(screen.getByText('Nội dung: 爸爸')).toBeInTheDocument();
    expect(screen.queryByText('Nội dung: 八')).not.toBeInTheDocument();
  });

  it('S4.1-AC2: should render a tone-choice exercise from the real registry without the skip fallback', () => {
    const word: Word = {
      id: '八',
      hanzi: '八',
      pinyin: 'bā',
      vi: ['tám'],
      viReviewed: true,
      hsk: 1,
      audio: 'audio/0123456789abcdef.mp3',
    };

    renderWithProviders(
      <AudioSpeedProvider>
        <LessonRunner
          view={{
            exercise: EXERCISES[0] as Exercise,
            content: { words: [word], sentences: [] },
            current: 1,
            total: EXERCISES.length,
            feedback: null,
          }}
          registry={exerciseRegistry}
          handlers={{ onResult: vi.fn(), onContinue: vi.fn(), onSkip: vi.fn() }}
        />
      </AudioSpeedProvider>,
    );

    expect(screen.getByRole('group').querySelectorAll('button')).toHaveLength(
      5,
    );
    expect(screen.queryByText(/Dạng bài này chưa có/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Bỏ qua câu này' }),
    ).not.toBeInTheDocument();
  });

  it('S4.3-AC2: Câu gõ pinyin không còn bị bỏ qua - should render a pinyin-type exercise from the real registry without the skip fallback', () => {
    const word: Word = {
      id: '爸爸',
      hanzi: '爸爸',
      pinyin: 'bàba',
      vi: ['bố'],
      viReviewed: true,
      hsk: 1,
      audio: 'audio/0123456789abcdef.mp3',
    };

    renderWithProviders(
      <AudioSpeedProvider>
        <LessonRunner
          view={{
            exercise: EXERCISES[1] as Exercise,
            content: { words: [word], sentences: [] },
            current: 2,
            total: EXERCISES.length,
            feedback: null,
          }}
          registry={exerciseRegistry}
          handlers={{ onResult: vi.fn(), onContinue: vi.fn(), onSkip: vi.fn() }}
        />
      </AudioSpeedProvider>,
    );

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Kiểm tra' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Dạng bài này chưa có/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Bỏ qua câu này' }),
    ).not.toBeInTheDocument();
  });

  it('S4.2-AC2: should render a sound-pair exercise from the real registry without the skip fallback', () => {
    const makeWord = (id: string, hanzi: string, pinyin: string): Word => ({
      id,
      hanzi,
      pinyin,
      vi: ['nghĩa'],
      viReviewed: true,
      hsk: 1,
      audio: `audio/${id.padEnd(16, '0')}.mp3`,
    });
    const exercise: Exercise = {
      id: 'e3',
      kind: 'sound-pair',
      wordIds: ['w-si', 'w-shi'],
      answerWordId: 'w-si',
    };

    renderWithProviders(
      <AudioSpeedProvider>
        <LessonRunner
          view={{
            exercise,
            content: {
              words: [
                makeWord('w-si', '四', 'sì'),
                makeWord('w-shi', '十', 'shì'),
              ],
              sentences: [],
            },
            current: 1,
            total: 1,
            feedback: null,
          }}
          registry={exerciseRegistry}
          handlers={{ onResult: vi.fn(), onContinue: vi.fn(), onSkip: vi.fn() }}
        />
      </AudioSpeedProvider>,
    );

    expect(screen.getByRole('group').querySelectorAll('button')).toHaveLength(
      2,
    );
    expect(screen.queryByText(/Dạng bài này chưa có/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Bỏ qua câu này' }),
    ).not.toBeInTheDocument();
  });
  it('S5.2-AC1: Chưa chọn mức thì chưa chấm - should show no result and no continue button until a rating is chosen', () => {
    const onResult = vi.fn();
    const exercise: Exercise = { id: 'e4', kind: 'speak', wordId: '八' };
    const word: Word = {
      id: '八',
      hanzi: '八',
      pinyin: 'bā',
      vi: ['tám'],
      viReviewed: true,
      hsk: 1,
      audio: 'audio/0123456789abcdef.mp3',
    };

    renderWithProviders(
      <AudioSpeedProvider>
        <LessonRunner
          view={{
            exercise,
            content: { words: [word], sentences: [] },
            current: 1,
            total: 1,
            feedback: null,
          }}
          registry={exerciseRegistry}
          handlers={{ onResult, onContinue: vi.fn(), onSkip: vi.fn() }}
        />
      </AudioSpeedProvider>,
    );

    expect(screen.getByRole('button', { name: 'Đúng' })).toBeInTheDocument();
    expect(onResult).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('button', { name: 'Tiếp tục' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Sai')).not.toBeInTheDocument();
  });

  it('S5.2-AC1: Chọn mức thì câu được chấm ngay - should report the result in words and show the continue button once a rating is chosen', async () => {
    const exercise: Exercise = { id: 'e5', kind: 'speak', wordId: '八' };
    const word: Word = {
      id: '八',
      hanzi: '八',
      pinyin: 'bā',
      vi: ['tám'],
      viReviewed: true,
      hsk: 1,
      audio: 'audio/0123456789abcdef.mp3',
    };

    const Harness = () => {
      const [feedback, setFeedback] = useState<LessonFeedbackView | null>(null);
      return (
        <LessonRunner
          view={{
            exercise,
            content: { words: [word], sentences: [] },
            current: 1,
            total: 1,
            feedback,
          }}
          registry={exerciseRegistry}
          handlers={{
            onResult: setFeedback,
            onContinue: vi.fn(),
            onSkip: vi.fn(),
          }}
        />
      );
    };

    const { user } = renderWithProviders(
      <AudioSpeedProvider>
        <Harness />
      </AudioSpeedProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Gần đúng' }));

    expect(screen.getByRole('status')).toHaveTextContent('Sai');
    expect(
      screen.getByRole('button', { name: 'Tiếp tục' }),
    ).toBeInTheDocument();
  });
});
