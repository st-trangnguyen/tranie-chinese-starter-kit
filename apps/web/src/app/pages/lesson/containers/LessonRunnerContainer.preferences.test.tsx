import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS, type Settings, type Word } from '@csk/shared';

import { PLAYBACK_RATES } from '@core/constants/audio.constants';
import { createDatabase } from '@core/helpers/db.helper';
import { DexieProgressStore } from '@core/services/progress-store.service';
import { mockContentFetch } from '@test/mocks/content-fetch';
import {
  fakeAudio,
  installRecordingEnvironment,
  restoreRecordingEnvironment,
} from '@test/record-compare.helpers';
import { renderWithProviders, screen } from '@test/render';
import LessonRunnerContainer from './LessonRunnerContainer';

const BA: Word = {
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

/** Ghi settings vào IndexedDB thật (fake-indexeddb) của app; xoá dữ liệu cũ trước. */
const seedSettings = async (patch: Partial<Settings>): Promise<void> => {
  const db = createDatabase();
  await db.settings.clear();
  await db.lessonProgress.clear();
  await new DexieProgressStore(db).saveSettings({
    ...DEFAULT_SETTINGS,
    ...patch,
  });
  db.close();
};

const renderRunner = () =>
  renderWithProviders(<LessonRunnerContainer />, {
    route: '/lessons/:lessonId',
  });

beforeEach(() => {
  installRecordingEnvironment();
  fakeAudio.src = '';
  fakeAudio.playbackRate = 1;
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    mockContentFetch(
      async (input) =>
        /\/content\/lessons\/.+\.json$/.test(String(input))
          ? Response.json(LESSON)
          : new Response('', { status: 404 }),
      { words: [BA] },
    ),
  );
});

afterEach(() => {
  restoreRecordingEnvironment();
  vi.restoreAllMocks();
});

describe('LessonRunnerContainer — theo Cài đặt của người học', () => {
  it('S8.2-AC2 Chọn Chậm thì mở bài là phát chậm: công tắc "Nghe chậm" bật ở câu 1 và "Nghe" phát 0.75x', async () => {
    await seedSettings({ defaultAudioSpeed: 'slow' });
    const { user } = renderRunner();

    expect(await screen.findByText('Câu 1 / 2')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Nghe chậm' })).toHaveAttribute(
      'aria-checked',
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'Nghe' }));

    expect(fakeAudio.src).toBe(`/${BA.audio}`);
    expect(fakeAudio.playbackRate).toBe(PLAYBACK_RATES.slow);
  });
});
