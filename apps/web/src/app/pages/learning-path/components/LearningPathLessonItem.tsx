import { useTranslation } from 'react-i18next';
import type { LessonStatus } from '@csk/shared';

interface LearningPathLessonItemProps {
  title: string;
  status: LessonStatus;
}

const STATUS_ICONS: Record<LessonStatus, string> = {
  completed: '✓',
  open: '▶',
  locked: '🔒',
};

export function LearningPathLessonItem({
  title,
  status,
}: LearningPathLessonItemProps) {
  const { t } = useTranslation('learning-path');

  return (
    <li
      className={`learning-path-lesson is-${status} flex items-center gap-md p-md`}
    >
      <span aria-hidden="true" className="learning-path-lesson-icon">
        {STATUS_ICONS[status]}
      </span>
      <span className="learning-path-lesson-title flex-1">{title}</span>
      <span className="learning-path-lesson-status">
        {t(`status.${status}`)}
      </span>
    </li>
  );
}
