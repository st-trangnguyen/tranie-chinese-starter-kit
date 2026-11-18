import { AUDIO_CACHE_NAME } from '@core/constants/audio.constants';
import { FakeCacheStorage } from '@test/cache-storage.fake';

import { type AudioCache, BrowserAudioCache } from './audio-cache.service';

const PATH_A = 'audio/aaaaaaaaaaaaaaaa.mp3';
const PATH_B = 'audio/bbbbbbbbbbbbbbbb.mp3';
const PATH_C = 'audio/cccccccccccccccc.mp3';
const PRECACHE_NAME = 'workbox-precache-v2-http://localhost/';
const PRECACHE_KEY_B = `/${PATH_B}?__WB_REVISION__=abc`;

const mp3Response = (): Response =>
  new Response(new Uint8Array([0x49, 0x44, 0x33]), {
    status: 200,
    headers: { 'Content-Type': 'audio/mpeg' },
  });

const requestUrl = (input: RequestInfo | URL): string =>
  input instanceof Request ? new URL(input.url).pathname : String(input);

const requestHeaders = (
  input: RequestInfo | URL,
  init: RequestInit | undefined,
): Headers =>
  input instanceof Request ? input.headers : new Headers(init?.headers);

afterEach(() => {
  vi.restoreAllMocks();
});

describe('BrowserAudioCache', () => {
  it('S8.4-AC1 Bấm tải thì audio của chủ đề có trên máy: should fetch the whole file and keep it in the audio cache', async () => {
    const storage = new FakeCacheStorage();
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => mp3Response());
    const cache: AudioCache = new BrowserAudioCache(() => storage);

    await cache.download(PATH_A);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [input, init] = fetchSpy.mock.calls[0] ?? [];
    expect(input).toBeDefined();
    if (input === undefined) {
      return;
    }
    expect(requestUrl(input)).toBe(`/${PATH_A}`);
    expect(requestHeaders(input, init).has('Range')).toBe(false);

    const stored = await storage.cacheFor(AUDIO_CACHE_NAME).match(`/${PATH_A}`);
    expect(stored).toBeDefined();
    expect(
      new Uint8Array(await (stored ?? new Response()).arrayBuffer()),
    ).toEqual(new Uint8Array([0x49, 0x44, 0x33]));
  });

  it('S8.4-AC1 Bấm tải thì audio của chủ đề có trên máy: should list the downloaded path and not other paths', async () => {
    const storage = new FakeCacheStorage();
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => mp3Response());
    const cache: AudioCache = new BrowserAudioCache(() => storage);

    await cache.download(PATH_A);
    const cached = await cache.listCachedPaths([PATH_A, PATH_C]);

    expect([...cached]).toEqual([PATH_A]);
  });

  it('S8.4-AC2 Xóa không làm mất audio Nhập môn: should list a precached file whose key has a revision query', async () => {
    const storage = new FakeCacheStorage();
    storage.cacheFor(PRECACHE_NAME).seed(PRECACHE_KEY_B);
    const cache: AudioCache = new BrowserAudioCache(() => storage);

    const cached = await cache.listCachedPaths([PATH_B, PATH_C]);

    expect([...cached]).toEqual([PATH_B]);
  });

  it('S8.4-AC2 Xóa không làm mất audio Nhập môn: should remove only from the audio cache and keep the precache entry', async () => {
    const storage = new FakeCacheStorage();
    const precache = storage.cacheFor(PRECACHE_NAME);
    precache.seed(PRECACHE_KEY_B);
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => mp3Response());
    const cache: AudioCache = new BrowserAudioCache(() => storage);
    await cache.download(PATH_A);

    await cache.remove([PATH_B, PATH_A]);

    expect(
      await storage.cacheFor(AUDIO_CACHE_NAME).match(`/${PATH_A}`),
    ).toBeUndefined();
    expect(precache.urls()).toEqual([`http://localhost${PRECACHE_KEY_B}`]);
    expect([...(await cache.listCachedPaths([PATH_A, PATH_B]))]).toEqual([
      PATH_B,
    ]);
  });
});
