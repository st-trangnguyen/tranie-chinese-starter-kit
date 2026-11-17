import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { StrokeData } from '@csk/shared';

import { useStrokeQuiz } from '@core/hooks/useStrokeQuiz';
import type {
  StrokeAttemptResult,
  WritingPracticeState,
} from '@shared/models/writing-practice.model';
import { STROKE_PATH_TRANSFORM } from '@shared/utils/stroke.utils';

import { StrokeGlyph } from '../StrokeGlyph';

interface StrokeWritingPadProps {
  character: string;
  strokeData: StrokeData;
  practice: WritingPracticeState;
  onStrokeAttempt: (result: StrokeAttemptResult) => void;
}

/**
 * Khung viết chữ theo nét (S6.2 D6): nét mờ cả chữ, host `<g>` để adapter gắn writer chấm nét.
 * Chỉ nhận props; chấm nét qua `useStrokeQuiz` (core/hooks).
 */
export function StrokeWritingPad({
  character,
  strokeData,
  practice,
  onStrokeAttempt,
}: StrokeWritingPadProps) {
  const { t } = useTranslation('writing-practice');
  const hostRef = useRef<SVGGElement>(null);
  useStrokeQuiz(hostRef, character, strokeData, onStrokeAttempt);
  const hintStrokeIndex =
    practice.isHintVisible && !practice.isComplete
      ? practice.completedStrokeCount
      : null;

  return (
    <figure
      tabIndex={0}
      aria-label={t('padLabel', { character })}
      data-completed-stroke-count={practice.completedStrokeCount}
      data-hint-stroke-index={hintStrokeIndex ?? undefined}
      className="writing-pad flex flex-col"
    >
      <StrokeGlyph strokeData={strokeData} variant="outline">
        {hintStrokeIndex !== null && (
          <g transform={STROKE_PATH_TRANSFORM} className="writing-pad-hint">
            <path d={strokeData.strokes[hintStrokeIndex]} />
          </g>
        )}
        <g ref={hostRef} className="writing-pad-writer-host" />
      </StrokeGlyph>
    </figure>
  );
}
