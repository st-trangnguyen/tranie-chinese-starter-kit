// Adapter giả cho use case OfflineAudioService (Phần 3) và container S8.4.
// Chỉ thay ranh giới ngoài: Cache Storage + mạng (`AudioCache`) và JSON nội dung (`ContentSource`).

import type { AudioIndex } from '@csk/shared';

import {
  AudioDownloadError,
  type AudioCache,
  type AudioDownloadFailure,
} from '@core/services/audio-cache.service';
import type { ContentSource } from '@core/services/content-source.service';
import type { OfflineAudioSnapshot } from '@shared/models/offline-audio.model';
import { OfflineAudioService } from '@shared/services/offline-audio.service';

import { HSK_INDEX } from './offline-audio.fixtures';

interface Deferred {
  promise: Promise<void>;
  resolve: () => void;
  reject: (error: unknown) => void;
}

const createDeferred = (): Deferred => {
  let resolve: () => void = () => undefined;
  let reject: (error: unknown) => void = () => undefined;
  const promise = new Promise<void>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
};

/** Chờ mọi microtask/macrotask đang xếp hàng chạy xong (service xử lý xong một bước). */
export const flushAsync = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

type PresetOutcome =
  { kind: 'released' } | { kind: 'failed'; reason: AudioDownloadFailure };

/**
 * `AudioCache` trong bộ nhớ. Mỗi `download(path)` treo cho tới khi test `release(path)` (file vào cache)
 * hoặc `fail(path, reason)` (ném `AudioDownloadError`). Nhiều lượt `download` cùng path đang treo thì
 * chờ chung một kết quả. Thả trước khi service gọi cũng được: kết quả được giữ lại, lượt `download`
 * kế tiếp của path đó trả ngay (file vào cache lúc đó) thay vì treo.
 */
export class FakeAudioCache implements AudioCache {
  readonly downloadCalls: string[] = [];
  readonly removeCalls: string[][] = [];
  private readonly cached: Set<string>;
  private readonly pending = new Map<string, Deferred>();
  private readonly presets = new Map<string, PresetOutcome>();
  private heldListing: Deferred | null = null;
  private failingRemove: ReadonlySet<string> | null = null;

  constructor(initialCached: Iterable<string> = []) {
    this.cached = new Set(initialCached);
  }

  /** Tập file đang có trong cache giả (để kiểm "file vẫn còn trên máy"). */
  get cachedPaths(): ReadonlySet<string> {
    return new Set(this.cached);
  }

  async listCachedPaths(
    paths: readonly string[],
  ): Promise<ReadonlySet<string>> {
    const found = new Set(paths.filter((path) => this.cached.has(path)));
    const held = this.heldListing;
    this.heldListing = null;
    if (held) {
      await held.promise;
    }
    return found;
  }

  /**
   * Lượt `listCachedPaths` kế tiếp chụp tập file lúc được gọi nhưng chỉ trả về khi test gọi hàm
   * trả về (đọc cache chậm hơn các lượt `download` xảy ra trong lúc chờ).
   */
  holdNextListing(): () => Promise<void> {
    const held = createDeferred();
    this.heldListing = held;
    return async () => {
      held.resolve();
      await flushAsync();
    };
  }

  download(path: string): Promise<void> {
    this.downloadCalls.push(path);
    const preset = this.presets.get(path);
    if (preset) {
      this.presets.delete(path);
      if (preset.kind === 'failed') {
        return Promise.reject(new AudioDownloadError(preset.reason));
      }
      this.cached.add(path);
      return Promise.resolve();
    }
    const existing = this.pending.get(path);
    if (existing) {
      return existing.promise;
    }
    const deferred = createDeferred();
    this.pending.set(path, deferred);
    return deferred.promise;
  }

  async remove(paths: readonly string[]): Promise<void> {
    this.removeCalls.push([...paths]);
    const failing = this.failingRemove;
    this.failingRemove = null;
    if (failing) {
      paths
        .filter((path) => failing.has(path))
        .forEach((path) => this.cached.delete(path));
      throw new Error('FakeAudioCache: xóa lỗi giữa chừng');
    }
    paths.forEach((path) => this.cached.delete(path));
  }

  /**
   * Lượt `remove` kế tiếp chỉ xóa các path trong `removedBeforeError` (nếu có trong danh sách xóa)
   * rồi reject, như bộ nhớ báo lỗi giữa chừng.
   */
  failNextRemove(removedBeforeError: readonly string[]): void {
    this.failingRemove = new Set(removedBeforeError);
  }

  /** Cho file `path` tải xong rồi chờ service xử lý. */
  async release(path: string): Promise<void> {
    const deferred = this.pending.get(path);
    if (deferred) {
      this.pending.delete(path);
      this.cached.add(path);
      deferred.resolve();
    } else {
      this.presets.set(path, { kind: 'released' });
    }
    await flushAsync();
  }

  /** Cho file `path` tải lỗi rồi chờ service xử lý. */
  async fail(path: string, reason: AudioDownloadFailure): Promise<void> {
    const deferred = this.pending.get(path);
    if (deferred) {
      this.pending.delete(path);
      deferred.reject(new AudioDownloadError(reason));
    } else {
      this.presets.set(path, { kind: 'failed', reason });
    }
    await flushAsync();
  }
}

const notUsed = (method: string): Promise<never> =>
  Promise.reject(
    new Error(`ContentSource giả: ${method} không dùng trong test`),
  );

/** `ContentSource` chỉ trả audio index; các nguồn khác reject. */
export function fakeContentSourceWithIndex(index: AudioIndex): ContentSource {
  return {
    getContentRoot: () => notUsed('getContentRoot'),
    getLesson: () => notUsed('getLesson'),
    getWords: () => notUsed('getWords'),
    getSentences: () => notUsed('getSentences'),
    getStrokeIndex: () => notUsed('getStrokeIndex'),
    getStrokeData: () => notUsed('getStrokeData'),
    getAudioIndex: () => Promise.resolve(index),
  };
}

/**
 * Service thật trên adapter giả. `snapshots` ghi lại mọi snapshot service báo qua `subscribe`.
 */
export function setupOfflineAudioService(
  initialCached: readonly string[] = [],
  index: AudioIndex = HSK_INDEX,
): {
  service: OfflineAudioService;
  cache: FakeAudioCache;
  snapshots: OfflineAudioSnapshot[];
} {
  const cache = new FakeAudioCache(initialCached);
  const service = new OfflineAudioService(
    cache,
    fakeContentSourceWithIndex(index),
  );
  const snapshots: OfflineAudioSnapshot[] = [];
  service.subscribe(() => {
    snapshots.push(service.getSnapshot());
  });
  return { service, cache, snapshots };
}
