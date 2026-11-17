import {
  exerciseSchema,
  type Exercise,
  type ExerciseKind,
  type Word,
} from '@csk/shared';

import { exerciseRegistry } from '@shared/components/exercises/exercise.registry';
import { AudioSpeedProvider } from '@shared/contexts/AudioSpeedContext';
import { RecordingModeProvider } from '@shared/contexts/RecordingModeContext';
import { renderWithProviders, screen } from '@test/render';
import { LessonRunner } from './LessonRunner';

const makeWord = (id: string, hanzi: string, pinyin: string): Word => ({
  id,
  hanzi,
  pinyin,
  vi: ['nghĩa ' + hanzi],
  viReviewed: true,
  hsk: 1,
  audio: 'audio/0123456789abcdef.mp3',
});

const WORDS: Word[] = [
  makeWord('w-ba', '八', 'bā'),
  makeWord('w-si', '四', 'sì'),
  makeWord('w-shi', '十', 'shì'),
];

/** Một câu tối thiểu hợp lệ cho mỗi kind; thêm kind vào schema mà quên ở đây thì typecheck fail. */
const EXERCISE_BY_KIND: {
  [K in ExerciseKind]: Extract<Exercise, { kind: K }>;
} = {
  'tone-choice': { id: 'k-tone', kind: 'tone-choice', wordId: 'w-ba' },
  'sound-pair': {
    id: 'k-pair',
    kind: 'sound-pair',
    wordIds: ['w-si', 'w-shi'],
    answerWordId: 'w-si',
  },
  'pinyin-type': { id: 'k-type', kind: 'pinyin-type', wordId: 'w-ba' },
  speak: { id: 'k-speak', kind: 'speak', wordId: 'w-ba' },
  'stroke-write': { id: 'k-write', kind: 'stroke-write', wordId: 'w-ba' },
};

const KINDS: ExerciseKind[] = exerciseSchema.options.map(
  (option) => option.shape.kind.value,
);

describe('LessonRunner — mọi dạng bài trong schema', () => {
  it('S7.1-AC1: Mọi câu thuộc dạng đã hỗ trợ - schema liệt kê đủ các kind đang kiểm', () => {
    expect(KINDS).toEqual(
      expect.arrayContaining(Object.keys(EXERCISE_BY_KIND)),
    );
    expect(KINDS).toHaveLength(Object.keys(EXERCISE_BY_KIND).length);
  });

  it.each(KINDS)(
    'S7.1-AC1: Mọi câu thuộc dạng đã hỗ trợ - câu dạng %s không hiện "Dạng bài này chưa có."',
    (kind) => {
      renderWithProviders(
        <AudioSpeedProvider>
          <RecordingModeProvider>
            <LessonRunner
              view={{
                exercise: EXERCISE_BY_KIND[kind],
                content: { words: WORDS, sentences: [] },
                current: 1,
                total: 1,
                feedback: null,
              }}
              registry={exerciseRegistry}
              handlers={{
                onResult: vi.fn(),
                onContinue: vi.fn(),
                onSkip: vi.fn(),
              }}
            />
          </RecordingModeProvider>
        </AudioSpeedProvider>,
      );

      expect(
        screen.queryByText('Dạng bài này chưa có.'),
      ).not.toBeInTheDocument();
      if (kind === 'stroke-write') {
        expect(screen.getByRole('status')).toHaveTextContent('Đang tải…');
      }
    },
  );
});
