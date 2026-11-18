// Skeleton (S8.4 task 4.1): chưa có hành vi, cài đặt ở task 4.2 (design D4).

export interface AudioCache {
  /** Trong `paths`, file nào đang có ở bất kỳ cache nào. */
  listCachedPaths(paths: readonly string[]): Promise<ReadonlySet<string>>;
  /** fetch `/${path}` (không Range) rồi `put` vào AUDIO_CACHE_NAME. */
  download(path: string): Promise<void>;
}

export class BrowserAudioCache implements AudioCache {
  constructor(private readonly storage: () => CacheStorage | undefined) {}

  async listCachedPaths(): Promise<ReadonlySet<string>> {
    return new Set<string>();
  }

  async download(): Promise<void> {}
}
