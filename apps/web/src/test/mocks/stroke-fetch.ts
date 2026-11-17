/**
 * Mock `fetch` ở ranh giới cho dữ liệu nét (S6.1). Phục vụ file thật do `content:build` sinh
 * trong `src/assets/content/strokes/` (`index.json` và `<chữ>.json`) theo URL
 * `/content/strokes/...`. `overrides` ghi đè phản hồi cho một tên file (đã decode), ví dụ
 * `{ '人.json': () => new Response('', { status: 500 }) }`. URL đã gọi được ghi vào `requests`.
 * Dùng `vi.spyOn(globalThis, 'fetch').mockImplementation(strokeFetch.fetch)`.
 */

type Respond = () => Response | Promise<Response>;

const STROKE_FILES: Record<string, unknown> = import.meta.glob(
  '../../assets/content/strokes/*.json',
  { eager: true, import: 'default' },
);

const STROKE_URL = /^\/content\/strokes\/(.+)$/;

const fileNameOf = (path: string): string => path.split('/').at(-1) ?? '';

const STROKE_BODIES = new Map<string, unknown>(
  Object.entries(STROKE_FILES).map(([path, body]) => [fileNameOf(path), body]),
);

export interface StrokeFetchMock {
  fetch: (input: RequestInfo | URL) => Promise<Response>;
  /** URL đã được gọi, theo thứ tự. */
  requests: string[];
}

export const mockStrokeFetch = (
  overrides: Readonly<Record<string, Respond>> = {},
): StrokeFetchMock => {
  const requests: string[] = [];

  const fetch = async (input: RequestInfo | URL): Promise<Response> => {
    const url = input instanceof Request ? input.url : String(input);
    requests.push(url);
    const match = STROKE_URL.exec(url);
    if (!match) {
      return new Response('', { status: 404 });
    }
    const fileName = decodeURIComponent(match[1] ?? '');
    const override = overrides[fileName];
    if (override) {
      return override();
    }
    if (!STROKE_BODIES.has(fileName)) {
      return new Response('', { status: 404 });
    }
    return Response.json(STROKE_BODIES.get(fileName));
  };

  return { fetch, requests };
};
