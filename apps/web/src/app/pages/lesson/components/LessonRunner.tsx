import { useTranslation } from 'react-i18next';

import {
  resolveExerciseComponent,
  type ExerciseRegistry,
} from '@shared/components/exercises/exercise.registry';
import type { ExerciseResult } from '@shared/models/exercise.model';
import type { LessonRunnerView } from '@shared/models/lesson-session.model';
import { LessonFeedback } from './LessonFeedback';
import { LessonProgressBar } from './LessonProgressBar';

export interface LessonRunnerHandlers {
  onResult: (result: ExerciseResult) => void;
  onContinue: () => void;
  /** Bỏ qua câu có dạng bài chưa được hỗ trợ. */
  onSkip: () => void;
}

interface LessonRunnerProps {
  view: LessonRunnerView;
  registry: ExerciseRegistry;
  handlers: LessonRunnerHandlers;
}

/** Hiện câu hiện tại của bài qua registry, kèm thanh tiến độ và kết quả (S3.2). */
export const LessonRunner = ({
  view,
  registry,
  handlers,
}: LessonRunnerProps) => {
  const { t } = useTranslation('lesson');
  const { exercise, content, current, total, feedback } = view;
  const ExerciseComponent = resolveExerciseComponent(registry, exercise);

  return (
    <div className="flex flex-col gap-lg">
      <LessonProgressBar current={current} total={total} />
      {ExerciseComponent ? (
        <ExerciseComponent
          key={exercise.id}
          exercise={exercise}
          content={content}
          onResult={handlers.onResult}
          isLocked={feedback !== null}
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
        <LessonFeedback feedback={feedback} onContinue={handlers.onContinue} />
      )}
    </div>
  );
};
