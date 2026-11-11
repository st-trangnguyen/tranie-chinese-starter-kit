import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface LessonFeedbackProps {
  isCorrect: boolean;
  /** Chỉ truyền khi trả lời sai và câu có giải thích. */
  explanation?: string;
  onContinue: () => void;
}

/** Kết quả đúng/sai ngay sau khi trả lời, kèm giải thích khi sai (S3.2-AC2, AC3). */
export const LessonFeedback = ({
  isCorrect,
  explanation,
  onContinue,
}: LessonFeedbackProps) => {
  const { t } = useTranslation('lesson');
  const continueRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    continueRef.current?.focus();
  }, []);

  return (
    <section
      role="status"
      className={`lesson-feedback flex flex-col gap-md p-lg ${
        isCorrect ? 'is-correct' : 'is-incorrect'
      }`}
    >
      <p className="lesson-feedback-verdict">
        <span aria-hidden="true">{isCorrect ? '✓ ' : '✗ '}</span>
        {isCorrect ? t('feedback.correct') : t('feedback.incorrect')}
      </p>
      {explanation !== undefined && (
        <p className="lesson-feedback-explanation">{explanation}</p>
      )}
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
