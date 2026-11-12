import type { Exercise, Word } from '@csk/shared';

import type { ExerciseContent } from '@shared/models/exercise.model';
import type { ExerciseRegistry } from '@shared/components/exercises/exercise.registry';
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
});
