import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ExerciseResult } from '@shared/models/exercise.model';
import type { LessonStrokeWriteView } from '@shared/models/lesson-session.model';
import type { StrokeOrderView } from '@shared/models/stroke-order.model';
import type {
  StrokeAttemptResult,
  WritingPracticeState,
} from '@shared/models/writing-practice.model';
import { SrsService } from '@shared/services/srs.service';
import { WritingPracticeService } from '@shared/services/writing-practice.service';

/** State đã nạp, gắn với câu đã nạp để đổi câu không lẫn state cũ. */
interface LoadedStrokeWrite {
  exerciseId: string;
  view: StrokeOrderView;
  practice: WritingPracticeState | null;
}

const LOADING_VIEW: StrokeOrderView = { status: 'loading' };

/**
 * Câu viết trong màn bài (S7.1, D6): nạp dữ liệu nét của chữ và giữ lượt viết.
 * `exerciseId` hoặc `character` null (câu không phải câu viết) thì trả `null`, không nạp gì.
 */
export const useLessonStrokeWrite = (
  exerciseId: string | null,
  character: string | null,
  onResult: (result: ExerciseResult) => void,
): LessonStrokeWriteView | null => {
  const writingPracticeService = useMemo(
    () => new WritingPracticeService(),
    [],
  );
  const srsService = useMemo(() => new SrsService(), []);
  const [loaded, setLoaded] = useState<LoadedStrokeWrite | null>(null);
  const [attempt, setAttempt] = useState(0);
  /** Lượt viết mới nhất, gán đồng bộ trong handler để hai sự kiện liền nhau tính từ lượt mới. */
  const practiceRef = useRef<WritingPracticeState | null>(null);

  useEffect(() => {
    practiceRef.current = null;
    if (exerciseId === null || character === null) {
      return undefined;
    }
    let isActive = true;
    writingPracticeService
      .loadCharacter(character)
      .then((result) => {
        if (!isActive) {
          return;
        }
        if (result.status !== 'available') {
          setLoaded({
            exerciseId,
            view: { status: 'unavailable' },
            practice: null,
          });
          return;
        }
        const practice = writingPracticeService.startPractice(
          result.strokeData.strokes.length,
        );
        practiceRef.current = practice;
        setLoaded({
          exerciseId,
          view: {
            status: 'ready',
            character: result.character,
            strokeData: result.strokeData,
          },
          practice,
        });
      })
      .catch(() => {
        if (isActive) {
          setLoaded({ exerciseId, view: { status: 'error' }, practice: null });
        }
      });
    return () => {
      isActive = false;
    };
  }, [writingPracticeService, exerciseId, character, attempt]);

  /** Tải lại dữ liệu nét: mỗi lần là một lượt đọc file mới. */
  const retry = useCallback(() => {
    setLoaded(null);
    setAttempt((previous) => previous + 1);
  }, []);

  /** Ổn định giữa các lần render để khung không tạo lại writer chấm nét. */
  const recordStrokeAttempt = useCallback(
    (result: StrokeAttemptResult) => {
      const previous = practiceRef.current;
      if (!previous || character === null) {
        return;
      }
      const next = writingPracticeService.recordStrokeAttempt(previous, result);
      practiceRef.current = next;
      setLoaded((current) => current && { ...current, practice: next });
      const lessonResult = writingPracticeService.lessonResultOf(
        previous,
        next,
      );
      if (lessonResult) {
        // Lỗi ghi chữ đã viết / thẻ viết không báo cho người học (D5).
        srsService
          .recordCharacterWriting({ character, isGuided: true })
          .catch(() => undefined);
        onResult(lessonResult);
      }
    },
    [writingPracticeService, srsService, character, onResult],
  );

  if (exerciseId === null || character === null) {
    return null;
  }
  const isCurrent = loaded?.exerciseId === exerciseId;
  return {
    exerciseId,
    character,
    view: isCurrent ? loaded.view : LOADING_VIEW,
    practice: isCurrent ? loaded.practice : null,
    retry,
    recordStrokeAttempt,
  };
};
