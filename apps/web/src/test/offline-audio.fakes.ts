// Adapter giả cho use case OfflineAudioService (Phần 3) và container S8.4.
// Chỉ thay ranh giới ngoài: Cache Storage + mạng (`AudioCache`) và JSON nội dung (`ContentSource`).

import type { AudioIndex } from '@csk/shared';

import {
  AudioDownloadError,
  type AudioCache,
  type AudioDownloadFailure,
} from '@core/services/audio-cache.service';
import type { ContentSource } from '@core/services/content-source.service';

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

/**
 * `AudioCache` trong bộ nhớ. Mỗi `download(path)` treo cho tới khi test `release(path)` (file vào cache)
 * hoặc `fail(path, reason)` (ném `AudioDownloadError`). Thả trước khi service gọi cũng được.
 */
export class FakeAudioCache implements AudioCache {
  readonly downloadCalls: string[] = [];
  readonly removeCalls: string[][] = [];
  private readonly cached: Set<string>;
  private readonly pending = new Map<string, Deferred>();

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
    return new Set(paths.filter((path) => this.cached.has(path)));
  }

  download(path: string): Promise<void> {
    this.downloadCalls.push(path);
    return this.deferredFor(path).promise;
  }

  async remove(paths: readonly string[]): Promise<void> {
    this.removeCalls.push([...paths]);
    paths.forEach((path) => this.cached.delete(path));
  }

  /** Cho file `path` tải xong rồi chờ service xử lý. */
  async release(path: string): Promise<void> {
    const deferred = this.deferredFor(path);
    this.pending.delete(path);
    this.cached.add(path);
    deferred.resolve();
    await flushAsync();
  }

  /** Cho file `path` tải lỗi rồi chờ service xử lý. */
  async fail(path: string, reason: AudioDownloadFailure): Promise<void> {
    const deferred = this.deferredFor(path);
    this.pending.delete(path);
    deferred.reject(new AudioDownloadError(reason));
    await flushAsync();
  }

  private deferredFor(path: string): Deferred {
    const existing = this.pending.get(path);
    if (existing) {
      return existing;
    }
    const deferred = createDeferred();
    // Tránh cảnh báo "unhandled rejection" khi `fail` trước lúc service gọi `download`.
    deferred.promise.catch(() => undefined);
    this.pending.set(path, deferred);
    return deferred;
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
