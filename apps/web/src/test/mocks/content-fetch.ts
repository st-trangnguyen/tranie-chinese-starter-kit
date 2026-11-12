import type { Sentence, Word } from '@csk/shared';

/**
 * Mock `fetch` cho nội dung: `respond` phục vụ lesson/root như trước; `words.json` và
 * `sentences.json` được sinh từ mọi bài đã được phục vụ, sao cho mọi `wordId`/`wordIds`/
 * `sentenceId` đều resolve. Dùng `vi.spyOn(globalThis, 'fetch').mockImplementation(...)`.
 */

export const wordOf = (id: string): Word => ({
  id,
  hanzi: '八',
  pinyin: 'bā',
  vi: ['tám'],
  viReviewed: true,
  hsk: 1,
  audio: 'audio/0123456789abcdef.mp3',
});

export const sentenceOf = (id: string): Sentence => ({
  id,
  hanzi: '你好',
  pinyin: 'nǐ hǎo',
  vi: 'xin chào',
  voice: 'female',
  audio: 'audio/fedcba9876543210.mp3',
});

interface ContentFetchOptions {
  /** Ghi đè nội dung `words.json` (mặc định: từ của mọi bài đã phục vụ). */
  words?: readonly Word[];
  /** Cho `words.json` trả mã lỗi này. */
  wordsStatus?: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const strings = (value: unknown): string[] => {
  if (typeof value === 'string') {
    return [value];
  }
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
};

export const mockContentFetch = (
  respond: (input: RequestInfo | URL) => Response | Promise<Response>,
  options: ContentFetchOptions = {},
): ((input: RequestInfo | URL) => Promise<Response>) => {
  const wordIds = new Set<string>();
  const sentenceIds = new Set<string>();

  const track = async (response: Response): Promise<void> => {
    if (!response.ok) {
      return;
    }
    const body: unknown = await response
      .clone()
      .json()
      .catch(() => undefined);
    if (!isRecord(body) || !Array.isArray(body.exercises)) {
      return;
    }
    for (const exercise of body.exercises) {
      if (!isRecord(exercise)) {
        continue;
      }
      strings(exercise.wordId).forEach((id) => wordIds.add(id));
      strings(exercise.wordIds).forEach((id) => wordIds.add(id));
      strings(exercise.sentenceId).forEach((id) => sentenceIds.add(id));
    }
  };

  return async (input) => {
    const url = String(input);
    if (/\/words\.json$/.test(url)) {
      if (options.wordsStatus) {
        return new Response('', { status: options.wordsStatus });
      }
      return Response.json(options.words ?? [...wordIds].map(wordOf));
    }
    if (/\/sentences\.json$/.test(url)) {
      return Response.json([...sentenceIds].map(sentenceOf));
    }
    const response = await respond(input);
    await track(response);
    return response;
  };
};
