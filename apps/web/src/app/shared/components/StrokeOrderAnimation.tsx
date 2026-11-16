import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { StrokeData } from '@csk/shared';

import { useStrokeAnimation } from '@core/hooks/useStrokeAnimation';

import { StrokeGlyph } from './StrokeGlyph';

interface StrokeOrderAnimationProps {
  character: string;
  strokeData: StrokeData;
}

export function StrokeOrderAnimation({
  character,
  strokeData,
}: StrokeOrderAnimationProps) {
  const { t } = useTranslation('stroke-order');
  const targetRef = useRef<SVGGElement>(null);
  const { drawnStrokeCount } = useStrokeAnimation(
    targetRef,
    character,
    strokeData,
  );

  return (
    <figure
      role="img"
      aria-label={t('figureLabel', { character })}
      data-drawn-stroke-count={drawnStrokeCount}
      className="stroke-order-figure flex flex-col"
    >
      <StrokeGlyph strokeData={strokeData} variant="outline">
        <g ref={targetRef} className="stroke-order-writer" />
      </StrokeGlyph>
    </figure>
  );
}
