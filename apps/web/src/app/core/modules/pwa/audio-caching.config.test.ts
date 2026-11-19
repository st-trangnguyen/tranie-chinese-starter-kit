import { matchesGlob } from 'node:path';
import { runInNewContext } from 'node:vm';

import {
  listPrecachedAudioPatterns,
  PRECACHE_BASE_PATTERNS,
  stripRangeRequest,
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
