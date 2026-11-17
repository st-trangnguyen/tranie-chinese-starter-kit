import { useTranslation } from 'react-i18next';

import type { WritingPracticeState } from '@shared/models/writing-practice.model';

interface WritingPracticeFeedbackProps {
  practice: WritingPracticeState;
}

/** Phản hồi của lượt viết (S6.2, D7): báo ngay khi vừa viết sai nét hiện tại. */
export function WritingPracticeFeedback({
  practice,
}: WritingPracticeFeedbackProps) {
  const { t } = useTranslation('writing-practice');

  if (practice.lastAttempt === 'mistake') {
    return (
      <p role="alert" className="writing-practice-message">
        {t('mistake')}
      </p>
    );
  }
  return null;
}
