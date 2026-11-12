import { act, renderHook, waitFor } from '@testing-library/react';

import { progressStore } from '@core/services/progress-store.service';
import { useLessonRunner } from './useLessonRunner';

// Ranh giới ngoài của hook là cổng WrongAnswerSink (hook tự tạo LessonService nên không tiêm
// được qua props): thay lớp LessonService bằng bản con luôn dùng cổng giả, logic còn lại là thật.
const sink = vi.hoisted(() => ({
  record: vi.fn<(lessonId: string, ids: readonly string[]) => Promise<void>>(),
}));

vi.mock('@shared/services/lesson.service', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@shared/services/lesson.service')>();
  class LessonServiceWithSink extends actual.LessonService {
    constructor() {
      super(undefined, undefined, sink);
    }
  }
  return { ...actual, LessonService: LessonServiceWithSink };
});

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

const threeExerciseLesson = (id: string) => ({
  id,
  type: 'lesson',
  title: `Bài ${id}`,
  exercises: [1, 2, 3].map((n) => ({
    id: `${id}-e${n}`,
    kind: 'tone-choice',
    wordId: '八',
  })),
});

const openThreeExerciseLesson = async (lessonId: string) => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
    Response.json(threeExerciseLesson(lessonId)),
  );
  vi.spyOn(progressStore, 'getLessonProgress').mockResolvedValue(undefined);
  const { result } = renderHook(() => useLessonRunner(lessonId));
  await waitFor(() => expect(result.current.session).not.toBeNull());
  return result;
};

const mockLessons = (pendingIds: readonly string[] = []) => {
  vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
    const raw = lessonIdOf(input);
    const id = raw === undefined ? undefined : decodeURIComponent(raw);
    if (id === undefined || pendingIds.includes(id)) {
      return new Promise<Response>(() => undefined);
    }
    return Promise.resolve(Response.json(threeExerciseLesson(id)));
  });
  vi.spyOn(progressStore, 'getLessonProgress').mockResolvedValue(undefined);
};

describe('useLessonRunner — lưu vị trí câu', () => {
  it('S3.3-AC1: should save the cursor only when the question changes, not while viewing feedback', async () => {
    const save = vi
      .spyOn(progressStore, 'saveLessonProgress')
      .mockResolvedValue(undefined);
    const result = await openThreeExerciseLesson('a');

    act(() => result.current.submitResult({ isCorrect: true }));
    await act(async () => undefined);
    const callsWhileViewingFeedback = save.mock.calls.length;
    expect(result.current.session?.phase).toBe('feedback');

    act(() => result.current.continueLesson());

    await waitFor(() =>
      expect(save).toHaveBeenLastCalledWith({
        lessonId: 'a',
        status: 'in-progress',
        cursor: 1,
      }),
    );
    expect(save.mock.calls.length).toBe(callsWhileViewingFeedback + 1);
  });

  it('S3.3-AC1: should keep going without an error when the cursor cannot be saved', async () => {
    const save = vi
      .spyOn(progressStore, 'saveLessonProgress')
      .mockRejectedValue(new Error('IndexedDB đầy'));
    const result = await openThreeExerciseLesson('a');

    act(() => result.current.submitResult({ isCorrect: true }));
    act(() => result.current.continueLesson());

    await waitFor(() => expect(save).toHaveBeenCalled());
    await act(async () => undefined);
    expect(result.current.session?.currentIndex).toBe(1);
    expect(result.current.session?.phase).toBe('answering');
    expect(result.current.hasError).toBe(false);
  });

  it('S3.3-AC1: should keep the saved cursor equal to the current question while viewing feedback', async () => {
    const save = vi
      .spyOn(progressStore, 'saveLessonProgress')
      .mockResolvedValue(undefined);
    const result = await openThreeExerciseLesson('a');

    act(() => result.current.submitResult({ isCorrect: true }));
    act(() => result.current.continueLesson());
    act(() => result.current.submitResult({ isCorrect: false }));
    await act(async () => undefined);

    expect(result.current.session?.phase).toBe('feedback');
    expect(result.current.session?.currentIndex).toBe(1);
    expect(save).toHaveBeenLastCalledWith({
      lessonId: 'a',
      status: 'in-progress',
      cursor: 1,
    });
  });

  it('S3.3-AC1: should write cursors in order and start the next write only after the previous one finishes', async () => {
    const finishers: Array<() => void> = [];
    const save = vi
      .spyOn(progressStore, 'saveLessonProgress')
      .mockImplementation(
        () => new Promise<void>((resolve) => finishers.push(resolve)),
      );
    const result = await openThreeExerciseLesson('a');

    act(() => result.current.submitResult({ isCorrect: true }));
    act(() => result.current.continueLesson());
    act(() => result.current.submitResult({ isCorrect: true }));
    act(() => result.current.continueLesson());
    await act(async () => undefined);

    expect(result.current.session?.currentIndex).toBe(2);
    expect(save.mock.calls.map(([progress]) => progress.cursor)).toEqual([1]);

    await act(async () => finishers[0]?.());
    await waitFor(() => expect(save).toHaveBeenCalledTimes(2));
    expect(save.mock.calls.map(([progress]) => progress.cursor)).toEqual([
      1, 2,
    ]);
    await act(async () => finishers[1]?.());
  });

  it('S3.3-AC1: should not carry the position of the previous lesson into the next one', async () => {
    const save = vi
      .spyOn(progressStore, 'saveLessonProgress')
      .mockResolvedValue(undefined);
    mockLessons();
    const { result, rerender } = renderHook(
      ({ lessonId }) => useLessonRunner(lessonId),
      { initialProps: { lessonId: 'a' } },
    );
    await waitFor(() => expect(result.current.session).not.toBeNull());
    act(() => result.current.submitResult({ isCorrect: true }));
    act(() => result.current.continueLesson());
    await waitFor(() => expect(save).toHaveBeenCalledTimes(1));

    rerender({ lessonId: 'b' });
    await waitFor(() => expect(result.current.lesson?.id).toBe('b'));
    await act(async () => undefined);

    expect(result.current.session?.currentIndex).toBe(0);
    expect(save).toHaveBeenCalledTimes(1);
    expect(
      save.mock.calls.some(([progress]) => progress.lessonId === 'b'),
    ).toBe(false);
  });

  it('S3.3-AC1: should not save when reopening a lesson that was finished before switching away', async () => {
    const save = vi
      .spyOn(progressStore, 'saveLessonProgress')
      .mockResolvedValue(undefined);
    mockLessons(['b']);
    const { result, rerender } = renderHook(
      ({ lessonId }) => useLessonRunner(lessonId),
      { initialProps: { lessonId: 'a' } },
    );
    await waitFor(() => expect(result.current.session).not.toBeNull());
    for (let step = 0; step < 3; step += 1) {
      act(() => result.current.submitResult({ isCorrect: true }));
      act(() => result.current.continueLesson());
    }
    await act(async () => undefined);
    expect(result.current.session?.phase).toBe('finished');
    const callsBeforeSwitching = save.mock.calls.length;

    rerender({ lessonId: 'b' });
    rerender({ lessonId: 'a' });
    await waitFor(() =>
      expect(result.current.session?.phase).toBe('answering'),
    );
    await act(async () => undefined);

    expect(save.mock.calls.length).toBe(callsBeforeSwitching);
  });

  it('S3.3-AC1: should still save the first question change after A to B to A reloads A at the same position', async () => {
    const save = vi
      .spyOn(progressStore, 'saveLessonProgress')
      .mockResolvedValue(undefined);
    let fetchesOfA = 0;
    let finishSecondA: () => void = () => undefined;
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const id = lessonIdOf(input);
      if (id === 'a') {
        fetchesOfA += 1;
        if (fetchesOfA === 1) {
          return Promise.resolve(Response.json(threeExerciseLesson('a')));
        }
        return new Promise<Response>((resolve) => {
          finishSecondA = () =>
            resolve(Response.json(threeExerciseLesson('a')));
        });
      }
      return new Promise<Response>(() => undefined);
    });
    vi.spyOn(progressStore, 'getLessonProgress').mockResolvedValue(undefined);
    const { result, rerender } = renderHook(
      ({ lessonId }) => useLessonRunner(lessonId),
      { initialProps: { lessonId: 'a' } },
    );
    await waitFor(() => expect(result.current.session).not.toBeNull());

    rerender({ lessonId: 'b' });
    rerender({ lessonId: 'a' });
    await waitFor(() => expect(fetchesOfA).toBe(2));
    finishSecondA();
    await act(async () => undefined);
    await act(async () => undefined);
    expect(result.current.session?.currentIndex).toBe(0);
    expect(save).not.toHaveBeenCalled();

    act(() => result.current.submitResult({ isCorrect: true }));
    act(() => result.current.continueLesson());

    await waitFor(() =>
      expect(save).toHaveBeenCalledWith({
        lessonId: 'a',
        status: 'in-progress',
        cursor: 1,
      }),
    );
  });

  it.each([
    ['a:1', 'a'],
    ['a', 'a:1'],
  ])(
    'S3.3-AC1: should not save on first open of the second lesson when ids are %s then %s',
    async (firstId, nextId) => {
      const save = vi
        .spyOn(progressStore, 'saveLessonProgress')
        .mockResolvedValue(undefined);
      mockLessons();
      const { result, rerender } = renderHook(
        ({ lessonId }) => useLessonRunner(lessonId),
        { initialProps: { lessonId: firstId } },
      );
      await waitFor(() => expect(result.current.lesson?.id).toBe(firstId));

      rerender({ lessonId: nextId });
      await waitFor(() => expect(result.current.lesson?.id).toBe(nextId));
      await act(async () => undefined);

      expect(save).not.toHaveBeenCalled();
    },
  );
});

describe('useLessonRunner — làm lại bài kiểm tra (S3.5)', () => {
  const answerAll = async (
    result: { current: ReturnType<typeof useLessonRunner> },
    outcomes: readonly boolean[],
  ) => {
    for (const isCorrect of outcomes) {
      act(() => result.current.submitResult({ isCorrect }));
      act(() => result.current.continueLesson());
    }
    await act(async () => undefined);
  };

  it('S3.5-AC2: should record only the wrong ids of the retry attempt, not those of the first one', async () => {
    sink.record.mockReset().mockResolvedValue(undefined);
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      Response.json({ ...threeExerciseLesson('t'), type: 'test' }),
    );
    vi.spyOn(progressStore, 'getLessonProgress').mockResolvedValue(undefined);
    vi.spyOn(progressStore, 'saveLessonProgress').mockResolvedValue(undefined);
    const { result } = renderHook(() => useLessonRunner('t'));
    await waitFor(() => expect(result.current.session).not.toBeNull());

    await answerAll(result, [false, true, true]);
    await waitFor(() => expect(sink.record).toHaveBeenCalledTimes(1));
    expect(sink.record).toHaveBeenLastCalledWith('t', ['t-e1']);

    act(() => result.current.restart());
    await answerAll(result, [true, false, false]);

    await waitFor(() => expect(sink.record).toHaveBeenCalledTimes(2));
    expect(sink.record).toHaveBeenLastCalledWith('t', ['t-e2', 't-e3']);
  });
});
