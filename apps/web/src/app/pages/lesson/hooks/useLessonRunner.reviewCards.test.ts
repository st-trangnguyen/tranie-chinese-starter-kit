import { act, renderHook, waitFor } from '@testing-library/react';

import type { Word } from '@csk/shared';
import { createDatabase } from '@core/helpers/db.helper';
import { progressStore } from '@core/services/progress-store.service';
import { mockContentFetch, wordOf } from '@test/mocks/content-fetch';
import { useLessonRunner } from './useLessonRunner';

/** Xoá dữ liệu cũ trong IndexedDB thật (fake-indexeddb) của app: cả năm bảng. */
const clearDatabase = async (): Promise<void> => {
  const db = createDatabase();
  await db.settings.clear();
  await db.lessonProgress.clear();
  await db.dailyStats.clear();
  await db.cards.clear();
  await db.writtenCharacters.clear();
  db.close();
};

const GREETING_WORDS: readonly Word[] = [
  { ...wordOf('你好'), hanzi: '你好', pinyin: 'nǐ hǎo', vi: ['xin chào'] },
  { ...wordOf('谢谢'), hanzi: '谢谢', pinyin: 'xièxie', vi: ['cảm ơn'] },
];

const greetingLesson = (id: string) => ({
  id,
  type: 'lesson',
  title: `Bài ${id}`,
  exercises: [
    { id: `${id}-e1`, kind: 'tone-choice', wordId: '你好' },
    { id: `${id}-e2`, kind: 'pinyin-type', wordId: '谢谢' },
  ],
});

const mockGreetingContent = (): void => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    mockContentFetch(
      (input) => {
        const url = String(input);
        if (/\/strokes\/index\.json$/.test(url)) {
          return Response.json([]);
        }
        const lessonId = /\/content\/lessons\/(.+)\.json$/.exec(url)?.[1];
        return lessonId === undefined
          ? new Response('', { status: 404 })
          : Response.json(greetingLesson(decodeURIComponent(lessonId)));
      },
      { words: GREETING_WORDS },
    ),
  );
};

const cardKeysOf = async (): Promise<string[]> =>
  (await progressStore.getAllCards())
    .map((card) => `${card.wordId}:${card.facet}:${card.state}`)
    .sort();

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
});
