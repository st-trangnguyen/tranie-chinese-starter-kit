import { Fragment, createElement } from 'react';
import { afterEach, beforeEach, expect, vi } from 'vitest';
import { I18nextProvider } from 'react-i18next';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { render } from '@testing-library/react';
import { DEFAULT_SETTINGS, type Settings, type Word } from '@csk/shared';

import { PLAYBACK_RATES } from '@core/constants/audio.constants';
import { createDatabase } from '@core/helpers/db.helper';
import { DexieProgressStore } from '@core/services/progress-store.service';
import LessonRunnerContainer from '@app/pages/lesson/containers/LessonRunnerContainer';
import { mockContentFetch, sentenceOf } from '@test/mocks/content-fetch';
import {
  fakeAudio,
  installRecordingEnvironment,
  restoreRecordingEnvironment,
} from '@test/record-compare.helpers';
import testI18n from '@test/i18n';
import { renderWithProviders, screen, userEvent } from '@test/render';

/**
 * Helper dùng chung cho test màn bài theo Cài đặt của người học (S8.2, S4.4-AC2).
 * Test file gọi `setupLessonPreferences()` ở top level để cài môi trường audio giả
 * và fetch bài `LESSON` (hai câu chọn thanh điệu với chữ 八).
 */

type User = ReturnType<typeof userEvent.setup>;

export const BA: Word = {
  id: 'w-ba',
  hanzi: '八',
  pinyin: 'bā',
  vi: ['tám'],
  viReviewed: true,
  hsk: 1,
  audio: 'audio/aaaaaaaaaaaaaaa1.mp3',
};

const LESSON = {
  id: 'intro-preferences',
  type: 'lesson',
  title: 'Nghe theo Cài đặt',
  exercises: [
    { id: 'e1', kind: 'tone-choice', wordId: BA.id },
    { id: 'e2', kind: 'tone-choice', wordId: BA.id },
  ],
};

export const NIHAO = sentenceOf('s-nihao');

/** Bài có câu "nói" 你好 ở câu 1. */
const SPEAK_LESSON = {
  id: 'intro-pinyin',
  type: 'lesson',
  title: 'Nói theo Cài đặt',
  exercises: [
    { id: 'e1', kind: 'speak', sentenceId: NIHAO.id },
    { id: 'e2', kind: 'tone-choice', wordId: BA.id },
  ],
};

const serveLesson = (lesson: object): void => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    mockContentFetch(
      async (input) =>
        /\/content\/lessons\/.+\.json$/.test(String(input))
          ? Response.json(lesson)
          : new Response('', { status: 404 }),
      { words: [BA] },
    ),
  );
};

/** Phục vụ SPEAK_LESSON cho mọi bài (thay cho LESSON mặc định). */
export const serveSpeakLesson = (): void => {
  serveLesson(SPEAK_LESSON);
};

/** Ghi settings vào IndexedDB thật (fake-indexeddb) của app; xoá dữ liệu cũ trước. */
export const seedSettings = async (patch: Partial<Settings>): Promise<void> => {
  const db = createDatabase();
  await db.settings.clear();
  await db.lessonProgress.clear();
  await new DexieProgressStore(db).saveSettings({
    ...DEFAULT_SETTINGS,
    ...patch,
  });
  db.close();
};

/** Ghi vị trí đang học dở cho bài đang mở (route dùng nguyên văn ':lessonId'). */
export const seedCursor = async (cursor: number): Promise<void> => {
  const db = createDatabase();
  await db.lessonProgress.put({
    lessonId: ':lessonId',
    status: 'in-progress',
    cursor,
  });
  db.close();
};

/** Xoá settings và tiến độ: IndexedDB trống như lần đầu mở app. */
export const clearDatabase = async (): Promise<void> => {
  const db = createDatabase();
  await db.settings.clear();
  await db.lessonProgress.clear();
  db.close();
};

/** Tắt công tắc "Nghe chậm" đang bật sẵn theo Cài đặt. */
export const turnOffSlow = async (user: User): Promise<void> => {
  const toggle = await screen.findByRole('switch', { name: 'Nghe chậm' });
  expect(toggle).toHaveAttribute('aria-checked', 'true');
  await user.click(toggle);
  expect(toggle).toHaveAttribute('aria-checked', 'false');
};

/** Bật công tắc "Nghe chậm" đang tắt theo Cài đặt. */
export const turnOnSlow = async (user: User): Promise<void> => {
  const toggle = await screen.findByRole('switch', { name: 'Nghe chậm' });
  expect(toggle).toHaveAttribute('aria-checked', 'false');
  await user.click(toggle);
  expect(toggle).toHaveAttribute('aria-checked', 'true');
};

/** Công tắc bật và "Nghe" phát 0.75x. */
export const expectSlowPlayback = async (user: User): Promise<void> => {
  expect(
    await screen.findByRole('switch', { name: 'Nghe chậm' }),
  ).toHaveAttribute('aria-checked', 'true');
  await user.click(screen.getByRole('button', { name: 'Nghe' }));
  expect(fakeAudio.playbackRate).toBe(PLAYBACK_RATES.slow);
};

/** Công tắc tắt và "Nghe" phát 1x (đặt sẵn tốc độ khác để không pass nhờ giá trị cũ). */
export const expectNormalPlayback = async (user: User): Promise<void> => {
  expect(
    await screen.findByRole('switch', { name: 'Nghe chậm' }),
  ).toHaveAttribute('aria-checked', 'false');
  fakeAudio.playbackRate = PLAYBACK_RATES.slow;
  await user.click(screen.getByRole('button', { name: 'Nghe' }));
  expect(fakeAudio.src).toBe(`/${BA.audio}`);
  expect(fakeAudio.playbackRate).toBe(PLAYBACK_RATES.normal);
};

export const renderRunner = (): ReturnType<typeof renderWithProviders> =>
  renderWithProviders(createElement(LessonRunnerContainer), {
    route: '/lessons/:lessonId',
  });

/** Hai bài trên cùng route `/lessons/:lessonId`, có liên kết "Bài khác" sang bài l2. */
export const renderTwoLessons = (): User => {
  const openLessons = createElement(
    Fragment,
    null,
    createElement(Link, { to: '/lessons/l2' }, 'Bài khác'),
    createElement(LessonRunnerContainer),
  );
  const user = userEvent.setup();
  render(
    createElement(
      I18nextProvider,
      { i18n: testI18n },
      createElement(
        MemoryRouter,
        { initialEntries: ['/lessons/l1'] },
        createElement(
          Routes,
          null,
          createElement(Route, {
            path: '/lessons/:lessonId',
            element: openLessons,
          }),
        ),
      ),
    ),
  );
  return user;
};

/** Cài audio/ghi âm giả và fetch bài LESSON trước mỗi test; dọn sau mỗi test. */
export const setupLessonPreferences = (): void => {
  beforeEach(() => {
    installRecordingEnvironment();
    fakeAudio.src = '';
    fakeAudio.playbackRate = 1;
    serveLesson(LESSON);
  });

  afterEach(() => {
    restoreRecordingEnvironment();
    vi.restoreAllMocks();
  });
};
