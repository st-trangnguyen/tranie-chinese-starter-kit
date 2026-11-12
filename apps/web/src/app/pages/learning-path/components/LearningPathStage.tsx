import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Unit } from '@csk/shared';

import { ROUTE_PATHS } from '@core/constants/app.constants';

interface LearningPathStageProps {
  title: string;
  units: readonly Unit[];
  renderLesson: (lessonId: string) => ReactNode;
  placementTestUnitIds: ReadonlySet<string>;
}

/** Một giai đoạn của lộ trình: tiêu đề, các nhóm và danh sách bài theo thứ tự. */
export function LearningPathStage({
  title,
  units,
  renderLesson,
  placementTestUnitIds,
}: LearningPathStageProps) {
  const { t } = useTranslation('learning-path');

  return (
    <section className="flex flex-col gap-lg">
      <h2 className="learning-path-stage-title">{title}</h2>
      {units.map((unit) => (
        <section key={unit.id} className="flex flex-col gap-sm">
          <h3 className="learning-path-unit-title">{unit.title}</h3>
          {placementTestUnitIds.has(unit.id) && (
            <Link
              to={ROUTE_PATHS.placementTest(unit.id)}
              className="unit-placement-link p-md"
            >
              {t('placementTest')}
            </Link>
          )}
          <ol className="flex flex-col gap-sm">
            {unit.lessonIds.map(renderLesson)}
          </ol>
        </section>
      ))}
    </section>
  );
}
