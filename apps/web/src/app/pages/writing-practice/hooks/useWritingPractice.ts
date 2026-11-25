import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { StrokeOrderView } from '@shared/models/stroke-order.model';
import type {
  StrokeAttemptResult,
  WritingPracticeState,
} from '@shared/models/writing-practice.model';
import { SrsService } from '@shared/services/srs.service';
import { WritingPracticeService } from '@shared/services/writing-practice.service';

export interface WritingPracticeScreenState {
  view: StrokeOrderView;
  /** Lượt viết hiện tại; `null` khi chưa có dữ liệu nét. */
  practice: WritingPracticeState | null;
  /** Đổi mỗi lần Viết lại; container dùng làm `key` để dựng khung viết mới. */
  padKey: number;
  retry: () => void;
  recordStrokeAttempt: (result: StrokeAttemptResult) => void;
  restart: () => void;
}

/** Nạp chữ cần luyện viết (S6.2, D7) và giữ lượt viết bắt đầu khi dữ liệu nét sẵn sàng. */
export const useWritingPractice = (
  character: string,
): WritingPracticeScreenState => {
  const writingPracticeService = useMemo(
    () => new WritingPracticeService(),
    [],
  );
  const srsService = useMemo(() => new SrsService(), []);
  const [view, setView] = useState<StrokeOrderView>({ status: 'loading' });
  const [practice, setPractice] = useState<WritingPracticeState | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [padKey, setPadKey] = useState(0);
  /** Lượt viết mới nhất, gán đồng bộ trong handler để hai sự kiện liền nhau tính từ lượt mới. */
  const practiceRef = useRef<WritingPracticeState | null>(null);

  useEffect(() => {
    practiceRef.current = null;
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
        const started = writingPracticeService.startPractice(
          result.strokeData.strokes.length,
        );
        practiceRef.current = started;
        setPractice(started);
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
      const previous = practiceRef.current;
      if (!previous || view.status !== 'ready') {
        return;
      }
      const next = writingPracticeService.recordStrokeAttempt(previous, result);
      practiceRef.current = next;
      setPractice(next);
      if (writingPracticeService.hasJustCompleted(previous, next)) {
        // Lỗi ghi chữ đã viết / thẻ viết không báo cho người học (D5).
        srsService
          .recordCharacterWriting({ character: view.character, isGuided: true })
          .catch(() => undefined);
      }
    },
    [writingPracticeService, srsService, view],
  );

  /** Viết lại chữ vừa xong: lượt mới từ nét đầu và khung viết mới (writer cũ bị huỷ cùng khung cũ). */
  const restart = useCallback(() => {
    if (view.status !== 'ready') {
      return;
    }
    const started = writingPracticeService.startPractice(
      view.strokeData.strokes.length,
    );
    practiceRef.current = started;
    setPractice(started);
    setPadKey((previous) => previous + 1);
  }, [writingPracticeService, view]);

  return { view, practice, padKey, retry, recordStrokeAttempt, restart };
};
