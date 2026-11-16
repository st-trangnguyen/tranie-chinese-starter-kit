import { type RefObject, useEffect, useState } from 'react';
import type { StrokeData } from '@csk/shared';

import { createStrokeWriter } from '@core/services/stroke-writer.service';

export interface StrokeAnimation {
  drawnStrokeCount: number;
}

/**
 * Phát animation thứ tự nét vào `<g>` đích (S6.1 D6). Hook hạ tầng: tạo writer, tự phát một lần
 * khi mount, huỷ writer khi unmount hoặc khi đổi chữ.
 */
export function useStrokeAnimation(
  targetRef: RefObject<SVGGElement | null>,
  character: string,
  strokeData: StrokeData,
): StrokeAnimation {
  const [drawnStrokeCount, setDrawnStrokeCount] = useState(0);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) {
      return undefined;
    }
    const writer = createStrokeWriter(target, character, strokeData);
    let isActive = true;

    // Mỗi nét chỉ bắt đầu sau khi nét trước resolve, nên không bao giờ có hai nét cùng vẽ.
    const play = async (): Promise<void> => {
      for (let index = 0; index < strokeData.strokes.length; index += 1) {
        const result = await writer.animateStroke(index);
        if (!isActive || result === 'cancelled') {
          return;
        }
        setDrawnStrokeCount(index + 1);
      }
    };
    void play();

    return () => {
      isActive = false;
      writer.destroy();
    };
  }, [targetRef, character, strokeData]);

  return { drawnStrokeCount };
}
