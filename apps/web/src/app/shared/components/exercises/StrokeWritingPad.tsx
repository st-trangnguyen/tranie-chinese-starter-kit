import type { StrokeData } from '@csk/shared';

import type {
  StrokeAttemptResult,
  WritingPracticeState,
} from '@shared/models/writing-practice.model';

interface StrokeWritingPadProps {
  character: string;
  strokeData: StrokeData;
  practice: WritingPracticeState;
  onStrokeAttempt: (result: StrokeAttemptResult) => void;
}

/** Khung viết chữ theo nét (S6.2, design D6). Skeleton: chưa có hành vi. */
export const StrokeWritingPad: (props: StrokeWritingPadProps) => null = () =>
  null;
