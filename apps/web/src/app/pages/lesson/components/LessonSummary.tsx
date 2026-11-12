import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { LessonSummary as LessonSummaryData } from '@shared/models/lesson-session.model';
import { formatDuration } from '@shared/utils/duration.utils';

interface LessonSummaryProps {
  summary: LessonSummaryData;
  isSaved: boolean;
}

/** Màn tổng kết bài (S3.4-AC1): thay màn hết bài của S3.2, tiêu đề vẫn nhận focus. */
export const LessonSummary = ({ summary, isSaved }: LessonSummaryProps) => {
  const { t } = useTranslation('lesson');
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section className="lesson-summary flex flex-col gap-lg">
      <h2 ref={headingRef} tabIndex={-1} className="lesson-summary-title">
        {summary.skippedCount > 0
          ? t('finishedWithSkipped', { count: summary.skippedCount })
          : t('finished')}
      </h2>
      <dl className="lesson-summary-list flex flex-col gap-md">
        <div className="lesson-summary-item flex flex-col gap-sm">
          <dt className="lesson-summary-label">{t('summary.score')}</dt>
          <dd className="lesson-summary-score">{`${summary.scorePercent}%`}</dd>
          <dd className="lesson-summary-value">
            {t('summary.correct', {
              correct: summary.correctCount,
              answered: summary.answeredCount,
            })}
          </dd>
        </div>{' '}
        <div className="lesson-summary-item flex flex-col gap-sm">
          <dt className="lesson-summary-label">{t('summary.time')}</dt>{' '}
          <dd className="lesson-summary-value">
            {formatDuration(summary.elapsedSeconds)}
          </dd>
        </div>{' '}
        <div className="lesson-summary-item flex flex-col gap-sm">
          <dt className="lesson-summary-label">{t('summary.wrongLabel')}</dt>
          <dd className="lesson-summary-value">
            {t('summary.wrong', { count: summary.wrongCount })}
          </dd>
        </div>
      </dl>
      {!isSaved && (
        <p role="alert" className="lesson-summary-warning p-md">
          {t('summary.notSaved')}
        </p>
      )}
    </section>
  );
};
