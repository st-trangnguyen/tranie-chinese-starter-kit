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
   * Chủ đề chưa đủ audio trên máy → `not-downloaded` kèm dung lượng cần tải.
   * Đủ mọi file → `downloaded` kèm dung lượng; `canRemove` khi có ít nhất một file xóa được.
   */
  deriveTopic(
    stageId: string,
    unitId: string,
    snapshot: OfflineAudioSnapshot,
  ): OfflineAudioTopic | null {
    const unitAudio = snapshot.index?.units[unitId] ?? [];
    const bytes = snapshot.index?.bytes ?? {};
    const totalBytes = this.sumBytes(unitAudio, bytes);
    if (
      snapshot.index &&
      this.listMissingAudio(unitAudio, snapshot.cachedPaths).length === 0
    ) {
      const removable = this.selectRemovableAudio(
        unitId,
        snapshot.index,
        snapshot.downloadingUnitIds,
      );
      return {
        status: 'downloaded',
        bytes: totalBytes,
        canRemove: removable.length > 0,
      };
    }
    return { status: 'not-downloaded', bytes: totalBytes };
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

  /**
   * Rule (bảng xóa): audio của chủ đề (không trùng) là xóa được (S8.4 AC1).
   * Trừ `precached` và trừ audio của chủ đề đang tải: task 5.27–5.30.
   */
  // Chữ ký D6 giữ tham số `downloadingUnitIds`; task 5.27/5.28 mới dùng tới.
  readonly selectRemovableAudio: (
    unitId: string,
    index: AudioIndex,
    downloadingUnitIds: ReadonlySet<string>,
  ) => string[] = (unitId, index) => [...new Set(index.units[unitId] ?? [])];

  // ── PHẦN 3 — USE CASES ───────────────────────────────
}

export const offlineAudioService = new OfflineAudioService();
