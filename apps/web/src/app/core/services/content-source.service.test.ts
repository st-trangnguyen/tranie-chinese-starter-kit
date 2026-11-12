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
