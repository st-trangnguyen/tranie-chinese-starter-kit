import { type RefObject, useEffect } from 'react';
import type { StrokeData } from '@csk/shared';

import {
  createStrokeQuiz,
  type StrokeAttemptEvent,
} from '@core/services/stroke-writer.service';

import { useInitialReducedMotion } from './useInitialReducedMotion';

/**
 * Chấm nét người viết vẽ trong `<g>` host (S6.2 D5). Hook hạ tầng: tạo quiz khi mount, huỷ khi
 * unmount hoặc khi đổi chữ. `onAttempt` phải ổn định (`useCallback` ở hook trang) để không tạo lại
 * writer mỗi lần render. Giảm chuyển động chốt lúc mount.
 */
export function useStrokeQuiz(
  hostRef: RefObject<SVGGElement | null>,
  character: string,
  strokeData: StrokeData,
  onAttempt: (event: StrokeAttemptEvent) => void,
): void {
  const isReducedMotion = useInitialReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return undefined;
    }
    const quiz = createStrokeQuiz(host, character, strokeData, {
      isReducedMotion,
      onAttempt,
    });
    return () => {
      quiz.destroy();
    };
  }, [hostRef, character, strokeData, onAttempt, isReducedMotion]);
}
