import { useTranslation } from 'react-i18next';

import type { WritingPracticeState } from '@shared/models/writing-practice.model';

interface WritingPracticeFeedbackProps {
  character: string;
  practice: WritingPracticeState;
  onRestart: () => void;
}

/**
 * Phản hồi của lượt viết (S6.2, D7): báo đã viết xong chữ kèm nút "Viết lại",
 * hoặc báo ngay khi vừa viết sai nét hiện tại.
 */
export function WritingPracticeFeedback({
  character,
  practice,
  onRestart,
}: WritingPracticeFeedbackProps) {
  const { t } = useTranslation('writing-practice');

  const handleRestart = () => {
    onRestart();
  };

  if (practice.isComplete) {
    return (
      <div className="flex flex-col items-start gap-md">
        <p role="status" className="writing-practice-message">
          {t('complete', { character })}
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleRestart}
        >
          {t('restart')}
        </button>
      </div>
    );
  }
  if (practice.lastAttempt === 'mistake') {
    return (
      <p
        key={practice.mistakeSerial}
        role="alert"
        className="writing-practice-message"
      >
        {t('mistake')}
      </p>
    );
  }
  return null;
}
