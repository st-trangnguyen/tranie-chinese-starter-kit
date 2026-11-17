import { useTranslation } from 'react-i18next';

import {
  resolveExerciseComponent,
  type ExerciseRegistry,
} from '@shared/components/exercises/exercise.registry';
import type { ExerciseResult } from '@shared/models/exercise.model';
import type { LessonRunnerView } from '@shared/models/lesson-session.model';
import { LessonFeedback } from './LessonFeedback';
import { LessonProgressBar } from './LessonProgressBar';
import { LessonStrokeWrite } from './LessonStrokeWrite';

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
  /** Focus dòng "Câu k / n" khi hiện, sau khi làm lại bài (S3.5). */
  shouldFocusProgress?: boolean;
}

/** Hiện câu hiện tại của bài qua registry, kèm thanh tiến độ và kết quả (S3.2). */
export const LessonRunner = ({
  view,
  registry,
  handlers,
  shouldFocusProgress = false,
}: LessonRunnerProps) => {
  const { t } = useTranslation(['lesson', 'writing-practice']);
  const { exercise, content, current, total, feedback, strokeWrite } = view;
  const ExerciseComponent = resolveExerciseComponent(registry, exercise);

  /** Câu viết đi nhánh riêng, không qua registry (D4); chưa có dữ liệu thì hiện như đang tải. */
  const renderStrokeWrite = () =>
    strokeWrite ? (
      <LessonStrokeWrite
        key={exercise.id}
        strokeWrite={strokeWrite}
        isAnswered={feedback !== null}
      />
    ) : (
      <p role="status">{t('writing-practice:loading')}</p>
    );

  const renderExercise = () =>
    ExerciseComponent ? (
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
    );

  return (
    <div className="flex flex-col gap-lg">
      <LessonProgressBar
        current={current}
        total={total}
        shouldFocusOnMount={shouldFocusProgress}
      />
      {exercise.kind === 'stroke-write'
        ? renderStrokeWrite()
        : renderExercise()}
      {feedback && (
        <LessonFeedback feedback={feedback} onContinue={handlers.onContinue} />
      )}
    </div>
  );
};
