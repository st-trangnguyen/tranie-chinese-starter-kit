import { useTranslation } from 'react-i18next';

import { StrokeWritingPad } from '@shared/components/exercises/StrokeWritingPad';
import type { LessonStrokeWriteView } from '@shared/models/lesson-session.model';

interface LessonStrokeWriteProps {
  strokeWrite: LessonStrokeWriteView;
}

/** Câu viết (`stroke-write`) trong màn bài (S7.1, D7): khung viết của chữ khi dữ liệu nét sẵn sàng. */
export const LessonStrokeWrite = ({ strokeWrite }: LessonStrokeWriteProps) => {
  const { t } = useTranslation('writing-practice');
  const { exerciseId, view, practice, recordStrokeAttempt } = strokeWrite;

  if (view.status === 'ready' && practice) {
    return (
      <StrokeWritingPad
        key={exerciseId}
        character={view.character}
        strokeData={view.strokeData}
        practice={practice}
        onStrokeAttempt={recordStrokeAttempt}
      />
    );
  }
  return <p role="status">{t('loading')}</p>;
};
