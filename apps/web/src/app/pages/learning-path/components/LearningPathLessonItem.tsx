import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { LessonStatus } from '@csk/shared';

import { ROUTE_PATHS } from '@core/constants/app.constants';

interface LearningPathLessonItemProps {
  lessonId: string;
  title: string;
  status: LessonStatus;
}

const STATUS_ICONS: Record<LessonStatus, string> = {
  completed: '✓',
  open: '▶',
  locked: '🔒',
};

const ITEM_LAYOUT = 'flex items-center gap-md p-md';

/** Một bài trên bản đồ: bài khóa không phải liên kết nên bấm không vào được (S3.1 AC3). */
export function LearningPathLessonItem({
  lessonId,
  title,
  status,
}: LearningPathLessonItemProps) {
  const { t } = useTranslation('learning-path');

  const content = (
    <>
      <span aria-hidden="true" className="learning-path-lesson-icon">
        {STATUS_ICONS[status]}
      </span>
      <span className="learning-path-lesson-title flex-1">{title}</span>
      <span className="learning-path-lesson-status">
        {t(`status.${status}`)}
      </span>
    </>
  );

  return (
    <li className={`learning-path-lesson is-${status}`}>
      {status === 'locked' ? (
        <div className={ITEM_LAYOUT}>{content}</div>
      ) : (
        <Link
          to={ROUTE_PATHS.lesson(lessonId)}
          className={`learning-path-lesson-link ${ITEM_LAYOUT}`}
        >
          {content}
        </Link>
      )}
    </li>
  );
}
