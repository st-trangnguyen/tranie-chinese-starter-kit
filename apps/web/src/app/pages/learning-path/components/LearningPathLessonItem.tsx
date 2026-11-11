interface LearningPathLessonItemProps {
  title: string;
}

export function LearningPathLessonItem({ title }: LearningPathLessonItemProps) {
  return (
    <li className="learning-path-lesson flex items-center gap-md p-md">
      <span className="learning-path-lesson-title flex-1">{title}</span>
    </li>
  );
}
