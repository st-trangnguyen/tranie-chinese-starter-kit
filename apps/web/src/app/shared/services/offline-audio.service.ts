import { INTRO_STAGE_ID, type AudioIndex, type Stage } from '@csk/shared';

import {
  audioCache,
  AudioDownloadError,
  type AudioCache,
} from '@core/services/audio-cache.service';
import {
  contentSource,
  type ContentSource,
} from '@core/services/content-source.service';
import type {
  OfflineAudioAnnouncement,
  OfflineAudioMessage,
  OfflineAudioMessageKind,
  OfflineAudioSnapshot,
  OfflineAudioTopic,
  OfflineAudioTopicView,
  OfflineAudioUnit,
} from '@shared/models/offline-audio.model';
import { toDownloadPercent } from '@shared/utils/offline-audio.utils';

/** Số câu thông báo gần nhất giữ trong vùng đọc (S8.4 AC1, D10). */
export const MAX_ANNOUNCEMENTS = 5;

const INITIAL_SNAPSHOT: OfflineAudioSnapshot = {
  index: null,
  cachedPaths: new Set<string>(),
  downloadingUnitIds: new Set<string>(),
  messages: new Map(),
  announcements: [],
};

export class OfflineAudioService {
  constructor(
    private readonly cache: AudioCache = audioCache,
    private readonly source: ContentSource = contentSource,
  ) {}

  // ── PHẦN 1 — TRUY CẬP DỮ LIỆU ─────────────────────────

  private snapshot: OfflineAudioSnapshot = INITIAL_SNAPSHOT;
  private readonly listeners = new Set<() => void>();
  private audioIndex: Promise<AudioIndex> | null = null;
  private readonly inFlight = new Map<string, Promise<void>>();

  /** Nạp audio index một lần, giữ promise. */
  private readAudioIndex(): Promise<AudioIndex> {
    this.audioIndex ??= this.source.getAudioIndex();
    return this.audioIndex;
  }

  private readCachedPaths(
    paths: readonly string[],
  ): Promise<ReadonlySet<string>> {
    return this.cache.listCachedPaths(paths);
  }

  /** Tải một file; hai chủ đề cần cùng file đang tải thì chờ chung một lượt. */
  private downloadFile(path: string): Promise<void> {
    const existing = this.inFlight.get(path);
    if (existing) {
      return existing;
    }
    const download = this.cache.download(path).finally(() => {
      this.inFlight.delete(path);
    });
    this.inFlight.set(path, download);
    return download;
  }

  private readSnapshot(): OfflineAudioSnapshot {
    return this.snapshot;
  }

  /** Đặt snapshot mới (object mới, bất biến) rồi báo mọi listener. */
  private writeSnapshot(next: OfflineAudioSnapshot): void {
    this.snapshot = next;
    this.listeners.forEach((listener) => listener());
  }

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

  /**
   * Rule: thông báo của chủ đề mất khi trạng thái hiện tại của chủ đề khác `shownWith`
   * (S8.4 AC1), kể cả khi chủ đề không còn khối; trạng thái không đổi thì giữ.
   */
  pruneStaleMessages(
    messages: ReadonlyMap<string, OfflineAudioMessage>,
    topicsNow: ReadonlyMap<string, OfflineAudioTopic>,
  ): ReadonlyMap<string, OfflineAudioMessage> {
    return new Map(
      [...messages].filter(
        ([unitId, message]) =>
          topicsNow.get(unitId)?.status === message.shownWith,
      ),
    );
  }

  /**
   * Rule: câu thông báo mới nối sau câu cũ, không thay câu cũ, để mỗi câu được đọc đủ (S8.4 AC1).
   * Câu mới có `id` lớn hơn mọi câu đã có (kể cả khi trùng chữ); chỉ giữ `MAX_ANNOUNCEMENTS`
   * câu gần nhất (D10).
   */
  appendAnnouncement(
    list: readonly OfflineAudioAnnouncement[],
    item: Omit<OfflineAudioAnnouncement, 'id'>,
  ): readonly OfflineAudioAnnouncement[] {
    const nextId = list.reduce((maxId, { id }) => Math.max(maxId, id), 0) + 1;
    return [...list, { ...item, id: nextId }].slice(-MAX_ANNOUNCEMENTS);
  }

  /**
   * Rule: khối audio của mọi chủ đề có audio, kèm thông báo còn hiệu lực (S8.4 AC1).
   * Chủ đề không có audio không có khối.
   */
  deriveTopics(
    stages: readonly Stage[],
    snapshot: OfflineAudioSnapshot,
  ): ReadonlyMap<string, OfflineAudioTopicView> {
    const topics = new Map<string, OfflineAudioTopic>();
    stages.forEach((stage) => {
      stage.units.forEach((unit) => {
        const topic = this.deriveTopic(stage.id, unit.id, snapshot);
        if (topic) {
          topics.set(unit.id, topic);
        }
      });
    });
    const messages = this.pruneStaleMessages(snapshot.messages, topics);
    return new Map(
      [...topics].map(([unitId, topic]) => [
        unitId,
        { ...topic, message: messages.get(unitId)?.kind ?? null },
      ]),
    );
  }

  // ── PHẦN 3 — USE CASES ───────────────────────────────

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): OfflineAudioSnapshot => this.readSnapshot();

  /** Nạp audio index và tập file đang có trên máy cho mọi audio trong index. */
  async refresh(): Promise<void> {
    const index = await this.readAudioIndex();
    const cachedPaths = await this.readCachedPaths([
      ...new Set(Object.values(index.units).flat()),
    ]);
    this.writeSnapshot({ ...this.readSnapshot(), index, cachedPaths });
  }

  /**
   * Tải tuần tự (theo thứ tự trong index) các audio còn thiếu của chủ đề. Không reject: mất mạng
   * giữa chừng thành thông báo `download-incomplete`, file đã tải giữ nguyên (bước 7).
   * Chủ đề đang tải thì bỏ qua.
   */
  async startDownload(
    unit: OfflineAudioUnit,
    isOnline: boolean,
  ): Promise<void> {
    const started = this.readSnapshot();
    if (started.downloadingUnitIds.has(unit.id)) {
      return;
    }
    const messages = new Map(started.messages);
    messages.delete(unit.id);
    if (!isOnline) {
      this.writeSnapshot(
        this.stopWithMessage({ ...started, messages }, unit, 'needs-network'),
      );
      return;
    }
    this.writeSnapshot({
      ...started,
      messages,
      downloadingUnitIds: new Set(started.downloadingUnitIds).add(unit.id),
      announcements: this.appendAnnouncement(started.announcements, {
        kind: 'download-started',
        unitTitle: unit.title,
      }),
    });
    try {
      await this.downloadMissing(
        unit,
        this.listMissingAudio(
          started.index?.units[unit.id] ?? [],
          started.cachedPaths,
        ),
      );
    } catch (error) {
      if (
        !(error instanceof AudioDownloadError) ||
        error.reason !== 'network'
      ) {
        throw error;
      }
      this.writeSnapshot(
        this.stopWithMessage(this.readSnapshot(), unit, 'download-incomplete'),
      );
    }
  }

  /**
   * Bước 5–6: tải lần lượt từng file thiếu; file đã có trên máy (chủ đề khác vừa tải) thì không
   * tải lại. File cuối và việc bỏ "đang tải" + câu `download-finished` nằm trong cùng một lần ghi.
   */
  private async downloadMissing(
    unit: OfflineAudioUnit,
    missingAudio: readonly string[],
  ): Promise<void> {
    for (const [position, path] of missingAudio.entries()) {
      const isLast = position === missingAudio.length - 1;
      const isCached = this.readSnapshot().cachedPaths.has(path);
      if (isCached && !isLast) {
        continue;
      }
      if (!isCached) {
        await this.downloadFile(path);
      }
      const current = this.readSnapshot();
      const next = {
        ...current,
        cachedPaths: new Set(current.cachedPaths).add(path),
      };
      this.writeSnapshot(isLast ? this.finishDownload(next, unit) : next);
    }
    if (missingAudio.length === 0) {
      this.writeSnapshot(this.finishDownload(this.readSnapshot(), unit));
    }
  }

  /** Bỏ chủ đề khỏi "đang tải", gắn thông báo (chủ đề chưa tải) kèm câu đọc cùng chữ (bước 3, 7). */
  private stopWithMessage(
    snapshot: OfflineAudioSnapshot,
    unit: OfflineAudioUnit,
    kind: OfflineAudioMessageKind,
  ): OfflineAudioSnapshot {
    const downloadingUnitIds = new Set(snapshot.downloadingUnitIds);
    downloadingUnitIds.delete(unit.id);
    return {
      ...snapshot,
      downloadingUnitIds,
      messages: new Map(snapshot.messages).set(unit.id, {
        kind,
        shownWith: 'not-downloaded',
      }),
      announcements: this.appendAnnouncement(snapshot.announcements, {
        kind,
        unitTitle: unit.title,
      }),
    };
  }

  /** Bỏ chủ đề khỏi "đang tải" kèm câu `download-finished` (bước 6). */
  private finishDownload(
    snapshot: OfflineAudioSnapshot,
    unit: OfflineAudioUnit,
  ): OfflineAudioSnapshot {
    const downloadingUnitIds = new Set(snapshot.downloadingUnitIds);
    downloadingUnitIds.delete(unit.id);
    return {
      ...snapshot,
      downloadingUnitIds,
      announcements: this.appendAnnouncement(snapshot.announcements, {
        kind: 'download-finished',
        unitTitle: unit.title,
      }),
    };
  }
}

export const offlineAudioService = new OfflineAudioService();
