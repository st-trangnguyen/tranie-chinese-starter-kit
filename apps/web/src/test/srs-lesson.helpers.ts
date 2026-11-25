import { vi } from 'vitest';

import type { Lesson, ReviewCard } from '@csk/shared';

import { createDatabase } from '@core/helpers/db.helper';
import { DexieProgressStore } from '@core/services/progress-store.service';
import type { LessonSession } from '@shared/models/lesson-session.model';
import { SrsService } from '@shared/services/srs.service';
import { makeLesson, makeSource } from '@test/content-service.fixtures';

/**
 * Helper dùng chung cho test use case tạo thẻ ôn tập (S9.1, `SrsService` Phần 3):
 * `DexieProgressStore` thật trên DB tên ngẫu nhiên + `ContentSource` giả.
 * `lessons`: bài mà `getLesson(id)` trả đúng theo id (id khác rơi về `makeLesson`), để code
 * nào nạp bài theo tiến độ đã lưu sẽ thấy đúng từ của bài thật mà test dùng.
 */

export const NOW = Date.UTC(2026, 10, 25, 8, 30);

interface OpenedService {
  store: DexieProgressStore;
  source: ReturnType<typeof makeSource>;
  service: SrsService;
}

export const openService = (lessons: readonly Lesson[] = []): OpenedService => {
  const store = new DexieProgressStore(
    createDatabase(`test-${crypto.randomUUID()}`),
  );
  const source: ReturnType<typeof makeSource> = {
    ...makeSource(),
    getLesson: vi.fn(
      async (lessonId: string) =>
        lessons.find((lesson) => lesson.id === lessonId) ??
        makeLesson(lessonId),
    ),
  };
  return { store, source, service: new SrsService(store, source) };
};

export const finishedSession = (
  exerciseIds: readonly string[],
): LessonSession => ({
  exerciseIds,
  currentIndex: exerciseIds.length - 1,
  phase: 'finished',
  lastResult: null,
  skippedCount: 0,
  correctCount: exerciseIds.length,
  wrongCount: 0,
  wrongExerciseIds: [],
  startedAt: NOW - 60_000,
  finishedAt: NOW,
});

export const GREETING_LESSON: Lesson = {
  id: 'chao-hoi',
  type: 'lesson',
  title: 'Chào hỏi',
  exercises: [
    { id: 'e1', kind: 'tone-choice', wordId: '你好' },
    { id: 'e2', kind: 'pinyin-type', wordId: '谢谢' },
  ],
};

export const keysOf = (cards: readonly ReviewCard[]): string[] =>
  cards.map((card) => `${card.wordId}:${card.facet}:${card.state}`).sort();
