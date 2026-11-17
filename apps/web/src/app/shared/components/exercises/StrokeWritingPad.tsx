import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { StrokeData } from '@csk/shared';

import { useStrokeQuiz } from '@core/hooks/useStrokeQuiz';
import type {
  StrokeAttemptResult,
  WritingPracticeState,
} from '@shared/models/writing-practice.model';

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

  return (
    <figure
      aria-label={t('padLabel', { character })}
      data-completed-stroke-count={practice.completedStrokeCount}
      className="writing-pad flex flex-col"
    >
      <StrokeGlyph strokeData={strokeData} variant="outline">
        <g ref={hostRef} className="writing-pad-writer-host" />
      </StrokeGlyph>
    </figure>
  );
}
