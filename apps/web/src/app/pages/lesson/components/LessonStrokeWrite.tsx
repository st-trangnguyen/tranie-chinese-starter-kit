import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ROUTE_PATHS } from '@core/constants/app.constants';
import { StrokeWritingPad } from '@shared/components/exercises/StrokeWritingPad';
import type { LessonStrokeWriteView } from '@shared/models/lesson-session.model';

interface LessonStrokeWriteProps {
  strokeWrite: LessonStrokeWriteView;
  /** Câu đã có kết quả (đang hiện "Đúng" + "Tiếp tục"). */
  isAnswered: boolean;
}

/**
 * Câu viết (`stroke-write`) trong màn bài (S7.1, D7): khung viết của chữ khi dữ liệu nét sẵn sàng,
 * kèm thông báo khi vừa viết sai nét và liên kết xem thứ tự nét khi câu chưa xong.
 */
export const LessonStrokeWrite = ({
  strokeWrite,
  isAnswered,
}: LessonStrokeWriteProps) => {
  const { t } = useTranslation('writing-practice');
  const { exerciseId, view, practice, recordStrokeAttempt } = strokeWrite;

  if (view.status === 'ready' && practice) {
    const isMistake =
      practice.lastAttempt === 'mistake' && !practice.isComplete;
    const canViewStrokeOrder = !isAnswered && !practice.isComplete;
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
        {canViewStrokeOrder && (
          <Link
            to={ROUTE_PATHS.strokeOrder(view.character)}
            className="lesson-stroke-write-link"
          >
            {t('strokeOrderLink')}
          </Link>
        )}
      </div>
    );
  }
  return <p role="status">{t('loading')}</p>;
};
