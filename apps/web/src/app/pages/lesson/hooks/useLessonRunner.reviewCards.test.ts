import { act, renderHook, waitFor } from '@testing-library/react';

import {
  DexieProgressStore,
  progressStore,
} from '@core/services/progress-store.service';
import {
  cardKeysOf,
  clearDatabase,
  GREETING_WORDS,
  greetingLesson,
  mockGreetingContent,
  settleWrites,
} from '@test/lesson-runner-cards.helpers';
import { mockContentFetch } from '@test/mocks/content-fetch';
import { useLessonRunner } from './useLessonRunner';

/** Chủ đề có hai bài học (你好, 谢谢) và bài kiểm tra cuối chủ đề phủ cả hai từ. */
const CONTENT_ROOT = {
  contentVersion: '0123456789ab',
  stages: [
    {
      id: 'hsk1',
      title: 'HSK 1',
      units: [
        { id: 'unit-g', title: 'Chào hỏi', lessonIds: ['g1', 'g2', 'test-g'] },
      ],
    },
  ],
};

const UNIT_LESSONS: Record<string, unknown> = {
  g1: {
    id: 'g1',
    type: 'lesson',
    title: 'Bài g1',
    exercises: [{ id: 'g1-e1', kind: 'tone-choice', wordId: '你好' }],
  },
  g2: {
    id: 'g2',
    type: 'lesson',
    title: 'Bài g2',
    exercises: [{ id: 'g2-e1', kind: 'tone-choice', wordId: '谢谢' }],
  },
  'test-g': { ...greetingLesson('test-g'), type: 'test', title: 'Kiểm tra' },
};

const mockUnitContent = (): void => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    mockContentFetch(
      (input) => {
        const url = String(input);
        if (url === '/content/content.json') {
          return Response.json(CONTENT_ROOT);
        }
        if (/\/strokes\/index\.json$/.test(url)) {
          return Response.json([]);
        }
        const id = /\/content\/lessons\/(.+)\.json$/.exec(url)?.[1] ?? '';
        const lesson = UNIT_LESSONS[decodeURIComponent(id)];
        return lesson === undefined
          ? new Response('', { status: 404 })
          : Response.json(lesson);
      },
      { words: GREETING_WORDS },
    ),
  );
};

beforeEach(async () => {
  await clearDatabase();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useLessonRunner — tạo thẻ ôn tập khi xong bài', () => {
  it('S9.1-AC1 Xong bài học thì tạo thẻ nghĩa và nghe: chưa có thẻ, làm hết bài 你好 + 谢谢 không bỏ câu → đúng 4 thẻ nghĩa/nghe "mới"', async () => {
    mockGreetingContent();
    const { result } = renderHook(() => useLessonRunner('a'));
    await waitFor(() => expect(result.current.session).not.toBeNull());

    for (let step = 0; step < 2; step += 1) {
      act(() => result.current.submitResult({ isCorrect: true }));
      act(() => result.current.continueLesson());
    }
    expect(result.current.session?.phase).toBe('finished');
    await waitFor(async () =>
      expect((await progressStore.getLessonProgress('a'))?.status).toBe(
        'completed',
      ),
    );

    await waitFor(async () =>
      expect(await cardKeysOf()).toEqual(
        [
          '你好:meaning:new',
          '你好:listening:new',
          '谢谢:meaning:new',
          '谢谢:listening:new',
        ].sort(),
      ),
    );
  });
  it('S9.1-AC1 Bài chưa xong không tạo thẻ: trả lời 1 câu rồi thoát bài → không có thẻ', async () => {
    mockGreetingContent();
    const { result, unmount } = renderHook(() => useLessonRunner('a'));
    await waitFor(() => expect(result.current.session).not.toBeNull());

    act(() => result.current.submitResult({ isCorrect: true }));
    act(() => result.current.continueLesson());
    expect(result.current.session?.phase).toBe('answering');
    await waitFor(async () =>
      expect((await progressStore.getLessonProgress('a'))?.status).toBe(
        'in-progress',
      ),
    );
    unmount();
    await settleWrites();

    expect(await cardKeysOf()).toEqual([]);
  });

  it('S9.1-AC1 Bài chưa xong không tạo thẻ: làm hết bài nhưng bỏ qua 1 câu → không có thẻ', async () => {
    mockGreetingContent();
    const { result } = renderHook(() => useLessonRunner('a'));
    await waitFor(() => expect(result.current.session).not.toBeNull());

    act(() => result.current.skipExercise());
    act(() => result.current.submitResult({ isCorrect: true }));
    act(() => result.current.continueLesson());
    expect(result.current.session?.phase).toBe('finished');
    await waitFor(async () =>
      expect(await progressStore.getLessonProgress('a')).toBeDefined(),
    );
    await settleWrites();

    expect((await progressStore.getLessonProgress('a'))?.status).not.toBe(
      'completed',
    );
    expect(await cardKeysOf()).toEqual([]);
  });

  it('S9.1-AC1 Bài kiểm tra không tạo thẻ: làm hết bài kiểm tra cuối chủ đề, đúng mọi câu → không có thẻ', async () => {
    mockUnitContent();
    const { result } = renderHook(() => useLessonRunner('test-g'));
    await waitFor(() => expect(result.current.session).not.toBeNull());

    for (let step = 0; step < 2; step += 1) {
      act(() => result.current.submitResult({ isCorrect: true }));
      act(() => result.current.continueLesson());
    }
    expect(result.current.session?.phase).toBe('finished');
    await waitFor(async () =>
      expect((await progressStore.getLessonProgress('test-g'))?.status).toBe(
        'completed',
      ),
    );
    await settleWrites();

    expect(await cardKeysOf()).toEqual([]);
  });

  it('S9.1-AC1 Bài được mở nhờ kiểm tra vượt cấp không tạo thẻ: qua bài kiểm tra vượt cấp, các bài của chủ đề "Đã xong" → không có thẻ', async () => {
    mockUnitContent();
    const { result } = renderHook(() =>
      useLessonRunner('test-g', { placementUnitId: 'unit-g' }),
    );
    await waitFor(() => expect(result.current.session).not.toBeNull());

    for (let step = 0; step < 2; step += 1) {
      act(() => result.current.submitResult({ isCorrect: true }));
      act(() => result.current.continueLesson());
    }
    expect(result.current.session?.phase).toBe('finished');
    await waitFor(async () => {
      for (const lessonId of ['g1', 'g2', 'test-g']) {
        expect((await progressStore.getLessonProgress(lessonId))?.status).toBe(
          'completed',
        );
      }
    });
    await settleWrites();

    expect(await cardKeysOf()).toEqual([]);
  });

  it('S9.1-AC1 Thẻ còn thiếu được tạo ở lần xong bài sau: lần đầu lưu thẻ lỗi, làm lại hết bài → có thẻ 你好 nghĩa và nghe', async () => {
    mockGreetingContent();
    vi.spyOn(DexieProgressStore.prototype, 'addNewCards').mockRejectedValueOnce(
      new Error('QuotaExceededError'),
    );
    const finishLessonA = async (): Promise<() => void> => {
      const { result, unmount } = renderHook(() => useLessonRunner('a'));
      await waitFor(() => expect(result.current.session).not.toBeNull());
      for (let step = 0; step < 2; step += 1) {
        act(() => result.current.submitResult({ isCorrect: true }));
        act(() => result.current.continueLesson());
      }
      expect(result.current.session?.phase).toBe('finished');
      return unmount;
    };

    const unmountFirst = await finishLessonA();
    await waitFor(async () =>
      expect((await progressStore.getLessonProgress('a'))?.status).toBe(
        'completed',
      ),
    );
    await settleWrites();
    expect(await cardKeysOf()).toEqual([]);
    unmountFirst();

    await finishLessonA();

    await waitFor(async () =>
      expect(await cardKeysOf()).toEqual(
        expect.arrayContaining(['你好:meaning:new', '你好:listening:new']),
      ),
    );
  });

  it('S9.1-AC1 Xong bài học thì tạo thẻ nghĩa và nghe (D5: ghi "Đã xong" lỗi vẫn tạo thẻ): tổng kết báo chưa lưu, vẫn có đủ 4 thẻ nghĩa/nghe "mới"', async () => {
    mockGreetingContent();
    const saveLessonProgress = DexieProgressStore.prototype.saveLessonProgress;
    vi.spyOn(
      DexieProgressStore.prototype,
      'saveLessonProgress',
    ).mockImplementation(function (this: DexieProgressStore, progress) {
      return progress.status === 'completed'
        ? Promise.reject(new Error('QuotaExceededError'))
        : saveLessonProgress.call(this, progress);
    });
    const { result } = renderHook(() => useLessonRunner('a'));
    await waitFor(() => expect(result.current.session).not.toBeNull());

    for (let step = 0; step < 2; step += 1) {
      act(() => result.current.submitResult({ isCorrect: true }));
      act(() => result.current.continueLesson());
    }
    expect(result.current.session?.phase).toBe('finished');
    await waitFor(() => expect(result.current.isSaved).toBe(false));

    await waitFor(async () =>
      expect(await cardKeysOf()).toEqual(
        [
          '你好:meaning:new',
          '你好:listening:new',
          '谢谢:meaning:new',
          '谢谢:listening:new',
        ].sort(),
      ),
    );
    expect((await progressStore.getLessonProgress('a'))?.status).not.toBe(
      'completed',
    );
  });
});
