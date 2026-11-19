import { matchesGlob } from 'node:path';
import { runInNewContext } from 'node:vm';

import {
  createAudioRuntimeCaching,
  listPrecachedAudioPatterns,
  PRECACHE_BASE_PATTERNS,
  stripRangeRequest,
  toPartialResponse,
} from './audio-caching.config';

const INTRO_AUDIO = 'audio/00000000000000aa.mp3';
const INTRO_AUDIO_2 = 'audio/00000000000000bb.mp3';
const HSK_AUDIO = 'audio/0123456789abcdef.mp3';

const VALID_INDEX = {
  units: {
    'intro-basics': [INTRO_AUDIO, INTRO_AUDIO_2],
    'hsk1-greetings': [HSK_AUDIO, INTRO_AUDIO],
  },
  bytes: {
    [INTRO_AUDIO]: 2048,
    [INTRO_AUDIO_2]: 4096,
    [HSK_AUDIO]: 1_048_576,
  },
  precached: [INTRO_AUDIO, INTRO_AUDIO_2],
};

/** Workbox precache một file khi nó khớp ít nhất một glob trong `globPatterns`. */
const isPrecached = (file: string, patterns: readonly string[]): boolean =>
  patterns.some((pattern) => matchesGlob(file, pattern));

describe('audio-caching.config', () => {
  const SCENARIO = 'S8.4-AC1 Mới cài app thì audio HSK chưa có trên máy';

  it(`${SCENARIO}: glob precache gốc không khớp file mp3 nào`, () => {
    expect(isPrecached(HSK_AUDIO, PRECACHE_BASE_PATTERNS)).toBe(false);
    expect(isPrecached(INTRO_AUDIO, PRECACHE_BASE_PATTERNS)).toBe(false);
    expect(
      isPrecached('assets/e2e/offline-sample.mp3', PRECACHE_BASE_PATTERNS),
    ).toBe(false);
  });

  it(`${SCENARIO}: glob precache gốc vẫn giữ khung app, font, nội dung (S1.2)`, () => {
    const appFiles = [
      'index.html',
      'assets/index-abc123.js',
      'assets/index-abc123.css',
      'fonts/noto.woff2',
      'content/content.json',
      'favicon.ico',
      'icons/pwa-192.png',
      'logo.svg',
    ];
    appFiles.forEach((file) => {
      expect(isPrecached(file, PRECACHE_BASE_PATTERNS), file).toBe(true);
    });
  });

  it(`${SCENARIO}: audio precache đúng bằng index.precached, không có audio HSK`, () => {
    const patterns = listPrecachedAudioPatterns(VALID_INDEX);

    expect(patterns).toEqual([INTRO_AUDIO, INTRO_AUDIO_2]);

    const all = [...PRECACHE_BASE_PATTERNS, ...patterns];
    expect(isPrecached(INTRO_AUDIO, all)).toBe(true);
    expect(isPrecached(INTRO_AUDIO_2, all)).toBe(true);
    expect(isPrecached(HSK_AUDIO, all)).toBe(false);
    expect(
      listPrecachedAudioPatterns({ ...VALID_INDEX, precached: [] }),
    ).toEqual([]);
  });

  it(`${SCENARIO}: audio-index.json sai dạng thì throw (build dừng)`, () => {
    expect(() =>
      listPrecachedAudioPatterns({ units: {}, bytes: {} }),
    ).toThrow();
    expect(() => listPrecachedAudioPatterns('not json object')).toThrow();
    expect(() =>
      listPrecachedAudioPatterns({
        ...VALID_INDEX,
        precached: ['audio/missing0000000.mp3'],
      }),
    ).toThrow();
  });
});

type StripRangeRequest = typeof stripRangeRequest;

const isStripRangeRequest = (value: unknown): value is StripRangeRequest =>
  typeof value === 'function';

/**
 * Dựng lại hàm từ mã nguồn như workbox-build làm khi chép plugin vào `sw.js`: chỉ còn global
 * (`Request`), không còn biến hay import của module.
 */
const rebuildFromSource = (fn: StripRangeRequest): StripRangeRequest => {
  const rebuilt: unknown = runInNewContext(`(${fn.toString()})`, { Request });
  if (!isStripRangeRequest(rebuilt)) {
    throw new Error('Không dựng lại được hàm từ toString()');
  }
  return rebuilt;
};

describe('audio-caching.config stripRangeRequest', () => {
  const SCENARIO = 'S8.4-AC1 Đã nghe hết audio thì là đã tải';
  const AUDIO_URL = `https://app.example/${HSK_AUDIO}`;

  const rangeRequest = (): Request =>
    new Request(AUDIO_URL, { headers: { Range: 'bytes=0-' } });

  it(`${SCENARIO}: request có Range: bytes=0- thành request cùng URL, không Range`, async () => {
    const request = rangeRequest();

    const result = await stripRangeRequest({ request });

    expect(result.url).toBe(AUDIO_URL);
    expect(result.headers.has('Range')).toBe(false);
    expect(request.headers.get('Range')).toBe('bytes=0-');
  });

  it(`${SCENARIO}: bản dựng lại từ toString() cho cùng kết quả (hàm tự chứa)`, async () => {
    const rebuilt = rebuildFromSource(stripRangeRequest);

    const result = await rebuilt({ request: rangeRequest() });

    expect(result.url).toBe(AUDIO_URL);
    expect(result.headers.has('Range')).toBe(false);
  });
});

type ToPartialResponse = typeof toPartialResponse;

const isToPartialResponse = (value: unknown): value is ToPartialResponse =>
  typeof value === 'function';

/** Như `rebuildFromSource`, chỉ còn global mà sw.js có (`Request`, `Response`, `Headers`, `Blob`). */
const rebuildPartialFromSource = (fn: ToPartialResponse): ToPartialResponse => {
  const rebuilt: unknown = runInNewContext(`(${fn.toString()})`, {
    Request,
    Response,
    Headers,
    Blob,
  });
  if (!isToPartialResponse(rebuilt)) {
    throw new Error('Không dựng lại được hàm từ toString()');
  }
  return rebuilt;
};

describe('audio-caching.config toPartialResponse', () => {
  const SCENARIO = 'S8.4-AC1 Đã tải thì học offline vẫn nghe được';
  const AUDIO_URL = `https://app.example/${HSK_AUDIO}`;
  const BODY = Uint8Array.from({ length: 1000 }, (_, i) => i % 256);

  const audioRequest = (range?: string): Request =>
    new Request(AUDIO_URL, range ? { headers: { Range: range } } : {});

  const fullResponse = (): Response =>
    new Response(BODY, {
      status: 200,
      headers: { 'Content-Type': 'audio/mpeg' },
    });

  const readBytes = async (response: Response): Promise<Uint8Array> =>
    new Uint8Array(await response.arrayBuffer());

  const expectPartial = async (
    fn: ToPartialResponse,
    range: string,
    [start, end]: readonly [number, number],
  ): Promise<void> => {
    const result = await fn({
      request: audioRequest(range),
      response: fullResponse(),
    });

    expect(result.status).toBe(206);
    expect(result.headers.get('Content-Range')).toBe(
      `bytes ${start}-${end}/1000`,
    );
    expect(result.headers.get('Content-Length')).toBe(String(end - start + 1));
    expect(await readBytes(result)).toEqual(BODY.slice(start, end + 1));
  };

  it(`${SCENARIO}: Range: bytes=0- trên response 200 thành 206 đủ 1000 byte`, async () => {
    await expectPartial(toPartialResponse, 'bytes=0-', [0, 999]);
  });

  it(`${SCENARIO}: Range: bytes=100-199 trả đúng 100 byte giữa file`, async () => {
    await expectPartial(toPartialResponse, 'bytes=100-199', [100, 199]);
  });

  it(`${SCENARIO}: không có Range hoặc response đã là 206 thì giữ nguyên`, async () => {
    const plain = fullResponse();
    expect(
      await toPartialResponse({ request: audioRequest(), response: plain }),
    ).toBe(plain);

    const partial = new Response(BODY.slice(0, 10), {
      status: 206,
      headers: { 'Content-Range': 'bytes 0-9/1000' },
    });
    expect(
      await toPartialResponse({
        request: audioRequest('bytes=0-'),
        response: partial,
      }),
    ).toBe(partial);
  });

  it(`${SCENARIO}: Range không đọc được thì giữ nguyên response`, async () => {
    for (const range of ['bytes=abc-', 'not-a-range']) {
      const response = fullResponse();
      const result = await toPartialResponse({
        request: audioRequest(range),
        response,
      });
      expect(result, range).toBe(response);
    }
  });

  it(`${SCENARIO}: bản dựng lại từ toString() cho cùng kết quả (hàm tự chứa)`, async () => {
    const rebuilt = rebuildPartialFromSource(toPartialResponse);

    await expectPartial(rebuilt, 'bytes=0-', [0, 999]);
    await expectPartial(rebuilt, 'bytes=100-199', [100, 199]);
  });

  it(`${SCENARIO}: route runtime CacheFirst vào audio-cache, chỉ lưu 200, có Range và hai plugin`, () => {
    const config = createAudioRuntimeCaching();

    expect(config.handler).toBe('CacheFirst');
    expect(config.urlPattern).toBeInstanceOf(RegExp);
    if (config.urlPattern instanceof RegExp) {
      expect(config.urlPattern.test(AUDIO_URL)).toBe(true);
      expect(
        config.urlPattern.test('https://app.example/content/content.json'),
      ).toBe(false);
    }
    expect(config.options?.cacheName).toBe('audio-cache');
    expect(config.options?.cacheableResponse?.statuses).toEqual([200]);
    expect(config.options?.rangeRequests).toBe(true);
    expect(config.options?.plugins).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ requestWillFetch: stripRangeRequest }),
        expect.objectContaining({ handlerWillRespond: toPartialResponse }),
      ]),
    );
  });
});
