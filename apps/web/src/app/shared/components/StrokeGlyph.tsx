import type { ReactNode } from 'react';
import type { StrokeData } from '@csk/shared';

import {
  STROKE_PATH_TRANSFORM,
  STROKE_VIEWBOX,
} from '@shared/utils/stroke.utils';

type StrokeGlyphVariant = 'outline' | 'solid';

const VARIANT_CLASS_NAMES: Record<StrokeGlyphVariant, string> = {
  outline: 'stroke-order-outline',
  solid: 'stroke-order-stroke',
};

interface StrokeGlyphProps {
  strokeData: StrokeData;
  variant: StrokeGlyphVariant;
  children?: ReactNode;
}

export function StrokeGlyph({
  strokeData,
  variant,
  children,
}: StrokeGlyphProps) {
  return (
    <svg
      viewBox={STROKE_VIEWBOX}
      aria-hidden="true"
      className="block w-full h-auto"
    >
      <g
        transform={STROKE_PATH_TRANSFORM}
        className={VARIANT_CLASS_NAMES[variant]}
      >
        {strokeData.strokes.map((stroke, index) => (
          <path key={`${index}-${stroke}`} d={stroke} />
        ))}
      </g>
      {children}
    </svg>
  );
}
