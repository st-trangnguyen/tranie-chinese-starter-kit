import { vi } from 'vitest';

import type { Word } from '@csk/shared';

import { createDatabase } from '@core/helpers/db.helper';
import { progressStore } from '@core/services/progress-store.service';
import { mockContentFetch, wordOf } from '@test/mocks/content-fetch';

/**
 * Helper dùng chung cho test hook màn bài tạo thẻ ôn tập (S9.1, `useLessonRunner`):
 * IndexedDB thật của app (fake-indexeddb), bài thử 你好 + 谢谢, đọc thẻ qua `progressStore`.
 */

/** Xoá dữ liệu cũ trong IndexedDB thật (fake-indexeddb) của app: cả năm bảng. */
export const clearDatabase = async (): Promise<void> => {
  const db = createDatabase();
  await db.settings.clear();
  await db.lessonProgress.clear();
  await db.dailyStats.clear();
  await db.cards.clear();
  await db.writtenCharacters.clear();
  db.close();
};

export const GREETING_WORDS: readonly Word[] = [
  { ...wordOf('你好'), hanzi: '你好', pinyin: 'nǐ hǎo', vi: ['xin chào'] },
  { ...wordOf('谢谢'), hanzi: '谢谢', pinyin: 'xièxie', vi: ['cảm ơn'] },
];

export const greetingLesson = (id: string) => ({
  id,
  type: 'lesson',
  title: `Bài ${id}`,
  exercises: [
    { id: `${id}-e1`, kind: 'tone-choice', wordId: '你好' },
    { id: `${id}-e2`, kind: 'pinyin-type', wordId: '谢谢' },
  ],
});

/** Mọi bài (theo id trong URL) là bài học hai câu 你好 + 谢谢. */
export const mockGreetingContent = (): void => {
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

/** Thẻ trong DB dạng `wordId:facet:state`, đã sắp xếp. */
export const cardKeysOf = async (): Promise<string[]> =>
  (await progressStore.getAllCards())
    .map((card) => `${card.wordId}:${card.facet}:${card.state}`)
    .sort();

/**
 * Chờ hàng đợi ghi của hook chạy hết: bài chưa xong không có lần ghi nào để chờ theo,
 * nên đợi một khoảng đủ cho đọc/ghi IndexedDB (fake-indexeddb) hoàn tất.
 */
export const settleWrites = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 200);
  });
