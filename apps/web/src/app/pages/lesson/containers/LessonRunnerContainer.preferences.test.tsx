import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nextProvider } from 'react-i18next';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { render } from '@testing-library/react';
import { DEFAULT_SETTINGS, type Settings, type Word } from '@csk/shared';

import { PLAYBACK_RATES } from '@core/constants/audio.constants';
import { createDatabase } from '@core/helpers/db.helper';
import {
  DexieProgressStore,
  progressStore,
} from '@core/services/progress-store.service';
import { mockContentFetch } from '@test/mocks/content-fetch';
import {
  fakeAudio,
  installRecordingEnvironment,
  restoreRecordingEnvironment,
} from '@test/record-compare.helpers';
import testI18n from '@test/i18n';
import { renderWithProviders, screen, userEvent, waitFor } from '@test/render';
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

/** Ghi vị trí đang học dở cho bài đang mở (route dùng nguyên văn ':lessonId'). */
const seedCursor = async (cursor: number): Promise<void> => {
  const db = createDatabase();
  await db.lessonProgress.put({
    lessonId: ':lessonId',
    status: 'in-progress',
    cursor,
  });
  db.close();
};

/** Tắt công tắc "Nghe chậm" đang bật sẵn theo Cài đặt. */
const turnOffSlow = async (
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> => {
  const toggle = await screen.findByRole('switch', { name: 'Nghe chậm' });
  expect(toggle).toHaveAttribute('aria-checked', 'true');
  await user.click(toggle);
  expect(toggle).toHaveAttribute('aria-checked', 'false');
};

/** Bật công tắc "Nghe chậm" đang tắt theo Cài đặt. */
const turnOnSlow = async (
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> => {
  const toggle = await screen.findByRole('switch', { name: 'Nghe chậm' });
  expect(toggle).toHaveAttribute('aria-checked', 'false');
  await user.click(toggle);
  expect(toggle).toHaveAttribute('aria-checked', 'true');
};

/** Công tắc bật và "Nghe" phát 0.75x. */
const expectSlowPlayback = async (
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> => {
  expect(
    await screen.findByRole('switch', { name: 'Nghe chậm' }),
  ).toHaveAttribute('aria-checked', 'true');
  await user.click(screen.getByRole('button', { name: 'Nghe' }));
  expect(fakeAudio.playbackRate).toBe(PLAYBACK_RATES.slow);
};

/** Xoá settings và tiến độ: IndexedDB trống như lần đầu mở app. */
const clearDatabase = async (): Promise<void> => {
  const db = createDatabase();
  await db.settings.clear();
  await db.lessonProgress.clear();
  db.close();
};

/** Công tắc tắt và "Nghe" phát 1x (đặt sẵn tốc độ khác để không pass nhờ giá trị cũ). */
const expectNormalPlayback = async (
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> => {
  expect(
    await screen.findByRole('switch', { name: 'Nghe chậm' }),
  ).toHaveAttribute('aria-checked', 'false');
  fakeAudio.playbackRate = PLAYBACK_RATES.slow;
  await user.click(screen.getByRole('button', { name: 'Nghe' }));
  expect(fakeAudio.src).toBe(`/${BA.audio}`);
  expect(fakeAudio.playbackRate).toBe(PLAYBACK_RATES.normal);
};

const renderRunner = () =>
  renderWithProviders(<LessonRunnerContainer />, {
    route: '/lessons/:lessonId',
  });

/** Hai bài trên cùng route `/lessons/:lessonId`, có liên kết "Bài khác" sang bài l2. */
const renderTwoLessons = (): ReturnType<typeof userEvent.setup> => {
  const OpenLessons = () => (
    <>
      <Link to="/lessons/l2">Bài khác</Link>
      <LessonRunnerContainer />
    </>
  );
  const user = userEvent.setup();
  render(
    <I18nextProvider i18n={testI18n}>
      <MemoryRouter initialEntries={['/lessons/l1']}>
        <Routes>
          <Route path="/lessons/:lessonId" element={<OpenLessons />} />
        </Routes>
      </MemoryRouter>
    </I18nextProvider>,
  );
  return user;
};

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

  describe('S8.2-AC2 Mở bài mới thì theo tốc độ mặc định Chậm', () => {
    it('S8.2-AC2 Mở bài mới thì theo tốc độ mặc định Chậm: tắt "Nghe chậm" rồi mở lại chính bài thì công tắc bật, "Nghe" phát 0.75x', async () => {
      await seedSettings({ defaultAudioSpeed: 'slow' });
      const first = renderRunner();
      await turnOffSlow(first.user);
      first.unmount();

      const { user } = renderRunner();

      expect(await screen.findByText('Câu 1 / 2')).toBeInTheDocument();
      await expectSlowPlayback(user);
    });

    it('S8.2-AC2 Mở bài mới thì theo tốc độ mặc định Chậm: học tiếp bài đang dở ở câu 2 thì công tắc bật, "Nghe" phát 0.75x', async () => {
      await seedSettings({ defaultAudioSpeed: 'slow' });
      const first = renderRunner();
      await turnOffSlow(first.user);
      first.unmount();
      await seedCursor(1);

      const { user } = renderRunner();

      expect(await screen.findByText('Câu 2 / 2')).toBeInTheDocument();
      await expectSlowPlayback(user);
    });

    it('S8.2-AC2 Mở bài mới thì theo tốc độ mặc định Chậm: sang bài khác trên cùng route thì công tắc bật, "Nghe" phát 0.75x', async () => {
      await seedSettings({ defaultAudioSpeed: 'slow' });
      const user = renderTwoLessons();
      await turnOffSlow(user);

      await user.click(screen.getByRole('link', { name: 'Bài khác' }));

      await waitFor(() =>
        expect(
          screen.getByRole('switch', { name: 'Nghe chậm' }),
        ).toHaveAttribute('aria-checked', 'true'),
      );
      expect(screen.getByText('Câu 1 / 2')).toBeInTheDocument();
      await expectSlowPlayback(user);
    });
  });

  it('S8.2-AC2 Tắt Nghe chậm trong bài không đổi Cài đặt: tắt công tắc thì Cài đặt vẫn "Chậm", không ghi cài đặt', async () => {
    await seedSettings({ defaultAudioSpeed: 'slow' });
    const saveSettings = vi.spyOn(progressStore, 'saveSettings');
    const { user } = renderRunner();
    expect(await screen.findByText('Câu 1 / 2')).toBeInTheDocument();

    await turnOffSlow(user);

    expect(saveSettings).not.toHaveBeenCalled();
    expect((await progressStore.getSettings()).defaultAudioSpeed).toBe('slow');
  });

  describe('S4.4-AC2 Mở bài mới thì về tốc độ thường', () => {
    it('S4.4-AC2 Mở bài mới thì về tốc độ thường: bật "Nghe chậm" rồi mở lại chính bài thì công tắc tắt', async () => {
      await seedSettings({ defaultAudioSpeed: 'normal' });
      const first = renderRunner();
      await turnOnSlow(first.user);
      first.unmount();

      renderRunner();

      expect(await screen.findByText('Câu 1 / 2')).toBeInTheDocument();
      expect(screen.getByRole('switch', { name: 'Nghe chậm' })).toHaveAttribute(
        'aria-checked',
        'false',
      );
    });

    it('S4.4-AC2 Mở bài mới thì về tốc độ thường: bật "Nghe chậm" rồi học tiếp bài đang dở ở câu 2 thì công tắc tắt', async () => {
      await seedSettings({ defaultAudioSpeed: 'normal' });
      const first = renderRunner();
      await turnOnSlow(first.user);
      first.unmount();
      await seedCursor(1);

      renderRunner();

      expect(await screen.findByText('Câu 2 / 2')).toBeInTheDocument();
      expect(screen.getByRole('switch', { name: 'Nghe chậm' })).toHaveAttribute(
        'aria-checked',
        'false',
      );
    });

    it('S4.4-AC2 Mở bài mới thì về tốc độ thường: bật "Nghe chậm" rồi sang bài khác trên cùng route thì công tắc tắt', async () => {
      await seedSettings({ defaultAudioSpeed: 'normal' });
      const user = renderTwoLessons();
      await turnOnSlow(user);

      await user.click(screen.getByRole('link', { name: 'Bài khác' }));

      await waitFor(() =>
        expect(
          screen.getByRole('switch', { name: 'Nghe chậm' }),
        ).toHaveAttribute('aria-checked', 'false'),
      );
      expect(screen.getByText('Câu 1 / 2')).toBeInTheDocument();
    });
  });
  describe('S4.4-AC2 Mặc định phát tốc độ thường', () => {
    it('S4.4-AC2 Mặc định phát tốc độ thường: Cài đặt "Bình thường" thì công tắc tắt, "Nghe" phát 1x', async () => {
      await seedSettings({ defaultAudioSpeed: 'normal' });
      const { user } = renderRunner();

      expect(await screen.findByText('Câu 1 / 2')).toBeInTheDocument();
      await expectNormalPlayback(user);
    });

    it('S4.4-AC2 Mặc định phát tốc độ thường: IndexedDB trống thì công tắc tắt, "Nghe" phát 1x', async () => {
      await clearDatabase();
      const { user } = renderRunner();

      expect(await screen.findByText('Câu 1 / 2')).toBeInTheDocument();
      await expectNormalPlayback(user);
    });
  });
});
