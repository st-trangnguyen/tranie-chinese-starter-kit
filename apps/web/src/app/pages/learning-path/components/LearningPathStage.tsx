import type { ReactNode } from 'react';
import type { Unit } from '@csk/shared';

interface LearningPathStageProps {
  title: string;
  units: readonly Unit[];
  renderLesson: (lessonId: string) => ReactNode;
  /** Khối hành động của chủ đề (audio offline, kiểm tra vượt cấp), ngay dưới tiêu đề. */
  renderUnitActions: (unit: Unit) => ReactNode;
}

/** Một giai đoạn của lộ trình: tiêu đề, các nhóm và danh sách bài theo thứ tự. */
export function LearningPathStage({
  title,
  units,
  renderLesson,
  renderUnitActions,
}: LearningPathStageProps) {
  return (
    <section className="flex flex-col gap-lg">
      <h2 className="learning-path-stage-title">{title}</h2>
      {units.map((unit) => (
        <section key={unit.id} className="flex flex-col gap-sm">
          <h3 className="learning-path-unit-title">{unit.title}</h3>
          {renderUnitActions(unit)}
          <ol className="flex flex-col gap-sm">
            {unit.lessonIds.map(renderLesson)}
          </ol>
        </section>
      ))}
    </section>
  );
}
