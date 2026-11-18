import { AUDIO_CACHE_NAME } from '@core/constants/audio.constants';

export interface AudioCache {
  /** Trong `paths`, file nào đang có ở bất kỳ cache nào. */
  listCachedPaths(paths: readonly string[]): Promise<ReadonlySet<string>>;
  /** fetch `/${path}` (không Range) rồi `put` vào AUDIO_CACHE_NAME. */
  download(path: string): Promise<void>;
  /** Xóa khỏi AUDIO_CACHE_NAME; không bao giờ đụng precache. */
  remove(paths: readonly string[]): Promise<void>;
}

const toPath = (request: Request): string =>
  new URL(request.url).pathname.replace(/^\//, '');

export class BrowserAudioCache implements AudioCache {
  constructor(private readonly storage: () => CacheStorage | undefined) {}

  async listCachedPaths(
    paths: readonly string[],
  ): Promise<ReadonlySet<string>> {
    const storage = this.storage();
    if (storage === undefined) {
      return new Set<string>();
    }
    const cacheNames = await storage.keys();
    const requestLists = await Promise.all(
      cacheNames.map(async (cacheName) =>
        (await storage.open(cacheName)).keys(),
      ),
    );
    const cachedPaths = new Set(requestLists.flat().map(toPath));
    return new Set(paths.filter((path) => cachedPaths.has(path)));
  }

  async download(path: string): Promise<void> {
    const storage = this.storage();
    if (storage === undefined) {
      throw new Error('Trình duyệt không có bộ nhớ đệm để tải audio');
    }
    const url = `/${path}`;
    const response = await fetch(url);
    const cache = await storage.open(AUDIO_CACHE_NAME);
    await cache.put(url, response);
  }

  async remove(paths: readonly string[]): Promise<void> {
    const storage = this.storage();
    if (storage === undefined) {
      return;
    }
    const cache = await storage.open(AUDIO_CACHE_NAME);
    await Promise.all(paths.map((path) => cache.delete(`/${path}`)));
  }
}

export const audioCache: AudioCache = new BrowserAudioCache(
  () => globalThis.caches,
);
