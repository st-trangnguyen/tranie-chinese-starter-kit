import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { StrokeData } from '@csk/shared';

import {
  createStrokeWriter,
  type StrokeWriter,
} from '@core/services/stroke-writer.service';

export interface StrokeAnimation {
  drawnStrokeCount: number;
  replay: () => void;
}

interface StrokeRun {
  writer: StrokeWriter;
  strokeCount: number;
  runIdRef: RefObject<number>;
  setDrawnStrokeCount: Dispatch<SetStateAction<number>>;
}

/**
 * Một lượt phát (D6): `runId` mới, xoá nét đã vẽ, vẽ tuần tự từ nét 0. Mỗi nét chỉ bắt đầu sau khi
 * nét trước resolve, nên không bao giờ có hai nét cùng vẽ. Lượt dừng khi `runId` đã đổi (lượt mới,
 * đổi chữ, unmount) hoặc nét bị huỷ.
 */
function startStrokeRun({
  writer,
  strokeCount,
  runIdRef,
  setDrawnStrokeCount,
}: StrokeRun): void {
  runIdRef.current += 1;
  const runId = runIdRef.current;
  writer.clear();
  setDrawnStrokeCount(0);

  const play = async (): Promise<void> => {
    for (let index = 0; index < strokeCount; index += 1) {
      const result = await writer.animateStroke(index);
      if (runIdRef.current !== runId || result === 'cancelled') {
        return;
      }
      setDrawnStrokeCount(index + 1);
    }
  };
  void play();
}

/**
 * Phát animation thứ tự nét vào `<g>` đích (S6.1 D6). Hook hạ tầng: tạo writer, tự phát một lần
 * khi mount, huỷ writer khi unmount hoặc khi đổi chữ. `replay()` là event handler bắt đầu lượt mới.
 */
export function useStrokeAnimation(
  targetRef: RefObject<SVGGElement | null>,
  character: string,
  strokeData: StrokeData,
): StrokeAnimation {
  const [drawnStrokeCount, setDrawnStrokeCount] = useState(0);
  const writerRef = useRef<StrokeWriter | null>(null);
  const runIdRef = useRef(0);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) {
      return undefined;
    }
    const writer = createStrokeWriter(target, character, strokeData);
    writerRef.current = writer;
    startStrokeRun({
      writer,
      strokeCount: strokeData.strokes.length,
      runIdRef,
      setDrawnStrokeCount,
    });

    return () => {
      runIdRef.current += 1;
      writerRef.current = null;
      writer.destroy();
    };
  }, [targetRef, character, strokeData]);

  const replay = (): void => {
    const writer = writerRef.current;
    if (!writer) {
      return;
    }
    startStrokeRun({
      writer,
      strokeCount: strokeData.strokes.length,
      runIdRef,
      setDrawnStrokeCount,
    });
  };

  return { drawnStrokeCount, replay };
}
