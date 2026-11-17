import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ROUTE_PATHS } from '@core/constants/app.constants';
import { StrokeWritingPad } from '@shared/components/exercises/StrokeWritingPad';
import type { LessonStrokeWriteView } from '@shared/models/lesson-session.model';

interface LessonStrokeWriteProps {
  strokeWrite: LessonStrokeWriteView;
  /** Câu đã có kết quả (đang hiện "Đúng" + "Tiếp tục"). */
  isAnswered: boolean;
  /** Bỏ qua câu viết khi không tải được dữ liệu nét. */
  onSkip: () => void;
}

/**
 * Câu viết (`stroke-write`) trong màn bài (S7.1, D7): khung viết của chữ khi dữ liệu nét sẵn sàng,
 * kèm thông báo khi vừa viết sai nét và liên kết xem thứ tự nét khi câu chưa xong.
 */
export const LessonStrokeWrite = ({
  strokeWrite,
  isAnswered,
  onSkip,
}: LessonStrokeWriteProps) => {
  const { t } = useTranslation(['writing-practice', 'lesson', 'common']);
  const { exerciseId, view, practice, retry, recordStrokeAttempt } =
    strokeWrite;

  if (view.status === 'error') {
    return (
      <div className="flex flex-col items-start gap-md">
        <p role="alert" className="lesson-stroke-write-message">
          {t('common:error.title')}
        </p>
        <div className="flex flex-wrap gap-sm">
          <button type="button" className="btn btn-primary" onClick={retry}>
            {t('common:error.retry')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onSkip}>
            {t('lesson:skip')}
          </button>
        </div>
      </div>
    );
  }

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
