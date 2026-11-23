/** Helper e2e của Cài đặt S8.2 áp vào màn học (tốc độ khi mở bài, pinyin ở câu "nói"). */
import { expect, type Locator, type Page } from '@playwright/test';

import {
  listenButton,
  pathLessonItems,
  readAudioPlays,
  readBuiltLesson,
} from '../E7/intro-lessons.helpers';

import { lessonProgress, seedProgress } from './home.helpers';
import {
  expectLearningPathScreen,
  expectStoredSetting,
  openLearningPath,
  openSettingsFromPath,
  pinyinSwitch,
  SLOW_SPEED_LABEL,
  speedRadio,
} from './settings.helpers';

export const INTRO_01 = 'intro-01';
export const INTRO_02 = 'intro-02';
/** Câu "nói" `intro-02-nihao` là câu thứ 8 (cursor 7) của `intro-02`. */
export const NIHAO_CURSOR = 7;
/** Câu gõ pinyin (妈妈) là câu thứ 3 (cursor 2) của `intro-02`. */
export const PINYIN_TYPE_CURSOR = 2;
/** Câu phân biệt cặp âm 四 / 十 là câu thứ 10 (cursor 9) của `intro-01`. */
export const SOUND_PAIR_CURSOR = 9;

export const NIHAO_HANZI = '你好！';
export const NIHAO_PINYIN = 'nǐ hǎo!';
export const NIHAO_VI = 'Xin chào!';
export const SLOW_RATE = 0.75;
export const NORMAL_RATE = 1;

const SLOW_TOGGLE_LABEL = 'Nghe chậm';
const RATING_LABELS = ['Chưa đúng', 'Gần đúng', 'Đúng'] as const;

export const slowToggle = (page: Page): Locator =>
  page.getByRole('switch', { name: SLOW_TOGGLE_LABEL });

export const speakGroup = (page: Page): Locator =>
  page.getByRole('group', { name: 'Tự đánh giá phát âm' });

export const ratingButton = (
  page: Page,
  label: (typeof RATING_LABELS)[number],
): Locator =>
  speakGroup(page).getByRole('button', { name: label, exact: true });

/** Ở màn Lộ trình, mở bài thứ `index` (0 = `intro-01`) bằng liên kết của bài. */
export const openLessonFromPath = async (
  page: Page,
  index: number,
): Promise<void> => {
  await pathLessonItems(page).nth(index).getByRole('link').click();
  await expect(lessonProgress(page)).toBeVisible();
};

/** Màn bài `lessonId` đang ở câu `position` (đếm từ 1). */
export const expectLessonAt = async (
  page: Page,
  lessonId: string,
  position: number,
): Promise<void> => {
  const total = readBuiltLesson(lessonId).exercises.length;
  await expect(page).toHaveURL(new RegExp(`/lessons/${lessonId}$`));
  await expect(lessonProgress(page)).toHaveAccessibleName(
    `Câu ${position} / ${total}`,
  );
};

/** Rời màn bài bằng nút Quay lại của trình duyệt, về Lộ trình. */
export const leaveLessonToPath = async (page: Page): Promise<void> => {
  await page.goBack();
  await expectLearningPathScreen(page);
};

/** Bấm "Nghe" của câu đang hiện, chờ lần phát mới bắt đầu, trả về tốc độ đọc được lúc đó. */
export const listenAndReadRate = async (page: Page): Promise<number | null> => {
  const before = (await readAudioPlays(page)).length;
  await listenButton(page).click();
  await expect
    .poll(async () => {
      const plays = await readAudioPlays(page);
      const latest = plays[plays.length - 1];
      return plays.length > before &&
        latest !== undefined &&
        (latest.playbackRate !== null || latest.error !== null)
        ? 'settled'
        : 'waiting';
    })
    .toBe('settled');
  const plays = await readAudioPlays(page);
  const latest = plays[plays.length - 1];
  expect(latest?.error ?? null).toBeNull();
  return latest?.playbackRate ?? null;
};

/** Ở màn Cài đặt (mở từ Lộ trình) chọn "Chậm (0.75x)", chờ đã lưu, quay về Lộ trình. */
export const chooseSlowDefault = async (page: Page): Promise<void> => {
  await openSettingsFromPath(page);
  await speedRadio(page, SLOW_SPEED_LABEL).check();
  await expectStoredSetting(page, 'defaultAudioSpeed', 'slow');
  await openLearningPath(page);
};

/** Ở màn Cài đặt (mở từ Lộ trình) tắt "Hiện pinyin", chờ đã lưu. */
export const hidePinyinInSettings = async (page: Page): Promise<void> => {
  await openSettingsFromPath(page);
  await pinyinSwitch(page).uncheck();
  await expectStoredSetting(page, 'isPinyinVisible', false);
};

/**
 * Làm tới một câu bằng tiến độ tạo sẵn (giữ nguyên cài đặt đã lưu): `intro-01` đã xong khi tới câu
 * của `intro-02`, rồi mở bài từ Lộ trình.
 */
export const openLessonAtCursor = async (
  page: Page,
  lessonId: typeof INTRO_01 | typeof INTRO_02,
  cursor: number,
): Promise<void> => {
  const progress =
    lessonId === INTRO_01
      ? [{ lessonId: INTRO_01, status: 'in-progress', cursor }]
      : [
          { lessonId: INTRO_01, status: 'completed' },
          { lessonId: INTRO_02, status: 'in-progress', cursor },
        ];
  await seedProgress(page, { lessonProgress: progress });
  await openLearningPath(page);
  await openLessonFromPath(page, lessonId === INTRO_01 ? 0 : 1);
  await expectLessonAt(page, lessonId, cursor + 1);
};

/** Làm tới câu "nói" 你好！ (câu 8 của `intro-02`). */
export const openNihaoSpeak = (page: Page): Promise<void> =>
  openLessonAtCursor(page, INTRO_02, NIHAO_CURSOR);

/** Câu "nói" hiện chữ, nghĩa, ba mức tự đánh giá; pinyin hiện hay không theo `isPinyinShown`. */
export const expectNihaoPrompt = async (
  page: Page,
  isPinyinShown: boolean,
): Promise<void> => {
  await expect(page.getByText(NIHAO_HANZI, { exact: true })).toBeVisible();
  await expect(page.getByText(NIHAO_VI, { exact: true })).toBeVisible();
  if (isPinyinShown) {
    await expect(page.getByText(NIHAO_PINYIN, { exact: true })).toBeVisible();
  } else {
    await expect(page.getByText('nǐ hǎo')).toHaveCount(0);
  }
};

export const expectThreeRatings = async (page: Page): Promise<void> => {
  await expect(speakGroup(page).getByRole('button')).toHaveCount(
    RATING_LABELS.length,
  );
  for (const label of RATING_LABELS) {
    await expect(ratingButton(page, label)).toBeVisible();
  }
};

/** Trước khi trang chạy: `getUserMedia` luôn reject `NotAllowedError` (micro bị chặn). */
export const blockMicrophone = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    Reflect.set(
      MediaDevices.prototype,
      'getUserMedia',
      (): Promise<MediaStream> =>
        Promise.reject(
          new DOMException('E2E: micro bị chặn', 'NotAllowedError'),
        ),
    );
  });
};
