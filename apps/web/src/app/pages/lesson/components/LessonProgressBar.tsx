import { useTranslation } from 'react-i18next';

interface LessonProgressBarProps {
  /** Câu đang làm, tính từ 1. */
  current: number;
  total: number;
}

/** Thanh tiến độ "Câu k / n" (S3.2-AC1). */
export const LessonProgressBar = ({
  current,
  total,
}: LessonProgressBarProps) => {
  const { t } = useTranslation('lesson');
  const label = t('progress', { current, total });

  return (
    <div className="lesson-progress flex flex-col gap-xs">
      <p className="lesson-progress-label">{label}</p>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        className="lesson-progress-track"
      >
        <div
          className="lesson-progress-fill"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
};
