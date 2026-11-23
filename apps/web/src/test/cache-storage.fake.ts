// Cache Storage giả trong bộ nhớ cho Vitest (jsdom không có `caches`).
// Chỉ thay ranh giới ngoài; khóa là URL tuyệt đối, so khớp như trình duyệt khi không truyền options.

const BASE_URL = 'http://localhost/';

const toUrl = (request: RequestInfo | URL): string => {
  if (request instanceof Request) {
    return new URL(request.url, BASE_URL).href;
  }
  return new URL(String(request), BASE_URL).href;
};

type PutHook = (request: RequestInfo | URL, response: Response) => void;

export class FakeCache implements Cache {
  private readonly entries = new Map<string, Response>();
  /** Gán để `put` ném lỗi (ví dụ QuotaExceededError) trước khi ghi. */
  beforePut: PutHook | null = null;

  async add(request: RequestInfo | URL): Promise<void> {
    const response = await fetch(request);
    await this.put(request, response);
  }

  async addAll(requests: Iterable<RequestInfo>): Promise<void> {
    for (const request of requests) {
      await this.add(request);
    }
  }

  async delete(request: RequestInfo | URL): Promise<boolean> {
    return this.entries.delete(toUrl(request));
  }

  async keys(request?: RequestInfo | URL): Promise<ReadonlyArray<Request>> {
    const urls = [...this.entries.keys()];
    const matched =
      request === undefined
        ? urls
        : urls.filter((url) => url === toUrl(request));
    return matched.map((url) => new Request(url));
  }

  async match(request: RequestInfo | URL): Promise<Response | undefined> {
    return this.entries.get(toUrl(request))?.clone();
  }

  async matchAll(
    request?: RequestInfo | URL,
  ): Promise<ReadonlyArray<Response>> {
    if (request === undefined) {
      return [...this.entries.values()].map((r) => r.clone());
    }
    const found = await this.match(request);
    return found === undefined ? [] : [found];
  }

  async put(request: RequestInfo | URL, response: Response): Promise<void> {
    this.beforePut?.(request, response);
    const body = await response.arrayBuffer();
    this.entries.set(
      toUrl(request),
      new Response(body, {
        status: response.status,
        headers: response.headers,
      }),
    );
  }

  /** Ghi thẳng một khóa (ví dụ khóa precache có query) mà không qua `put`. */
  seed(url: string, body = 'audio'): void {
    this.entries.set(toUrl(url), new Response(body));
  }

  urls(): string[] {
    return [...this.entries.keys()];
  }
}

export class FakeCacheStorage implements CacheStorage {
  private readonly caches = new Map<string, FakeCache>();

  async delete(cacheName: string): Promise<boolean> {
    return this.caches.delete(cacheName);
  }

  async has(cacheName: string): Promise<boolean> {
    return this.caches.has(cacheName);
  }

  async keys(): Promise<string[]> {
    return [...this.caches.keys()];
  }

  async match(request: RequestInfo | URL): Promise<Response | undefined> {
    for (const cache of this.caches.values()) {
      const found = await cache.match(request);
      if (found !== undefined) {
        return found;
      }
    }
    return undefined;
  }

  async open(cacheName: string): Promise<FakeCache> {
    return this.cacheFor(cacheName);
  }

  /** Lấy (hoặc tạo) cache theo tên, đồng bộ, để test chuẩn bị và kiểm tra dữ liệu. */
  cacheFor(cacheName: string): FakeCache {
    const existing = this.caches.get(cacheName);
    if (existing !== undefined) {
      return existing;
    }
    const created = new FakeCache();
    this.caches.set(cacheName, created);
    return created;
  }
}
