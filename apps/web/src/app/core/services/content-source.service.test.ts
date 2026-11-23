import { FetchContentSource } from './content-source.service';

const respondWith = (body: unknown, init: ResponseInit = {}) =>
  vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(new Response(JSON.stringify(body), init));

const VALID_ROOT = {
  contentVersion: '0123456789ab',
  stages: [
    {
      id: 'intro',
      title: 'Nhập môn',
      units: [{ id: 'intro-a', title: 'Phát âm', lessonIds: ['intro-01'] }],
    },
  ],
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('FetchContentSource', () => {
  it('should load and validate content.json', async () => {
    const fetchSpy = respondWith(VALID_ROOT);

    await expect(new FetchContentSource().getContentRoot()).resolves.toEqual(
      VALID_ROOT,
    );
    expect(fetchSpy).toHaveBeenCalledWith('/content/content.json');
  });

  it('should name the file when the content does not match the schema', async () => {
    respondWith({ stages: 'oops' });

    await expect(new FetchContentSource().getContentRoot()).rejects.toThrow(
      'Nội dung không hợp lệ: /content/content.json',
    );
  });

  it('should name the file when the request fails', async () => {
    respondWith({}, { status: 404 });

    await expect(
      new FetchContentSource().getLesson('intro-99'),
    ).rejects.toThrow(
      'Không tải được nội dung: /content/lessons/intro-99.json (HTTP 404)',
    );
  });
});

const VALID_WORD = {
  id: '你好',
  hanzi: '你好',
  pinyin: 'nǐ hǎo',
  vi: ['xin chào'],
  viReviewed: true,
  hsk: 1,
  audio: 'audio/0123456789abcdef.mp3',
};

const VALID_SENTENCE = {
  id: 'ni-hao-ma',
  hanzi: '你好吗？',
  pinyin: 'nǐ hǎo ma?',
  vi: 'Bạn khỏe không?',
  voice: 'female',
  audio: 'audio/fedcba9876543210.mp3',
};

describe('FetchContentSource.getWords (S4.4 task 5.1)', () => {
  it('S4.4 task 5.1: should return validated words from words.json', async () => {
    const fetchSpy = respondWith([VALID_WORD]);

    await expect(new FetchContentSource().getWords()).resolves.toEqual([
      VALID_WORD,
    ]);
    expect(fetchSpy).toHaveBeenCalledWith('/content/words.json');
  });

  it('S4.4 task 5.1: should throw naming the file when words.json request fails', async () => {
    respondWith({}, { status: 500 });

    await expect(new FetchContentSource().getWords()).rejects.toThrow(
      'Không tải được nội dung: /content/words.json (HTTP 500)',
    );
  });

  it('S4.4 task 5.1: should throw naming the file when words.json does not match the schema', async () => {
    respondWith([{ ...VALID_WORD, pinyin: 'ni3 hao3' }]);

    await expect(new FetchContentSource().getWords()).rejects.toThrow(
      'Nội dung không hợp lệ: /content/words.json',
    );
  });
});

describe('FetchContentSource.getSentences (S4.4 task 5.1)', () => {
  it('S4.4 task 5.1: should return validated sentences from sentences.json', async () => {
    const fetchSpy = respondWith([VALID_SENTENCE]);

    await expect(new FetchContentSource().getSentences()).resolves.toEqual([
      VALID_SENTENCE,
    ]);
    expect(fetchSpy).toHaveBeenCalledWith('/content/sentences.json');
  });

  it('S4.4 task 5.1: should throw naming the file when sentences.json request fails', async () => {
    respondWith({}, { status: 404 });

    await expect(new FetchContentSource().getSentences()).rejects.toThrow(
      'Không tải được nội dung: /content/sentences.json (HTTP 404)',
    );
  });

  it('S4.4 task 5.1: should throw naming the file when sentences.json does not match the schema', async () => {
    respondWith([{ ...VALID_SENTENCE, voice: 'robot' }]);

    await expect(new FetchContentSource().getSentences()).rejects.toThrow(
      'Nội dung không hợp lệ: /content/sentences.json',
    );
  });
});

const VALID_STROKE_INDEX = ['人', '你'];

const VALID_STROKE_DATA = {
  strokes: ['M 0 0 L 10 10 Z', 'M 10 10 L 20 20 Z'],
  medians: [
    [
      [0, 0],
      [10, 10],
    ],
    [
      [10, 10],
      [20, 20],
    ],
  ],
};

const respondWithText = (body: string, init: ResponseInit = {}) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(body, init));

const REN_URL = `/content/strokes/${encodeURIComponent('人')}.json`;

describe('FetchContentSource.getStrokeIndex (S6.1 task 4.1)', () => {
  it('S6.1-AC1: should return the validated stroke index from strokes/index.json', async () => {
    const fetchSpy = respondWith(VALID_STROKE_INDEX);

    await expect(new FetchContentSource().getStrokeIndex()).resolves.toEqual(
      VALID_STROKE_INDEX,
    );
    expect(fetchSpy).toHaveBeenCalledWith('/content/strokes/index.json');
  });

  it('S6.1-AC1: should throw naming the file when strokes/index.json request fails', async () => {
    respondWith({}, { status: 500 });

    await expect(new FetchContentSource().getStrokeIndex()).rejects.toThrow(
      'Không tải được nội dung: /content/strokes/index.json (HTTP 500)',
    );
  });

  it('S6.1-AC1: should throw when strokes/index.json is not valid JSON', async () => {
    respondWithText('not json {');

    await expect(new FetchContentSource().getStrokeIndex()).rejects.toThrow(
      SyntaxError,
    );
  });

  it('S6.1-AC1: should throw naming the file when strokes/index.json does not match the schema', async () => {
    respondWith(['人', 'abc']);

    await expect(new FetchContentSource().getStrokeIndex()).rejects.toThrow(
      'Nội dung không hợp lệ: /content/strokes/index.json',
    );
  });
});

describe('FetchContentSource.getStrokeData (S6.1 task 4.1)', () => {
  it('S6.1-AC1: should return validated stroke data from the URL-encoded character file', async () => {
    const fetchSpy = respondWith(VALID_STROKE_DATA);

    await expect(new FetchContentSource().getStrokeData('人')).resolves.toEqual(
      VALID_STROKE_DATA,
    );
    expect(fetchSpy).toHaveBeenCalledWith(REN_URL);
    expect(REN_URL).toBe('/content/strokes/%E4%BA%BA.json');
  });

  it('S6.1-AC1: should throw naming the file when the stroke data request fails', async () => {
    respondWith({}, { status: 404 });

    await expect(new FetchContentSource().getStrokeData('人')).rejects.toThrow(
      `Không tải được nội dung: ${REN_URL} (HTTP 404)`,
    );
  });

  it('S6.1-AC1: should throw when the stroke data file is not valid JSON', async () => {
    respondWithText('<!doctype html>');

    await expect(new FetchContentSource().getStrokeData('人')).rejects.toThrow(
      SyntaxError,
    );
  });

  it('S6.1-AC1: should throw naming the file when the stroke data has no strokes', async () => {
    respondWith({ medians: VALID_STROKE_DATA.medians });

    await expect(new FetchContentSource().getStrokeData('人')).rejects.toThrow(
      `Nội dung không hợp lệ: ${REN_URL}`,
    );
  });
});

const AUDIO_A = 'audio/0123456789abcdef.mp3';
const AUDIO_B = 'audio/fedcba9876543210.mp3';

const VALID_AUDIO_INDEX = {
  units: { 'hsk1-family': [AUDIO_A], 'intro-strokes': [] },
  bytes: { [AUDIO_A]: 1_048_576, [AUDIO_B]: 2048 },
  precached: [AUDIO_B],
};

describe('FetchContentSource.getAudioIndex (S8.4 task 4.11)', () => {
  const SCENARIO = 'S8.4-AC1 Chủ đề chưa tải có nút tải kèm dung lượng';

  it(`${SCENARIO}: đọc /content/audio-index.json và trả index đã validate`, async () => {
    const fetchSpy = respondWith(VALID_AUDIO_INDEX);

    await expect(new FetchContentSource().getAudioIndex()).resolves.toEqual(
      VALID_AUDIO_INDEX,
    );
    expect(fetchSpy).toHaveBeenCalledWith('/content/audio-index.json');
  });

  it(`${SCENARIO}: audio-index.json sai schema thì throw "Nội dung không hợp lệ" kèm tên file`, async () => {
    respondWith({ ...VALID_AUDIO_INDEX, bytes: { [AUDIO_A]: -1 } });

    await expect(new FetchContentSource().getAudioIndex()).rejects.toThrow(
      'Nội dung không hợp lệ: /content/audio-index.json',
    );
  });
});
