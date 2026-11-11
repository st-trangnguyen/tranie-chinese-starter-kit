import { useTranslation } from 'react-i18next';
import type { Exercise } from '@csk/shared';

import {
  resolveExerciseComponent,
  type ExerciseRegistry,
} from '@shared/components/exercises/exercise.registry';
import type { ExerciseResult } from '@shared/models/exercise.model';
import type { LessonSession } from '@shared/models/lesson-session.model';
import { LessonFeedback } from './LessonFeedback';
import { LessonProgressBar } from './LessonProgressBar';

export interface LessonRunnerHandlers {
  onResult: (result: ExerciseResult) => void;
  onContinue: () => void;
  /** Bỏ qua câu có dạng bài chưa được hỗ trợ. */
  onSkip: () => void;
}

export interface LessonFeedbackView {
  isCorrect: boolean;
  /** Đã lọc theo quy tắc: chỉ có khi trả lời sai. */
  explanation?: string;
}

interface LessonRunnerProps {
  exercise: Exercise;
  session: LessonSession;
  /** null khi chưa trả lời. */
  feedback: LessonFeedbackView | null;
  registry: ExerciseRegistry;
  handlers: LessonRunnerHandlers;
}

/** Hiện câu hiện tại của bài qua registry, kèm thanh tiến độ và kết quả (S3.2). */
export const LessonRunner = ({
  exercise,
  session,
  feedback,
  registry,
  handlers,
}: LessonRunnerProps) => {
  const { t } = useTranslation('lesson');
  const ExerciseComponent = resolveExerciseComponent(registry, exercise);

  return (
    <div className="flex flex-col gap-lg">
      <LessonProgressBar
        current={session.currentIndex + 1}
        total={session.exerciseIds.length}
      />
      {ExerciseComponent ? (
        <ExerciseComponent
          key={exercise.id}
          exercise={exercise}
          onResult={handlers.onResult}
        />
      ) : (
        <div className="flex flex-col gap-md">
          <p>{t('unsupported.message')}</p>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handlers.onSkip}
          >
            {t('unsupported.skip')}
          </button>
        </div>
      )}
      {feedback && (
        <LessonFeedback
          isCorrect={feedback.isCorrect}
          explanation={feedback.explanation}
          onContinue={handlers.onContinue}
        />
      )}
    </div>
  );
};
