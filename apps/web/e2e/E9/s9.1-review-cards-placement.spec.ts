/**
 * e2e S9.1 Tạo thẻ ôn tập: bài kiểm tra cuối chủ đề, kiểm tra vượt cấp (test-cases.md: TC-S9.1-AC1-9,
 * AC1-10, AC1-11, AC1-12, AC1-13, TC-S9.1-AC2-16, AC2-17).
 */
import { expect, test, type Page } from '@playwright/test';

import { writingPracticeLink } from '../E6/writing-practice.helpers';
import { strokeOrderPath } from '../E6/stroke-order.helpers';
import {
  answerCurrentQuestion,
  completeOnboarding,
} from '../E7/intro-lessons.helpers';
import { writeCharacter } from '../E7/intro-writing.helpers';
import { lessonProgress } from '../E8/home.helpers';

import {
  expectCards,
  finishOpenedLesson,
  finishReviewLesson,
  newMeaningAndListening,
  openReviewLesson,
  openReviewPath,
  pathLessonItem,
  pathLessonStatus,
} from './review-cards-lesson.helpers';
import {
  expectLessonsSaved,
  passOpenedTest,
  passVcPlacementTest,
} from './review-cards-placement.helpers';
import {
  REVIEW_LESSON_IDS,
  type ReviewLessonKey,
} from './review-cards.content';
import {
  readReviewCards,
  readWrittenCharacters,
  seedReviewProgress,
  serveReviewCardsPath,
} from './review-cards.helpers';

const COMPLETED_LABEL = 'Đã xong';
const VC_LESSONS: readonly ReviewLessonKey[] = ['vc1', 'vc2', 'vcTest'];
/** Mọi bài của chủ đề mẫu chính: xong hết thì chủ đề KT mở (nạp sẵn tiến độ bài, không thẻ). */
const MAIN_UNIT_LESSONS: readonly ReviewLessonKey[] = [
  'a',
  'b',
  'c',
  'aSkip',
  'd',
  'e',
  'f',
  'g',
  'h',
  'k',
];

test.use({ serviceWorkers: 'block' });

test.beforeEach(async ({ page }) => {
  await serveReviewCardsPath(page);
});

/** Người học mới đạt kiểm tra vượt cấp chủ đề VC; mọi bài VC "Đã xong", chưa có thẻ nào. */
const passVcAsNewLearner = async (page: Page): Promise<void> => {
  await completeOnboarding(page);
  await passVcPlacementTest(page);
  await openReviewPath(page);
  await Promise.all(
    VC_LESSONS.map((key) =>
      expect(pathLessonStatus(page, key)).toHaveText(COMPLETED_LABEL),
    ),
  );
};

test.describe('S9.1-AC1 Bài kiểm tra không tạo thẻ', () => {
  test('TC-S9.1-AC1-9: S9.1-AC1 Bài kiểm tra không tạo thẻ — đạt bài kiểm tra cuối chủ đề KT, danh sách thẻ giữ nguyên', async ({
    page,
  }) => {
    await seedReviewProgress(page, {
      lessonProgress: MAIN_UNIT_LESSONS.map((key) => ({
        lessonId: REVIEW_LESSON_IDS[key],
        status: 'completed',
      })),
    });
    await finishReviewLesson(page, 'kt1');
    await expectCards(page, newMeaningAndListening('你'));
    const cardsBeforeTest = await readReviewCards(page);

    await openReviewLesson(page, 'ktTest');
    await passOpenedTest(page, 'ktTest');
    await expectLessonsSaved(page, ['ktTest']);

    // Chờ bài kiểm tra được ghi "Đã xong" rồi mới so danh sách thẻ.
    await openReviewPath(page);
    await expect(pathLessonStatus(page, 'ktTest')).toHaveText(COMPLETED_LABEL);
    const cardsAfterTest = await readReviewCards(page);
    expect(cardsAfterTest).toEqual(cardsBeforeTest);
    expect(cardsAfterTest.map((card) => card.wordId)).not.toContain('八');
  });

  test('TC-S9.1-AC1-10: S9.1-AC1 Bài kiểm tra không tạo thẻ — đạt kiểm tra vượt cấp chủ đề VC, danh sách thẻ rỗng', async ({
    page,
  }) => {
    await completeOnboarding(page);
    await passVcPlacementTest(page);

    await openReviewPath(page);
    await expect(pathLessonStatus(page, 'vcTest')).toHaveText(COMPLETED_LABEL);
    expect(await readReviewCards(page)).toEqual([]);
  });
});

test.describe('S9.1-AC1 Bài được mở nhờ kiểm tra vượt cấp', () => {
  test('TC-S9.1-AC1-11: S9.1-AC1 Bài được mở nhờ kiểm tra vượt cấp không tạo thẻ — mọi bài VC "Đã xong", không có thẻ "你好", "人"', async ({
    page,
  }) => {
    await passVcAsNewLearner(page);

    expect(await readReviewCards(page)).toEqual([]);
  });

  test('TC-S9.1-AC1-12: S9.1-AC1 Làm hết bài được đánh dấu xong nhờ kiểm tra vượt cấp thì tạo thẻ — làm hết bài VC1 có thẻ "你好"', async ({
    page,
  }) => {
    await passVcAsNewLearner(page);
    expect(await readReviewCards(page)).toEqual([]);

    await pathLessonItem(page, 'vc1').getByRole('link').click();
    await expect(page).toHaveURL(
      new RegExp(`/lessons/${REVIEW_LESSON_IDS.vc1}$`),
    );
    // Chờ màn bài hiện câu 1 (màn Lộ trình cũng có link "Trang chủ" mà vòng làm bài dựa vào).
    await expect(lessonProgress(page)).toHaveAccessibleName('Câu 1 / 2');
    await finishOpenedLesson(page);

    await expectCards(page, newMeaningAndListening('你好'));
    const wordIds = (await readReviewCards(page)).map((card) => card.wordId);
    expect(wordIds).not.toContain('人');
  });

  test('TC-S9.1-AC1-13: S9.1-AC1 Làm hết bài được đánh dấu xong nhờ kiểm tra vượt cấp thì tạo thẻ — làm 1 câu bài VC1 rồi thoát, không có thẻ', async ({
    page,
  }) => {
    await passVcAsNewLearner(page);

    await openReviewLesson(page, 'vc1');
    await answerCurrentQuestion(page);
    await expect(lessonProgress(page)).toHaveAccessibleName('Câu 2 / 2');
    await openReviewPath(page);

    await expect(pathLessonStatus(page, 'vc1')).toHaveText(COMPLETED_LABEL);
    expect(await readReviewCards(page)).toEqual([]);
  });
});

test.describe('S9.1-AC2 Bài được mở nhờ kiểm tra vượt cấp không đủ để tạo thẻ chiều viết', () => {
  /** Mở luyện viết "人" từ màn thứ tự nét, viết đúng hết các nét tới khi màn báo đã viết xong. */
  const writeRen = async (page: Page): Promise<void> => {
    await page.goto(strokeOrderPath('人'));
    await writingPracticeLink(page).click();
    await writeCharacter(page, '人');
    await expect(page.getByText('Đã viết xong chữ 人.')).toBeVisible();
    await expect.poll(() => readWrittenCharacters(page)).toContain('人');
  };

  test('TC-S9.1-AC2-16: S9.1-AC2 Bài được mở nhờ kiểm tra vượt cấp không đủ để tạo thẻ chiều viết — viết xong "人", không có thẻ "人"', async ({
    page,
  }) => {
    await passVcAsNewLearner(page);

    await writeRen(page);

    const wordIds = (await readReviewCards(page)).map((card) => card.wordId);
    expect(wordIds).not.toContain('人');
  });

  test('TC-S9.1-AC2-17: S9.1-AC2 Bài được mở nhờ kiểm tra vượt cấp không đủ để tạo thẻ chiều viết — làm hết bài VC2 thì có ba thẻ "人"', async ({
    page,
  }) => {
    await passVcAsNewLearner(page);
    await writeRen(page);
    expect(await readReviewCards(page)).toEqual([]);

    await finishReviewLesson(page, 'vc2');

    await expectCards(page, [
      { wordId: '人', facet: 'listening', state: 'new' },
      { wordId: '人', facet: 'meaning', state: 'new' },
      { wordId: '人', facet: 'writing', state: 'new' },
    ]);
  });
});
