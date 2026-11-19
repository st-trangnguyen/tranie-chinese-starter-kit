import { describe, expect, it, vi } from 'vitest';

import { PLAYBACK_RATES } from '@core/constants/audio.constants';
import { progressStore } from '@core/services/progress-store.service';
import {
  BA,
  NIHAO,
  clearDatabase,
  expectNormalPlayback,
  expectSlowPlayback,
  renderRunner,
  renderTwoLessons,
  seedCursor,
  seedSettings,
  serveSpeakLesson,
  setupLessonPreferences,
  turnOffSlow,
  turnOnSlow,
} from '@test/lesson-preferences.helpers';
import { fakeAudio } from '@test/record-compare.helpers';
import { screen, waitFor } from '@test/render';

setupLessonPreferences();

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
  describe('S8.2-AC2 Không đọc được cài đặt thì bài vẫn mở với tốc độ thường và hiện pinyin', () => {
    /** Cài đặt "Chậm" + tắt pinyin đã lưu, nhưng mọi lần đọc cài đặt đều lỗi. */
    const seedUnreadableSettings = async (): Promise<void> => {
      await seedSettings({ defaultAudioSpeed: 'slow', isPinyinVisible: false });
      vi.spyOn(progressStore, 'getSettings').mockRejectedValue(
        new Error('IndexedDB không đọc được'),
      );
    };

    it('S8.2-AC2 Không đọc được cài đặt thì bài vẫn mở với tốc độ thường và hiện pinyin: Cài đặt "Chậm" nhưng đọc lỗi thì bài mở, công tắc tắt, "Nghe" phát 1x, không báo lỗi', async () => {
      await seedUnreadableSettings();
      const { user } = renderRunner();

      expect(await screen.findByText('Câu 1 / 2')).toBeInTheDocument();
      await expectNormalPlayback(user);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('S8.2-AC2 Không đọc được cài đặt thì bài vẫn mở với tốc độ thường và hiện pinyin: Cài đặt tắt pinyin nhưng đọc lỗi thì câu "nói" 你好 hiện chữ, "nǐ hǎo" và nghĩa, không báo lỗi', async () => {
      await seedUnreadableSettings();
      serveSpeakLesson();
      renderRunner();

      expect(await screen.findByText('Câu 1 / 2')).toBeInTheDocument();
      expect(await screen.findByText(NIHAO.hanzi)).toBeInTheDocument();
      expect(screen.getByText(NIHAO.pinyin)).toBeInTheDocument();
      expect(screen.getByText(NIHAO.vi)).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
