import type { AudioIndex } from '@csk/shared';

import type {
  OfflineAudioSnapshot,
  OfflineAudioTopic,
} from '@shared/models/offline-audio.model';

export class OfflineAudioService {
  // ── PHẦN 1 — TRUY CẬP DỮ LIỆU ─────────────────────────

  // ── PHẦN 2 — QUY TẮC NGHIỆP VỤ ───────────────────────

  /**
   * Rule: trạng thái audio offline của chủ đề theo bảng trạng thái (S8.4 AC1).
   * Chủ đề chưa có audio trên máy → `not-downloaded` kèm dung lượng cần tải.
   */
  deriveTopic(
    stageId: string,
    unitId: string,
    snapshot: OfflineAudioSnapshot,
  ): OfflineAudioTopic | null {
    const unitAudio = snapshot.index?.units[unitId] ?? [];
    const bytes = snapshot.index?.bytes ?? {};
    return { status: 'not-downloaded', bytes: this.sumBytes(unitAudio, bytes) };
  }

  /** Rule: dung lượng = tổng byte các audio (không trùng) của chủ đề (S8.4 AC1). */
  sumBytes(
    paths: readonly string[],
    bytes: Readonly<Record<string, number>>,
  ): number {
    return [...new Set(paths)].reduce(
      (total, path) => total + (bytes[path] ?? 0),
      0,
    );
  }

  /** Rule: chỉ tải file chưa có trên máy (S8.4 AC1). */
  listMissingAudio(
    unitAudio: readonly string[],
    cachedPaths: ReadonlySet<string>,
  ): string[] {
    return unitAudio.filter((path) => !cachedPaths.has(path));
  }

  // Skeleton (RED 5.5): giữ chữ ký D6, chưa có hành vi; GREEN thay bằng method thật.
  /**
   * Rule (bảng xóa): audio của chủ đề trừ `precached`, trừ audio của mọi chủ đề đang tải;
   * audio dùng chung với chủ đề "Đã tải" khác vẫn bị xóa (S8.4 AC2).
   */
  readonly selectRemovableAudio: (
    unitId: string,
    index: AudioIndex,
    downloadingUnitIds: ReadonlySet<string>,
  ) => string[] = () => [];

  // ── PHẦN 3 — USE CASES ───────────────────────────────
}

export const offlineAudioService = new OfflineAudioService();
