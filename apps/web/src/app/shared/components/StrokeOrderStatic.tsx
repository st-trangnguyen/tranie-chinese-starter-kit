import { useTranslation } from 'react-i18next';
import type { StrokeData } from '@csk/shared';

import { strokeLabelPoint } from '@shared/utils/stroke.utils';

import { StrokeGlyph } from './StrokeGlyph';

interface StrokeOrderStaticProps {
  character: string;
  strokeData: StrokeData;
}

export function StrokeOrderStatic({
  character,
  strokeData,
}: StrokeOrderStaticProps) {
  const { t } = useTranslation('stroke-order');

  return (
    <figure
      role="img"
      aria-label={t('figureLabel', { character })}
      className="stroke-order-figure flex flex-col"
    >
      <StrokeGlyph strokeData={strokeData} variant="solid">
        {strokeData.medians.map((median, index) => {
          const { x, y } = strokeLabelPoint(median);
          return (
            <text
              key={`${index}-${x}-${y}`}
              x={x}
              y={y}
              className="stroke-order-label"
            >
              {index + 1}
            </text>
          );
        })}
      </StrokeGlyph>
    </figure>
  );
}
