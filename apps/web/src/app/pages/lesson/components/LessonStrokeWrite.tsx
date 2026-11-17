import { useTranslation } from 'react-i18next';

import { StrokeWritingPad } from '@shared/components/exercises/StrokeWritingPad';
import type { LessonStrokeWriteView } from '@shared/models/lesson-session.model';

interface LessonStrokeWriteProps {
  strokeWrite: LessonStrokeWriteView;
}

/**
 * Câu viết (`stroke-write`) trong màn bài (S7.1, D7): khung viết của chữ khi dữ liệu nét sẵn sàng,
 * kèm thông báo khi vừa viết sai nét.
 */
export const LessonStrokeWrite = ({ strokeWrite }: LessonStrokeWriteProps) => {
  const { t } = useTranslation('writing-practice');
  const { exerciseId, view, practice, recordStrokeAttempt } = strokeWrite;

  if (view.status === 'ready' && practice) {
    const isMistake =
      practice.lastAttempt === 'mistake' && !practice.isComplete;
    return (
      <div className="flex flex-col items-center gap-md">
        <StrokeWritingPad
          key={exerciseId}
          character={view.character}
          strokeData={view.strokeData}
          practice={practice}
          onStrokeAttempt={recordStrokeAttempt}
        />
        {isMistake && (
          <p
            key={practice.mistakeSerial}
            role="alert"
            className="lesson-stroke-write-message"
          >
            {t('mistake')}
          </p>
        )}
      </div>
    );
  }
  return <p role="status">{t('loading')}</p>;
};
