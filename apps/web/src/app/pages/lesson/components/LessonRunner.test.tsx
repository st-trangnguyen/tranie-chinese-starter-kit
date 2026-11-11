import type { Exercise } from '@csk/shared';

import type { ExerciseRegistry } from '@shared/components/exercises/exercise.registry';
import type { LessonSession } from '@shared/models/lesson-session.model';
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

const session = (currentIndex: number): LessonSession => ({
  exerciseIds: EXERCISES.map((exercise) => exercise.id),
  currentIndex,
  phase: 'answering',
  lastResult: null,
});

describe('LessonRunner', () => {
  it('should render the component registered for the current exercise kind', () => {
    renderWithProviders(
      <LessonRunner
        exercise={EXERCISES[1]}
        session={session(1)}
        feedback={null}
        registry={registry}
        handlers={{ onResult: vi.fn(), onContinue: vi.fn(), onSkip: vi.fn() }}
      />,
    );

    expect(screen.getByText('Dạng gõ pinyin: 爸爸')).toBeInTheDocument();
    expect(screen.queryByText(/Dạng thanh điệu/)).not.toBeInTheDocument();
  });
});
