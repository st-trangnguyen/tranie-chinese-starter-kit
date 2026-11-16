import { useEffect, useMemo, useState } from 'react';

import type { StrokeOrderView } from '@shared/models/stroke-order.model';
import { StrokeOrderService } from '@shared/services/stroke-order.service';

export interface StrokeOrderState {
  view: StrokeOrderView;
}

/** Nạp dữ liệu nét của một chữ (S6.1); `view` giữ trong state nên `strokeData` ổn định giữa các lần render. */
export const useStrokeOrder = (character: string): StrokeOrderState => {
  const strokeOrderService = useMemo(() => new StrokeOrderService(), []);
  const [view, setView] = useState<StrokeOrderView>({ status: 'loading' });

  useEffect(() => {
    let isActive = true;
    strokeOrderService
      .getStrokeOrder(character)
      .then((result) => {
        if (!isActive) {
          return;
        }
        setView(
          result.status === 'available'
            ? {
                status: 'ready',
                character: result.character,
                strokeData: result.strokeData,
              }
            : { status: 'unavailable' },
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
  }, [strokeOrderService, character]);

  return { view };
};
