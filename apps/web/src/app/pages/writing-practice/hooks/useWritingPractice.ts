import { useCallback, useEffect, useMemo, useState } from 'react';

import type { StrokeOrderView } from '@shared/models/stroke-order.model';
import type {
  StrokeAttemptResult,
  WritingPracticeState,
} from '@shared/models/writing-practice.model';
import { WritingPracticeService } from '@shared/services/writing-practice.service';

export interface WritingPracticeScreenState {
  view: StrokeOrderView;
  /** Lượt viết hiện tại; `null` khi chưa có dữ liệu nét. */
  practice: WritingPracticeState | null;
  retry: () => void;
  recordStrokeAttempt: (result: StrokeAttemptResult) => void;
}

/** Nạp chữ cần luyện viết (S6.2, D7) và giữ lượt viết bắt đầu khi dữ liệu nét sẵn sàng. */
export const useWritingPractice = (
  character: string,
): WritingPracticeScreenState => {
  const writingPracticeService = useMemo(
    () => new WritingPracticeService(),
    [],
  );
  const [view, setView] = useState<StrokeOrderView>({ status: 'loading' });
  const [practice, setPractice] = useState<WritingPracticeState | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isActive = true;
    writingPracticeService
      .loadCharacter(character)
      .then((result) => {
        if (!isActive) {
          return;
        }
        if (result.status !== 'available') {
          setView({ status: 'unavailable' });
          return;
        }
        setView({
          status: 'ready',
          character: result.character,
          strokeData: result.strokeData,
        });
        setPractice(
          writingPracticeService.startPractice(
            result.strokeData.strokes.length,
          ),
        );
      })
      .catch(() => {
        if (isActive) {
          setView({ status: 'error' });
        }
      });
    return () => {
      isActive = false;
    };
  }, [writingPracticeService, character, attempt]);

  /** Tải lại dữ liệu nét: mỗi lần là một lượt đọc file mới, không giữ kết quả lỗi. */
  const retry = useCallback(() => {
    setView({ status: 'loading' });
    setAttempt((previous) => previous + 1);
  }, []);

  /** Ổn định giữa các lần render để khung không tạo lại writer chấm nét. */
  const recordStrokeAttempt = useCallback(
    (result: StrokeAttemptResult) => {
      setPractice(
        (previous) =>
          previous &&
          writingPracticeService.recordStrokeAttempt(previous, result),
      );
    },
    [writingPracticeService],
  );

  return { view, practice, retry, recordStrokeAttempt };
};
