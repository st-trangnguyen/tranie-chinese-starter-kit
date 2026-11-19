/** Helper e2e của 12 bài Nhập môn S7.1 (design mục Test). */
import { readFileSync } from 'node:fs';

import {
  lessonSchema,
  sentenceSchema,
  wordSchema,
  type Lesson,
  type Sentence,
  type Word,
} from '@csk/shared';
import { expect, type Locator, type Page } from '@playwright/test';

import {
  drawMedian,
  readBuiltMedians,
  waitForWriterReady,
} from '../E6/writing-practice.helpers';

/** Tiêu đề 12 bài Nhập môn, nguyên văn và đúng thứ tự (test-cases "Điều kiện đầu chung"). */
export const INTRO_LESSON_TITLES = [
  'Thanh 1–4',
  'Thanh nhẹ và biến điệu (3-3, 不, 一)',
  'Vận mẫu đơn',
  'Thanh mẫu b p m f d t n l',
  'Thanh mẫu g k h j q x',
  'Thanh mẫu zh ch sh r z c s',
  'Vận mẫu kép',
  'Vận mẫu mũi',
  'Quy tắc viết pinyin',
  'Nét cơ bản và thứ tự nét',
  '30 bộ thủ phổ biến',
  'Ôn tổng hợp + câu chào đầu tiên',
] as const;

/** ID 12 bài Nhập môn theo thứ tự lộ trình (design D1). */
export const INTRO_LESSON_IDS = INTRO_LESSON_TITLES.map(
  (_, index) => `intro-${String(index + 1).padStart(2, '0')}`,
);

export const INTRO_STAGE_TITLE = 'Nhập môn';
export const INTRO_UNIT_TITLE = 'Pinyin và chữ Hán cơ bản';
export const FINISHED_MESSAGE = 'Bạn đã làm xong các câu của bài này.';
export const LEARNING_PATH_URL = '/learning-paths';

const DB_NAME = 'tranie-chinese';
const LISTEN_LABEL = 'Nghe';
const CONTINUE_LABEL = 'Tiếp tục';
const ANY_PINYIN = 'ma1';
const PAD_LABEL_PREFIX = 'Khung viết chữ ';
const UNSUPPORTED_MESSAGE = 'Dạng bài này chưa có.';
const SKIP_LABEL = 'Bỏ qua câu này';

const builtContentUrl = (path: string): URL =>
  new URL(`../../src/assets/content/${path}`, import.meta.url);

const readBuiltJson = (path: string): unknown =>
  JSON.parse(readFileSync(builtContentUrl(path), 'utf-8'));

/** Bài đã build trong `apps/web/src/assets/content/lessons/`, validate bằng Zod (§0.4). */
export const readBuiltLesson = (lessonId: string): Lesson =>
  lessonSchema.parse(readBuiltJson(`lessons/${lessonId}.json`));

export const readBuiltWords = (): Word[] =>
  wordSchema.array().parse(readBuiltJson('words.json'));

export const readBuiltSentences = (): Sentence[] =>
  sentenceSchema.array().parse(readBuiltJson('sentences.json'));

/** Làm onboarding qua giao diện như người học mới (mẫu `e2e/E3/s3.1-learning-path.spec.ts`). */
export const completeOnboarding = async (page: Page): Promise<void> => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Bắt đầu' }).click();
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await page.getByRole('button', { name: /Bỏ qua|Vào học/ }).click();
};

/** Giai đoạn đầu tiên trên màn Lộ trình (`<section>` con trực tiếp của `<main>`). */
export const firstStage = (page: Page): Locator =>
  page.locator('main > section').first();

export const pathLessonItems = (page: Page): Locator =>
  firstStage(page).getByRole('listitem');

export const pathLessonTitles = (page: Page): Locator =>
  firstStage(page).locator('.learning-path-lesson-title');

export const pathLessonStatuses = (page: Page): Locator =>
  firstStage(page).locator('.learning-path-lesson-status');

export const listenButton = (page: Page): Locator =>
  page.getByRole('button', { name: LISTEN_LABEL, exact: true });

/**
 * Nạp sẵn tiến độ: mở app một lần (app tạo DB `tranie-chinese` với bảng `lessonProgress`), ghi
 * `hasCompletedOnboarding` và các bài đã xong thẳng vào IndexedDB, rồi tải lại.
 */
export const seedCompletedLessons = async (
  page: Page,
  lessonIds: readonly string[],
): Promise<void> => {
  await page.goto('/');
  await expect
    .poll(() =>
      page.evaluate(
        (dbName) =>
          new Promise<boolean>((resolve) => {
            const request = indexedDB.open(dbName);
            request.onsuccess = () => {
              const db = request.result;
              const isReady = db.objectStoreNames.contains('lessonProgress');
              db.close();
              resolve(isReady);
            };
            request.onerror = () => resolve(false);
          }),
        DB_NAME,
      ),
    )
    .toBe(true);

  await page.evaluate(
    ({ dbName, ids }) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open(dbName);
        request.onerror = () => reject(new Error('Không mở được IndexedDB.'));
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(
            ['settings', 'lessonProgress'],
            'readwrite',
          );
          transaction
            .objectStore('settings')
            .put({ key: 'hasCompletedOnboarding', value: true });
          const progress = transaction.objectStore('lessonProgress');
          ids.forEach((lessonId) => {
            progress.put({ lessonId, status: 'completed' });
          });
          transaction.oncomplete = () => {
            db.close();
            resolve();
          };
          transaction.onerror = () => {
            db.close();
            reject(new Error('Không ghi được tiến độ.'));
          };
        };
      }),
    { dbName: DB_NAME, ids: [...lessonIds] },
  );
  await page.reload();
};

const answerStrokeWrite = async (page: Page, pad: Locator): Promise<string> => {
  const label = await pad.getAttribute('aria-label');
  const character = label?.replace(PAD_LABEL_PREFIX, '') ?? '';
  const medians = await readBuiltMedians(page, character);
  await waitForWriterReady(pad);
  for (const median of medians) {
    await drawMedian(page, pad, median);
  }
  return character;
};

const questionLocators = (page: Page) => ({
  toneGroup: page.getByRole('group', {
    name: 'Chọn thanh của âm tiết vừa nghe',
  }),
  soundPairGroup: page.getByRole('group', { name: 'Chọn âm vừa nghe' }),
  pinyinInput: page.getByRole('textbox', {
    name: 'Gõ pinyin của âm vừa nghe',
  }),
  speakGroup: page.getByRole('group', { name: 'Tự đánh giá phát âm' }),
  pad: page.getByRole('figure', {
    name: new RegExp(`^${PAD_LABEL_PREFIX}`),
  }),
});

/** Phần trả lời của câu đang hiện, thuộc một trong 5 dạng màn bài hỗ trợ. */
export const currentQuestion = (page: Page): Locator => {
  const { toneGroup, soundPairGroup, pinyinInput, speakGroup, pad } =
    questionLocators(page);
  return toneGroup.or(soundPairGroup).or(pinyinInput).or(speakGroup).or(pad);
};

export const unsupportedMessage = (page: Page): Locator =>
  page.getByText(UNSUPPORTED_MESSAGE);

export const skipButton = (page: Page): Locator =>
  page.getByRole('button', { name: SKIP_LABEL });

/**
 * Trả lời câu đang hiện theo dạng nhìn thấy trên màn rồi bấm "Tiếp tục": chọn đáp án đầu, gõ
 * pinyin bất kỳ rồi "Kiểm tra", câu nói chọn mức tự đánh giá đầu, câu viết vẽ đủ nét theo median.
 * Trả lời sai vẫn hợp lệ. Trả về chữ của khung viết nếu là câu viết, ngược lại `null`.
 */
export const answerCurrentQuestion = async (
  page: Page,
): Promise<string | null> => {
  const { toneGroup, soundPairGroup, pinyinInput, speakGroup, pad } =
    questionLocators(page);

  await expect(currentQuestion(page)).toBeVisible();

  let character: string | null = null;
  if (await toneGroup.isVisible()) {
    await toneGroup.getByRole('button').first().click();
  } else if (await soundPairGroup.isVisible()) {
    await soundPairGroup.getByRole('button').first().click();
  } else if (await pinyinInput.isVisible()) {
    await pinyinInput.fill(ANY_PINYIN);
    await page.getByRole('button', { name: 'Kiểm tra' }).click();
  } else if (await speakGroup.isVisible()) {
    await speakGroup.getByRole('button').first().click();
  } else {
    character = await answerStrokeWrite(page, pad);
  }

  await page.getByRole('button', { name: CONTINUE_LABEL }).click();
  return character;
};

/** Một lần gọi `HTMLMediaElement.play` mà trang thực hiện, ghi bởi `installAudioRecorder`. */
export interface AudioPlayRecord {
  src: string;
  /** Thời lượng (giây) đọc được khi phát đã bắt đầu; `null` khi chưa bắt đầu hoặc lỗi. */
  duration: number | null;
  /**
   * Tốc độ phát đọc được khi phát đã bắt đầu (không phải lúc gọi `play`: thuật toán load khi gán
   * `src` có thể đặt lại tốc độ); `null` khi chưa bắt đầu hoặc lỗi.
   */
  playbackRate: number | null;
  error: string | null;
}

declare global {
  interface Window {
    cskAudioPlays?: AudioPlayRecord[];
    cskLastAudio?: HTMLMediaElement;
  }
}

/**
 * Bọc `HTMLMediaElement.prototype.play` trước khi trang chạy: mỗi lần phát ghi `src`, rồi khi
 * phát bắt đầu ghi `duration` và `playbackRate` (hoặc `error` khi không phát được). Gọi trước
 * `page.goto`.
 */
export const installAudioRecorder = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    const plays: AudioPlayRecord[] = [];
    window.cskAudioPlays = plays;
    const originalPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function play(
      this: HTMLMediaElement,
    ): Promise<void> {
      const record: AudioPlayRecord = {
        src: this.src,
        duration: null,
        playbackRate: null,
        error: null,
      };
      plays.push(record);
      window.cskLastAudio = this;
      const result = originalPlay.call(this);
      result.then(
        () => {
          record.duration = this.duration;
          record.playbackRate = this.playbackRate;
        },
        (error: unknown) => {
          record.error = error instanceof Error ? error.message : String(error);
        },
      );
      return result;
    };
  });
};

export const readAudioPlays = (page: Page): Promise<AudioPlayRecord[]> =>
  page.evaluate(() => [...(window.cskAudioPlays ?? [])]);

/** Phần tử audio vừa được gọi `play` còn đang phát (chưa dừng, chưa hết). */
export const isLastAudioPlaying = (page: Page): Promise<boolean> =>
  page.evaluate(() => {
    const audio = window.cskLastAudio;
    return audio !== undefined && !audio.paused && !audio.ended;
  });
