import { expect, type Page, test } from '@playwright/test';

import {
  installAudioRecorder,
  readAudioPlays,
  readBuiltSentences,
} from '../E7/intro-lessons.helpers';

import { completeOnboarding } from './home.helpers';
import {
  blockMicrophone,
  expectLessonAt,
  expectNihaoPrompt,
  expectThreeRatings,
  hidePinyinInSettings,
  INTRO_01,
  INTRO_02,
  NIHAO_HANZI,
  NIHAO_PINYIN,
  NIHAO_VI,
  openLessonAtCursor,
  openLessonFromPath,
  openNihaoSpeak,
  PINYIN_TYPE_CURSOR,
  ratingButton,
  SOUND_PAIR_CURSOR,
} from './settings-lesson.helpers';
import {
  expectStoredSetting,
  openLearningPath,
  pinyinSwitch,
} from './settings.helpers';

const READ_ALOUD_MESSAGE = 'Hãy đọc to chữ trên màn rồi tự chọn mức bên dưới.';

const nihaoAudio = (): string => {
  const sentence = readBuiltSentences().find(
    (item) => item.id === 'intro-02-nihao',
  );
  if (!sentence) {
    throw new Error('Không có câu intro-02-nihao trong sentences.json.');
  }
  return sentence.audio;
};

test.describe('S8.2 Cài đặt: hiện pinyin ở màn học', () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page, 15);
    await openLearningPath(page);
  });

  test('TC-S8.2-AC3-3, TC-S8.2-AC3-12: S8.2-AC3 Tắt pinyin thì câu nói không hiện pinyin', async ({
    page,
  }) => {
    await hidePinyinInSettings(page);

    await openNihaoSpeak(page);

    await expectNihaoPrompt(page, false);
    await expectThreeRatings(page);
  });

  test('TC-S8.2-AC3-5: S8.2-AC3 Bật lại pinyin thì câu nói hiện pinyin', async ({
    page,
  }) => {
    await hidePinyinInSettings(page);
    await pinyinSwitch(page).check();
    await expectStoredSetting(page, 'isPinyinVisible', true);

    await openNihaoSpeak(page);

    await expectNihaoPrompt(page, true);
  });

  test('TC-S5.2-AC1-1: S5.2-AC1 Câu nói hiện nội dung để đọc và 3 mức', async ({
    page,
  }) => {
    await openNihaoSpeak(page);

    await expectNihaoPrompt(page, true);
    await expectThreeRatings(page);
  });

  test('TC-S8.2-AC3-7: S8.2-AC3 Tắt pinyin vẫn giữ pinyin của lựa chọn và đáp án', async ({
    page,
  }) => {
    await hidePinyinInSettings(page);
    await openLearningPath(page);
    await openLessonFromPath(page, 0);
    await expectLessonAt(page, INTRO_01, 1);

    // Câu 1 chỉ nghe (không hiện chữ 八); chọn thanh nào cũng hiện đáp án kèm pinyin.
    await page
      .getByRole('group', { name: 'Chọn thanh của âm tiết vừa nghe' })
      .getByRole('button', { name: 'Thanh 1', exact: true })
      .click();
    await expect(page.getByText('bā', { exact: true })).toBeVisible();

    await openLessonAtCursor(page, INTRO_01, SOUND_PAIR_CURSOR);

    const pair = page.getByRole('group', { name: 'Chọn âm vừa nghe' });
    await expect(
      pair.getByRole('button', { name: 'sì', exact: true }),
    ).toBeVisible();
    await expect(
      pair.getByRole('button', { name: 'shí', exact: true }),
    ).toBeVisible();
  });

  test('TC-S8.2-AC3-8: S8.2-AC3 Tắt pinyin vẫn gõ pinyin được', async ({
    page,
  }) => {
    await hidePinyinInSettings(page);
    await openLessonAtCursor(page, INTRO_02, PINYIN_TYPE_CURSOR);
    const input = page.getByRole('textbox', {
      name: 'Gõ pinyin của âm vừa nghe',
    });

    await input.pressSequentially('ni3');
    await expect(input).toHaveValue('nǐ');
    await page.getByRole('button', { name: 'Kiểm tra' }).click();

    await expect(page.getByText('Pinyin đúng', { exact: true })).toBeVisible();
    await expect(page.getByText('māma', { exact: true })).toBeVisible();
    await expect(page.getByText('Phần gõ sai', { exact: true })).toBeVisible();
  });

  test('TC-S8.2-AC3-9: S8.2-AC3 Tắt pinyin vẫn hiện pinyin trong giải thích khi sai', async ({
    page,
  }) => {
    await hidePinyinInSettings(page);
    await openNihaoSpeak(page);
    await expectNihaoPrompt(page, false);

    await ratingButton(page, 'Chưa đúng').click();

    const explanation = page.getByText(NIHAO_PINYIN);
    await expect(explanation).toBeVisible();
    await expect(explanation).toContainText(NIHAO_HANZI);
    await expect(explanation).toContainText(NIHAO_VI);
  });

  test.describe('micro bị chặn', () => {
    test.beforeEach(async ({ page }) => {
      await blockMicrophone(page);
      await installAudioRecorder(page);
    });

    test('TC-S8.2-AC3-14: S8.2-AC3 Đọc to rồi tự chấm khi tắt pinyin', async ({
      page,
    }) => {
      await hidePinyinInSettings(page);
      await openNihaoSpeak(page);

      await page.getByRole('button', { name: 'Ghi âm', exact: true }).click();

      await expect(page.getByText(READ_ALOUD_MESSAGE)).toBeVisible();
      await expectNihaoPrompt(page, false);
      await expectSampleListenable(page);
    });

    test('TC-S5.4-AC2-2: S5.4-AC2 Vẫn nghe mẫu và thấy chữ để đọc', async ({
      page,
    }) => {
      await openNihaoSpeak(page);

      await page.getByRole('button', { name: 'Ghi âm', exact: true }).click();

      await expect(page.getByText(READ_ALOUD_MESSAGE)).toBeVisible();
      await expectNihaoPrompt(page, true);
      await expectSampleListenable(page);
    });
  });
});

/** Nút "Nghe mẫu" bấm được và phát audio của câu 你好！. */
async function expectSampleListenable(page: Page): Promise<void> {
  const sample = page.getByRole('button', { name: 'Nghe mẫu', exact: true });
  await expect(sample).toBeEnabled();
  await sample.click();
  await expect
    .poll(async () =>
      (await readAudioPlays(page)).some((play) =>
        play.src.endsWith(nihaoAudio()),
      ),
    )
    .toBe(true);
}
