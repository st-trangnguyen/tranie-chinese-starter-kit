import type {
  StrokeAttemptResult,
  WritingPracticeState,
} from '@shared/models/writing-practice.model';

import { StrokeOrderService } from './stroke-order.service';

// Quy tắc nghiệp vụ (Phần 2): số lần sai liên tiếp ở nét hiện tại thì hiện gợi ý.
const HINT_AFTER_MISTAKES = 3;

export class WritingPracticeService {
  constructor(
    private readonly strokeOrder: StrokeOrderService = new StrokeOrderService(),
  ) {}

  // ── PHẦN 1 — TRUY CẬP DỮ LIỆU ─────────────────────────
  // Nạp chữ qua `this.strokeOrder`.

  // ── PHẦN 2 — QUY TẮC NGHIỆP VỤ ───────────────────────

  // Rule: một lượt viết bắt đầu ở nét đầu, bộ đếm sai 0, chưa gợi ý, chưa có thông báo.
  startPractice(strokeCount: number): WritingPracticeState {
    return {
      strokeCount,
      completedStrokeCount: 0,
      mistakeCount: 0,
      isHintVisible: false,
      isComplete: false,
      lastAttempt: null,
      mistakeSerial: 0,
    };
  }

  // Rule: sai từ HINT_AFTER_MISTAKES lần liên tiếp ở nét hiện tại thì hiện gợi ý; sai tiếp khi
  // gợi ý đang hiện thì gợi ý vẫn hiện, không đếm lại.
  shouldShowHint(mistakeCount: number): boolean {
    return mistakeCount >= HINT_AFTER_MISTAKES;
  }

  // Rule: viết đúng hết các nét là xong chữ.
  isCharacterComplete(
    completedStrokeCount: number,
    strokeCount: number,
  ): boolean {
    return completedStrokeCount >= strokeCount;
  }

  // Rule: viết sai nét hiện tại thì bộ đếm sai tăng 1 và báo sai; hiện gợi ý khi bộ đếm sai mới
  // đạt ngưỡng gợi ý (shouldShowHint).
  nextAfterMistake(state: WritingPracticeState): WritingPracticeState {
    const mistakeCount = state.mistakeCount + 1;
    return {
      ...state,
      mistakeCount,
      mistakeSerial: state.mistakeSerial + 1,
      lastAttempt: 'mistake',
      isHintVisible: this.shouldShowHint(mistakeCount),
    };
  }

  // Rule: viết đúng nét hiện tại thì giữ nét đó và sang nét kế: số nét đã viết đúng tăng 1, bộ
  // đếm sai của nét mới về 0, ẩn gợi ý, báo đúng; hết nét thì xong chữ (isCharacterComplete).
  nextAfterCorrect(state: WritingPracticeState): WritingPracticeState {
    const completedStrokeCount = state.completedStrokeCount + 1;
    return {
      ...state,
      completedStrokeCount,
      mistakeCount: 0,
      isHintVisible: false,
      lastAttempt: 'correct',
      isComplete: this.isCharacterComplete(
        completedStrokeCount,
        state.strokeCount,
      ),
    };
  }

  // Rule: mọi sự kiện sau khi xong chữ bị bỏ qua (trả nguyên state). Chạm một điểm/nét quá ngắn
  // (`ignored`) không đổi bộ đếm sai, gợi ý hay thông báo sai đang có (trả nguyên state).
  recordStrokeAttempt(
    state: WritingPracticeState,
    result: StrokeAttemptResult,
  ): WritingPracticeState {
    if (state.isComplete) {
      return state;
    }
    switch (result) {
      case 'mistake':
        return this.nextAfterMistake(state);
      case 'correct':
        return this.nextAfterCorrect(state);
      case 'ignored':
        return state;
      default:
        return state;
    }
  }

  // ── PHẦN 3 — USE CASES ───────────────────────────────
}
