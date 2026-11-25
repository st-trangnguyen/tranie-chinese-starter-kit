import type { ExerciseResult } from '@shared/models/exercise.model';
import type { StrokeOrderResult } from '@shared/models/stroke-order.model';
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

  // Ủy quyền cho StrokeOrderService: rule chữ hợp lệ / có dữ liệu nét giữ một chỗ (S6.1, D2).
  private readCharacter(input: string): Promise<StrokeOrderResult> {
    return this.strokeOrder.getStrokeOrder(input);
  }

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

  // Rule: lượt viết vừa chuyển sang xong chữ (chưa xong → xong).
  // Skeleton RED (S9.1 task 7.1): chưa có hành vi.
  hasJustCompleted(
    previous: WritingPracticeState,
    next: WritingPracticeState,
  ): boolean {
    void [previous, next];
    return false;
  }

  // Rule: trong màn bài, câu viết chỉ có kết quả "Đúng", đúng một lần lúc vừa xong chữ; viết sai
  // nét không cho kết quả. Không có giải thích.
  lessonResultOf(
    previous: WritingPracticeState,
    next: WritingPracticeState,
  ): ExerciseResult | null {
    if (!previous.isComplete && next.isComplete) {
      return { isCorrect: true };
    }
    return null;
  }

  // ── PHẦN 3 — USE CASES ───────────────────────────────

  /** Nạp dữ liệu nét của chữ cần luyện viết; không có dữ liệu thì `unavailable` như S6.1. */
  loadCharacter(input: string): Promise<StrokeOrderResult> {
    return this.readCharacter(input);
  }
}
