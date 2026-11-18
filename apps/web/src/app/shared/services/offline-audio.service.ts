import { INTRO_STAGE_ID, type AudioIndex } from '@csk/shared';

import type {
  OfflineAudioSnapshot,
  OfflineAudioTopic,
} from '@shared/models/offline-audio.model';
import { toDownloadPercent } from '@shared/utils/offline-audio.utils';

export class OfflineAudioService {
  // ── PHẦN 1 — TRUY CẬP DỮ LIỆU ─────────────────────────

  // ── PHẦN 2 — QUY TẮC NGHIỆP VỤ ───────────────────────

  /**
   * Rule: trạng thái audio offline của chủ đề theo bảng trạng thái (S8.4 AC1).
   * Chủ đề không có audio (`[]` hoặc không có trong audio index) → không có khối (`null`),
   * xét đầu tiên, trước cả có sẵn offline.
   * Có sẵn offline xét trước các trạng thái còn lại.
   * Chủ đề đang tải và còn file thiếu → `downloading` kèm phần trăm số file đã có trên máy,
   * xét trước chưa tải/đã tải. Đang tải mà đủ mọi file trên máy → rơi xuống `downloaded`.
   * Chủ đề chưa đủ audio trên máy → `not-downloaded` kèm dung lượng cần tải.
   * Đủ mọi file → `downloaded` kèm dung lượng; `canRemove` khi có ít nhất một file xóa được.
   */
  deriveTopic(
    stageId: string,
    unitId: string,
    snapshot: OfflineAudioSnapshot,
  ): OfflineAudioTopic | null {
    const unitAudio = snapshot.index?.units[unitId] ?? [];
    if (this.hasNoAudio(unitAudio)) {
      return null;
    }
    if (
      this.isAvailableOffline(
        stageId,
        unitAudio,
        snapshot.index?.precached ?? [],
      )
    ) {
      return { status: 'available-offline' };
    }
    const missingAudio = this.listMissingAudio(unitAudio, snapshot.cachedPaths);
    if (snapshot.downloadingUnitIds.has(unitId) && missingAudio.length > 0) {
      return {
        status: 'downloading',
        percent: this.calculateDownloadPercent(unitAudio, snapshot.cachedPaths),
      };
    }
    const bytes = snapshot.index?.bytes ?? {};
    const totalBytes = this.sumBytes(unitAudio, bytes);
    if (snapshot.index && missingAudio.length === 0) {
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

  /** Rule: chủ đề không có audio thì không có khối audio offline (S8.4 AC1). */
  hasNoAudio(unitAudio: readonly string[]): boolean {
    return unitAudio.length === 0;
  }

  /**
   * Rule: chủ đề có sẵn offline, không cần tải (S8.4 AC1) khi thuộc giai đoạn Nhập môn,
   * hoặc khi mọi audio của chủ đề là audio Nhập môn (nằm trong `precached`).
   */
  isAvailableOffline(
    stageId: string,
    unitAudio: readonly string[],
    precached: readonly string[],
  ): boolean {
    if (stageId === INTRO_STAGE_ID) {
      return true;
    }
    const precachedPaths = new Set(precached);
    return unitAudio.every((path) => precachedPaths.has(path));
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

  /**
   * Rule: tiến độ tải = số file của chủ đề đang có trên máy / tổng số file, nhân 100,
   * làm tròn xuống (S8.4 AC1).
   */
  calculateDownloadPercent(
    unitAudio: readonly string[],
    cachedPaths: ReadonlySet<string>,
  ): number {
    const done =
      unitAudio.length - this.listMissingAudio(unitAudio, cachedPaths).length;
    return toDownloadPercent(done, unitAudio.length);
  }

  /** Rule: chỉ tải file chưa có trên máy (S8.4 AC1). */
  listMissingAudio(
    unitAudio: readonly string[],
    cachedPaths: ReadonlySet<string>,
  ): string[] {
    return unitAudio.filter((path) => !cachedPaths.has(path));
  }

  /**
   * Rule (bảng xóa): audio xóa được của chủ đề = audio của chủ đề (không trùng), trừ audio
   * Nhập môn (`precached`), trừ audio mà mọi chủ đề đang tải cần (S8.4 AC2).
   * Audio dùng chung với chủ đề "Đã tải" khác vẫn xóa được.
   */
  selectRemovableAudio(
    unitId: string,
    index: AudioIndex,
    downloadingUnitIds: ReadonlySet<string>,
  ): string[] {
    const keptPaths = new Set(index.precached);
    downloadingUnitIds.forEach((downloadingUnitId) => {
      (index.units[downloadingUnitId] ?? []).forEach((path) =>
        keptPaths.add(path),
      );
    });
    return [...new Set(index.units[unitId] ?? [])].filter(
      (path) => !keptPaths.has(path),
    );
  }

  // ── PHẦN 3 — USE CASES ───────────────────────────────
}

export const offlineAudioService = new OfflineAudioService();
