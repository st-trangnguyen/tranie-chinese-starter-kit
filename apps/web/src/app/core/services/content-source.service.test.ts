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
