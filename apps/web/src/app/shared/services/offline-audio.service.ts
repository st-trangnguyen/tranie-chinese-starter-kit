import type {
  OfflineAudioSnapshot,
  OfflineAudioTopic,
} from '@shared/models/offline-audio.model';

// Skeleton (RED 5.1): giữ chữ ký D6, chưa có hành vi; GREEN thay bằng method thật.
export class OfflineAudioService {
  // ── PHẦN 1 — TRUY CẬP DỮ LIỆU ─────────────────────────

  // ── PHẦN 2 — QUY TẮC NGHIỆP VỤ ───────────────────────

  /** Rule: trạng thái audio offline của chủ đề theo bảng trạng thái (S8.4 AC1). */
  readonly deriveTopic: (
    stageId: string,
    unitId: string,
    snapshot: OfflineAudioSnapshot,
  ) => OfflineAudioTopic | null = () => null;

  /** Rule: dung lượng = tổng byte các audio (không trùng) của chủ đề (S8.4 AC1). */
  readonly sumBytes: (
    paths: readonly string[],
    bytes: Readonly<Record<string, number>>,
  ) => number = () => 0;

  // ── PHẦN 3 — USE CASES ───────────────────────────────
}

export const offlineAudioService = new OfflineAudioService();
