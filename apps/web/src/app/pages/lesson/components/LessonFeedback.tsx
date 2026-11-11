import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { LessonFeedbackView } from '@shared/models/lesson-session.model';

interface LessonFeedbackProps {
  feedback: LessonFeedbackView;
  onContinue: () => void;
}

/** Kết quả đúng/sai ngay sau khi trả lời, kèm giải thích khi sai (S3.2-AC2, AC3). */
export const LessonFeedback = ({
  feedback,
  onContinue,
}: LessonFeedbackProps) => {
  const { t } = useTranslation('lesson');
  const continueRef = useRef<HTMLButtonElement>(null);
  const { isCorrect, explanation } = feedback;

  useEffect(() => {
    continueRef.current?.focus();
  }, []);

  return (
    <section
      className={`lesson-feedback flex flex-col gap-md p-lg ${
        isCorrect ? 'is-correct' : 'is-incorrect'
      }`}
    >
      <div role="status" className="flex flex-col gap-md">
        <p className="lesson-feedback-verdict">
          <span aria-hidden="true">{isCorrect ? '✓ ' : '✗ '}</span>
          {isCorrect ? t('feedback.correct') : t('feedback.incorrect')}
        </p>
        {explanation !== undefined && (
          <p className="lesson-feedback-explanation">{explanation}</p>
        )}
      </div>
      <button
        ref={continueRef}
        type="button"
        className="btn btn-primary"
        onClick={onContinue}
      >
        {t('feedback.continue')}
      </button>
    </section>
  );
};
