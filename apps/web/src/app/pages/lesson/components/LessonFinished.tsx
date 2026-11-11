import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface LessonFinishedProps {
  skippedCount: number;
}

/** Màn hết bài (S3.2-AC1, S3.2-X1): báo bỏ qua riêng, không báo "đã làm xong". */
export const LessonFinished = ({ skippedCount }: LessonFinishedProps) => {
  const { t } = useTranslation('lesson');
  const messageRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    messageRef.current?.focus();
  }, []);

  return (
    <p ref={messageRef} tabIndex={-1} className="lesson-finished">
      {skippedCount > 0
        ? t('finishedWithSkipped', { count: skippedCount })
        : t('finished')}
    </p>
  );
};
