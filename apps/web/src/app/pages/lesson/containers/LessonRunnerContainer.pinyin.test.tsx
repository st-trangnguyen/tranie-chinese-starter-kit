import { describe, expect, it } from 'vitest';

import { ProgressService } from '@shared/services/progress.service';
import {
  NIHAO,
  renderRunner,
  seedSettings,
  serveSpeakLesson,
  setupLessonPreferences,
} from '@test/lesson-preferences.helpers';
import { screen } from '@test/render';

setupLessonPreferences();

describe('LessonRunnerContainer — pinyin theo Cài đặt của người học', () => {
  describe('S8.2-AC3 Tắt pinyin thì câu nói không hiện pinyin', () => {
    it('S8.2-AC3 Tắt pinyin thì câu nói không hiện pinyin: Cài đặt tắt pinyin thì câu "nói" 你好 hiện chữ và nghĩa, không "nǐ hǎo"', async () => {
      await seedSettings({ isPinyinVisible: false });
      serveSpeakLesson();
      renderRunner();

      expect(await screen.findByText('Câu 1 / 2')).toBeInTheDocument();
      expect(await screen.findByText(NIHAO.hanzi)).toBeInTheDocument();
      expect(screen.getByText(NIHAO.vi)).toBeInTheDocument();
      expect(screen.queryByText(NIHAO.pinyin)).not.toBeInTheDocument();
    });
  });

  describe('S8.2-AC3 Bật lại pinyin thì câu nói hiện pinyin', () => {
    it('S8.2-AC3 Bật lại pinyin thì câu nói hiện pinyin: Cài đặt tắt rồi bật lại pinyin thì câu "nói" 你好 hiện chữ, "nǐ hǎo" và nghĩa', async () => {
      await seedSettings({ isPinyinVisible: false });
      await new ProgressService().changePinyinVisibility(true);
      serveSpeakLesson();
      renderRunner();

      expect(await screen.findByText('Câu 1 / 2')).toBeInTheDocument();
      expect(await screen.findByText(NIHAO.hanzi)).toBeInTheDocument();
      expect(screen.getByText(NIHAO.pinyin)).toBeInTheDocument();
      expect(screen.getByText(NIHAO.vi)).toBeInTheDocument();
    });
  });

  describe('S8.2-AC3 Tắt pinyin vẫn hiện pinyin trong giải thích khi sai', () => {
    it('S8.2-AC3 Tắt pinyin vẫn hiện pinyin trong giải thích khi sai: Cài đặt tắt pinyin, câu "nói" 你好 bấm "Chưa đúng" thì giải thích hiện chữ, "nǐ hǎo" và nghĩa', async () => {
      await seedSettings({ isPinyinVisible: false });
      serveSpeakLesson();
      const { user } = renderRunner();

      expect(await screen.findByText('Câu 1 / 2')).toBeInTheDocument();
      expect(screen.queryByText(NIHAO.pinyin)).not.toBeInTheDocument();
      await user.click(
        await screen.findByRole('button', { name: 'Chưa đúng' }),
      );

      const explanation = await screen.findByRole('status');
      expect(explanation).toHaveTextContent(NIHAO.hanzi);
      expect(explanation).toHaveTextContent(NIHAO.pinyin);
      expect(explanation).toHaveTextContent(NIHAO.vi);
    });
  });
});
