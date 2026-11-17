/** Kết quả chấm một nét do adapter báo về (S6.2): đúng, sai, hoặc chạm một điểm/nét quá ngắn. */
export type StrokeAttemptResult = 'correct' | 'mistake' | 'ignored';

/** Trạng thái một lượt viết một chữ (S6.2). */
export interface WritingPracticeState {
  strokeCount: number;
  /** Số nét đã viết đúng, cũng là chỉ số nét hiện tại. */
  completedStrokeCount: number;
  /** Số lần sai liên tiếp của nét hiện tại. */
  mistakeCount: number;
  isHintVisible: boolean;
  isComplete: boolean;
  lastAttempt: 'correct' | 'mistake' | null;
  /** Tăng mỗi lần sai, không về 0 trong một lượt. */
  mistakeSerial: number;
}
