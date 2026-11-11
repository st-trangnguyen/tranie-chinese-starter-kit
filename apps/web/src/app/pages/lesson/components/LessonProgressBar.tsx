import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface LessonProgressBarProps {
  /** Câu đang làm, tính từ 1. */
  current: number;
  total: number;
}

/**
 * Thanh tiến độ "Câu k / n" (S3.2-AC1). Giá trị của thanh là số câu đã xong (k - 1).
 * Khi sang câu mới, focus chuyển về dòng chữ để người dùng bàn phím/trình đọc màn hình
 * biết đang ở câu nào, không rơi về đầu trang.
 */
export const LessonProgressBar = ({
  current,
  total,
}: LessonProgressBarProps) => {
  const { t } = useTranslation('lesson');
  const label = t('progress', { current, total });
  const finished = Math.max(current - 1, 0);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const shownCurrent = useRef(current);

  useEffect(() => {
    if (shownCurrent.current !== current) {
      shownCurrent.current = current;
      labelRef.current?.focus();
    }
  }, [current]);

  return (
    <div className="lesson-progress flex flex-col gap-xs">
      <p ref={labelRef} tabIndex={-1} className="lesson-progress-label">
        {label}
      </p>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={finished}
        className="lesson-progress-track"
      >
        <div
          className="lesson-progress-fill"
          style={{ width: `${(finished / total) * 100}%` }}
        />
      </div>
    </div>
  );
};
