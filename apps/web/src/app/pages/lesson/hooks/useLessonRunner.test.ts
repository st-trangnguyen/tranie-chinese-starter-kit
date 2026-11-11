import { renderHook, waitFor } from '@testing-library/react';

import { useLessonRunner } from './useLessonRunner';

const lessonOf = (id: string) => ({
  id,
  type: 'lesson',
  title: `Bài ${id}`,
  exercises: [{ id: `${id}-e1`, kind: 'tone-choice', wordId: '八' }],
});

const lessonIdOf = (input: RequestInfo | URL): string | undefined =>
  /\/content\/lessons\/(.+)\.json$/.exec(String(input))?.[1];

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useLessonRunner — đổi bài', () => {
  it('S3.2-AC1: should drop the previous lesson as soon as lessonId changes', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const id = lessonIdOf(input);
      return id === 'a'
        ? Promise.resolve(Response.json(lessonOf('a')))
        : new Promise<Response>(() => undefined);
    });
    const { result, rerender } = renderHook(
      ({ lessonId }) => useLessonRunner(lessonId),
      { initialProps: { lessonId: 'a' } },
    );
    await waitFor(() => expect(result.current.lesson?.id).toBe('a'));

    rerender({ lessonId: 'b' });

    expect(result.current.lesson).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it('S3.2-AC1: should not keep the error after moving to a lesson that opens', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const id = lessonIdOf(input);
      return id === 'ok'
        ? Response.json(lessonOf('ok'))
        : new Response('', { status: 404 });
    });
    const { result, rerender } = renderHook(
      ({ lessonId }) => useLessonRunner(lessonId),
      { initialProps: { lessonId: 'missing' } },
    );
    await waitFor(() => expect(result.current.hasError).toBe(true));

    rerender({ lessonId: 'ok' });

    await waitFor(() => expect(result.current.lesson?.id).toBe('ok'));
    expect(result.current.hasError).toBe(false);
  });

  it('S3.2-AC1: should not show the previous lesson when the next one fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const id = lessonIdOf(input);
      return id === 'a'
        ? Response.json(lessonOf('a'))
        : new Response('', { status: 404 });
    });
    const { result, rerender } = renderHook(
      ({ lessonId }) => useLessonRunner(lessonId),
      { initialProps: { lessonId: 'a' } },
    );
    await waitFor(() => expect(result.current.lesson?.id).toBe('a'));

    rerender({ lessonId: 'missing' });

    await waitFor(() => expect(result.current.hasError).toBe(true));
    expect(result.current.lesson).toBeNull();
  });
});
