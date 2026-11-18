import { expect, test, type Page, type Route } from '@playwright/test';

import {
  answerCurrentQuestion,
  INTRO_LESSON_IDS,
  INTRO_LESSON_TITLES,
  LEARNING_PATH_URL,
} from '../E7/intro-lessons.helpers';
import {
  ALL_COMPLETED_TEXT,
  completedLessons,
  completeOnboarding,
  GOAL_REACHED_TEXT,
  HOME_URL,
  homeHeading,
  learningPathLink,
  lessonProgress,
  nextLessonCard,
  seedProgress,
  startLessonLink,
  todayStudyText,
} from './home.helpers';

/** Mốc "bây giờ" cố định theo giờ máy (múi giờ cố định) để khóa ngày `dailyStats` không phụ thuộc máy chạy. */
const TIMEZONE = 'Asia/Ho_Chi_Minh';
const NOW = new Date('2026-11-18T10:00:00+07:00');
const TODAY = '2026-11-18';
const YESTERDAY = '2026-11-17';

const lessonTitle = (index: number): string => INTRO_LESSON_TITLES[index] ?? '';
const lessonId = (index: number): string => INTRO_LESSON_IDS[index] ?? '';

const expectHomeScreen = async (page: Page): Promise<void> => {
  await expect(page).toHaveURL(HOME_URL);
  await expect(homeHeading(page)).toBeVisible();
};

/** Trả lời `count` câu đầu, chờ thanh tiến độ sang câu kế tiếp sau mỗi câu. */
const answerQuestions = async (page: Page, count: number): Promise<void> => {
  for (let index = 1; index <= count; index += 1) {
    await answerCurrentQuestion(page);
    await expect(lessonProgress(page)).toHaveAccessibleName(
      new RegExp(`^Câu ${index + 1} /`),
    );
  }
};

/** Trả lời mọi câu tới màn tổng kết (có liên kết "Trang chủ"). */
const finishLesson = async (page: Page): Promise<void> => {
  const summaryHomeLink = page.getByRole('link', { name: 'Trang chủ' });
  while (!(await summaryHomeLink.isVisible())) {
    await answerCurrentQuestion(page);
    await expect(lessonProgress(page).or(summaryHomeLink)).toBeVisible();
  }
};

test.use({ timezoneId: TIMEZONE });

test.describe('S8.1 Trang chủ', () => {
  test.describe('S8.1-AC1 vào app', () => {
    test('TC-S8.1-AC1-1: S8.1-AC1 Mở lại app sau onboarding thì vào Trang chủ', async ({
      page,
      context,
    }) => {
      await completeOnboarding(page, 15);
      await expect(page).toHaveURL(/\/lessons\/intro-01$/);
      await page.close();

      const reopened = await context.newPage();
      await reopened.goto('/');

      await expectHomeScreen(reopened);
      await expect(nextLessonCard(reopened)).toContainText(lessonTitle(0));
      await expect(startLessonLink(reopened)).toBeVisible();
      await expect(todayStudyText(reopened)).toBeVisible();
      await expect(reopened).not.toHaveURL(/\/lessons\//);
    });

    test('TC-S8.1-AC1-4: S8.1-AC1 Mở màn onboarding khi đã xong', async ({
      page,
    }) => {
      await completeOnboarding(page, 15);
      await expect(page).toHaveURL(/\/lessons\/intro-01$/);

      await page.goto('/onboarding');

      await expectHomeScreen(page);
      await expect(page.getByRole('button', { name: 'Bắt đầu' })).toHaveCount(
        0,
      );
    });

    test('TC-S8.1-AC1-21: S8.1-AC1 Tải lại ở màn khác thì vẫn ở màn đó', async ({
      page,
    }) => {
      await seedProgress(page);
      await page.goto('/');
      await expectHomeScreen(page);

      await learningPathLink(page).click();
      await expect(page).toHaveURL(/\/learning-paths$/);
      await page.reload();

      await expect(page).toHaveURL(/\/learning-paths$/);
      await expect(
        page.getByRole('heading', { level: 2, name: 'Nhập môn' }),
      ).toBeVisible();
      await expect(homeHeading(page)).toHaveCount(0);
    });

    test('TC-S8.1-AC1-2: S8.1-AC1 Vừa xong onboarding vẫn vào bài 1', async ({
      page,
    }) => {
      await completeOnboarding(page, 15);

      await expect(page).toHaveURL(/\/lessons\/intro-01$/);
      await expect(lessonProgress(page)).toBeVisible();
      await expect(homeHeading(page)).toHaveCount(0);
    });

    test('TC-S8.1-AC1-3: S8.1-AC1 Chưa xong onboarding thì vẫn vào onboarding', async ({
      page,
    }) => {
      await page.goto('/');

      await expect(page).toHaveURL(/\/onboarding$/);
      await expect(page.getByRole('button', { name: 'Bắt đầu' })).toBeVisible();
      await expect(homeHeading(page)).toHaveCount(0);
    });
  });

  test.describe('S8.1-AC1 vào học', () => {
    test('TC-S8.1-AC1-5: S8.1-AC1 Bấm "Vào học" thì vào bài', async ({
      page,
    }) => {
      await seedProgress(page, {
        lessonProgress: completedLessons([lessonId(0), lessonId(1)]),
      });
      await page.goto('/');
      await expect(nextLessonCard(page)).toContainText(lessonTitle(2));

      await startLessonLink(page).click();

      await expect(page).toHaveURL(new RegExp(`/lessons/${lessonId(2)}$`));
      await expect(page.getByText(lessonTitle(2))).toBeVisible();
      await expect(lessonProgress(page)).toBeVisible();
    });

    test('TC-S8.1-AC1-6: S8.1-AC1 Bài tiếp theo đang làm dở', async ({
      page,
    }) => {
      await seedProgress(page);
      await page.goto('/');
      await startLessonLink(page).click();
      await expect(page).toHaveURL(/\/lessons\/intro-01$/);
      await answerQuestions(page, 2);

      await page.goBack();
      await expectHomeScreen(page);
      await startLessonLink(page).click();

      await expect(page).toHaveURL(/\/lessons\/intro-01$/);
      await expect(lessonProgress(page)).toHaveAccessibleName(/^Câu 3 \//);
    });

    test('TC-S8.1-AC1-7: S8.1-AC1 Dùng được bằng bàn phím', async ({
      page,
    }) => {
      await seedProgress(page);
      await page.goto('/');
      const startLink = startLessonLink(page);
      await expect(startLink).toBeVisible();

      let isFocused = false;
      for (let presses = 0; presses < 10 && !isFocused; presses += 1) {
        await page.keyboard.press('Tab');
        isFocused = await startLink.evaluate(
          (element) => element === document.activeElement,
        );
      }
      expect(isFocused).toBe(true);
      const outlineStyle = await startLink.evaluate(
        (element) => getComputedStyle(element).outlineStyle,
      );
      expect(outlineStyle).not.toBe('none');

      await page.keyboard.press('Enter');

      await expect(page).toHaveURL(/\/lessons\/intro-01$/);
      await expect(lessonProgress(page)).toBeVisible();
    });

    test('TC-S8.1-AC1-26: S8.1-AC1 Từ màn tổng kết về Trang chủ', async ({
      page,
    }) => {
      await seedProgress(page);
      await page.goto('/');
      await startLessonLink(page).click();
      await expect(page).toHaveURL(/\/lessons\/intro-01$/);

      await finishLesson(page);
      await page.getByRole('link', { name: 'Trang chủ' }).click();

      await expectHomeScreen(page);
    });
  });

  test.describe('S8.1-AC1 bài tiếp theo', () => {
    test('TC-S8.1-AC1-9: S8.1-AC1 Chưa học bài nào', async ({ page }) => {
      await seedProgress(page);
      await page.goto('/');

      await expect(nextLessonCard(page)).toContainText(lessonTitle(0));
      await expect(startLessonLink(page)).toBeVisible();

      await learningPathLink(page).click();
      await expect(
        page.getByRole('link', { name: new RegExp(lessonTitle(0)) }),
      ).toContainText('Đang mở');
    });

    test('TC-S8.1-AC1-10: S8.1-AC1 Đã xong vài bài thì hiện bài kế tiếp', async ({
      page,
    }) => {
      await seedProgress(page, {
        lessonProgress: completedLessons([lessonId(0), lessonId(1)]),
      });
      await page.goto('/');

      await expect(nextLessonCard(page)).toContainText(lessonTitle(2));
      await expect(startLessonLink(page)).toBeVisible();

      await learningPathLink(page).click();
      await expect(
        page.getByRole('link', { name: new RegExp(lessonTitle(2)) }),
      ).toContainText('Đang mở');
    });

    test('TC-S8.1-AC1-13: S8.1-AC1 Đã học xong mọi bài', async ({ page }) => {
      await seedProgress(page, {
        lessonProgress: completedLessons(INTRO_LESSON_IDS),
      });
      await page.goto('/');

      await expect(page.getByText(ALL_COMPLETED_TEXT)).toBeVisible();
      await expect(startLessonLink(page)).toHaveCount(0);
      await expect(todayStudyText(page)).toHaveText('Hôm nay: 0 / 15 phút');
      await expect(learningPathLink(page)).toBeVisible();
    });

    test('TC-S8.1-AC1-14: S8.1-AC1 Tiến độ lưu bị hỏng', async ({ page }) => {
      await seedProgress(page, {
        lessonProgress: [
          { lessonId: lessonId(0), status: 'xyz' },
          ...completedLessons([lessonId(1)]),
        ],
      });
      await page.goto('/');

      await expectHomeScreen(page);
      await expect(nextLessonCard(page)).toContainText(lessonTitle(0));
      await expect(startLessonLink(page)).toBeVisible();
      await expect(page.getByRole('alert')).toHaveCount(0);
    });
  });

  test.describe('S8.1-AC1 lộ trình nhiều nhóm, giai đoạn (nội dung thay qua page.route)', () => {
    // page.route không chặn được request do service worker phục vụ (design "Test").
    test.use({ serviceWorkers: 'block' });

    /**
     * Lộ trình 2 giai đoạn dựng từ bài Nhập môn thật: giai đoạn 1 có nhóm A (bài 1, 2, bài kiểm
     * tra cuối chủ đề = bài 3 đổi `type` thành `test`) và nhóm B (bài 4, 5); giai đoạn 2 có nhóm C
     * (bài 6, 7).
     */
    const CONTENT_ROOT = {
      contentVersion: '0123456789ab',
      stages: [
        {
          id: 'intro',
          title: 'Nhập môn',
          units: [
            {
              id: 'unit-a',
              title: 'Nhóm A',
              lessonIds: [lessonId(0), lessonId(1), lessonId(2)],
            },
            {
              id: 'unit-b',
              title: 'Nhóm B',
              lessonIds: [lessonId(3), lessonId(4)],
            },
          ],
        },
        {
          id: 'stage-2',
          title: 'Giai đoạn 2',
          units: [
            {
              id: 'unit-c',
              title: 'Nhóm C',
              lessonIds: [lessonId(5), lessonId(6)],
            },
          ],
        },
      ],
    };
    const UNIT_TEST_ID = lessonId(2);

    const serveMultiUnitPath = async (page: Page): Promise<void> => {
      await page.route('**/content/content.json', (route: Route) =>
        route.fulfill({ json: CONTENT_ROOT }),
      );
      await page.route(
        `**/content/lessons/${UNIT_TEST_ID}.json`,
        async (route) => {
          const response = await route.fetch();
          const lesson: unknown = await response.json();
          const json =
            typeof lesson === 'object' && lesson !== null
              ? { ...lesson, type: 'test' }
              : lesson;
          await route.fulfill({ response, json });
        },
      );
    };

    test('TC-S8.1-AC1-11: S8.1-AC1 Bài kế tiếp ở nhóm hoặc giai đoạn sau — nhóm sau', async ({
      page,
    }) => {
      await serveMultiUnitPath(page);
      await seedProgress(page, {
        lessonProgress: completedLessons([
          lessonId(0),
          lessonId(1),
          lessonId(2),
        ]),
      });
      await page.goto('/');

      await expect(nextLessonCard(page)).toContainText(lessonTitle(3));

      await learningPathLink(page).click();
      await expect(
        page.getByRole('link', { name: new RegExp(lessonTitle(3)) }),
      ).toContainText('Đang mở');
    });

    test('TC-S8.1-AC1-11: S8.1-AC1 Bài kế tiếp ở nhóm hoặc giai đoạn sau — giai đoạn sau', async ({
      page,
    }) => {
      await serveMultiUnitPath(page);
      await seedProgress(page, {
        lessonProgress: completedLessons(INTRO_LESSON_IDS.slice(0, 5)),
      });
      await page.goto('/');

      await expect(nextLessonCard(page)).toContainText(lessonTitle(5));

      await learningPathLink(page).click();
      await expect(
        page.getByRole('link', { name: new RegExp(lessonTitle(5)) }),
      ).toContainText('Đang mở');
    });

    test('TC-S8.1-AC1-12: S8.1-AC1 Còn bài đang mở ở trước một bài đã xong', async ({
      page,
    }) => {
      await serveMultiUnitPath(page);
      await seedProgress(page, {
        lessonProgress: completedLessons([lessonId(3)]),
      });
      await page.goto('/');

      await expect(nextLessonCard(page)).toContainText(lessonTitle(0));
      await expect(nextLessonCard(page)).not.toContainText(lessonTitle(4));
    });

    test('TC-S8.1-AC1-23: S8.1-AC1 Bài tiếp theo là bài kiểm tra cuối chủ đề đang làm dở', async ({
      page,
    }) => {
      await serveMultiUnitPath(page);
      await seedProgress(page, {
        lessonProgress: completedLessons([lessonId(0), lessonId(1)]),
      });
      await page.goto('/');
      await expect(nextLessonCard(page)).toContainText(lessonTitle(2));
      await startLessonLink(page).click();
      await expect(page).toHaveURL(new RegExp(`/lessons/${UNIT_TEST_ID}$`));
      await answerQuestions(page, 2);

      await page.goBack();
      await expectHomeScreen(page);
      await startLessonLink(page).click();

      await expect(page).toHaveURL(new RegExp(`/lessons/${UNIT_TEST_ID}$`));
      await expect(lessonProgress(page)).toHaveAccessibleName(/^Câu 1 \//);
    });
  });

  test.describe('S8.1-AC1 điều hướng Trang chủ ↔ lộ trình', () => {
    test('TC-S8.1-AC1-15: S8.1-AC1 Mở bản đồ lộ trình từ Trang chủ', async ({
      page,
    }) => {
      await seedProgress(page);
      await page.goto('/');

      await learningPathLink(page).click();

      await expect(page).toHaveURL(new RegExp(`${LEARNING_PATH_URL}$`));
      await expect(
        page.getByRole('heading', { level: 2, name: 'Nhập môn' }),
      ).toBeVisible();
    });

    test('TC-S8.1-AC1-24: S8.1-AC1 Từ bản đồ lộ trình về Trang chủ', async ({
      page,
    }) => {
      await seedProgress(page);
      await page.goto('/');
      await learningPathLink(page).click();
      await expect(page).toHaveURL(new RegExp(`${LEARNING_PATH_URL}$`));

      await page.getByRole('link', { name: 'Trang chủ' }).click();

      await expectHomeScreen(page);
    });
  });

  test.describe('S8.1-AC2 số phút hôm nay', () => {
    test.beforeEach(async ({ page }) => {
      await page.clock.install({ time: NOW });
    });

    test('TC-S8.1-AC2-1: S8.1-AC2 Chưa học hôm nay', async ({ page }) => {
      await completeOnboarding(page, 30);
      await expect(page).toHaveURL(/\/lessons\/intro-01$/);

      await page.goto('/');

      await expectHomeScreen(page);
      await expect(todayStudyText(page)).toHaveText('Hôm nay: 0 / 30 phút');
      await expect(page.getByText(GOAL_REACHED_TEXT)).toHaveCount(0);
    });

    test('TC-S8.1-AC2-3: S8.1-AC2 Mục tiêu lưu bị hỏng', async ({ page }) => {
      await seedProgress(page, { settings: { dailyGoalMinutes: 'abc' } });
      await page.goto('/');

      await expectHomeScreen(page);
      await expect(todayStudyText(page)).toHaveText('Hôm nay: 0 / 15 phút');
      await expect(page.getByRole('alert')).toHaveCount(0);
    });

    test('TC-S8.1-AC2-5: S8.1-AC2 Vượt mục tiêu', async ({ page }) => {
      await seedProgress(page, {
        settings: { dailyGoalMinutes: 30 },
        dailyStats: [{ date: TODAY, studySeconds: 45 * 60 }],
      });
      await page.goto('/');

      await expect(todayStudyText(page)).toHaveText('Hôm nay: 45 / 30 phút');
      await expect(page.getByText(GOAL_REACHED_TEXT)).toBeVisible();
    });

    test('TC-S8.1-AC2-6: S8.1-AC2 Vừa đúng mục tiêu — đúng 15 phút', async ({
      page,
    }) => {
      await seedProgress(page, {
        settings: { dailyGoalMinutes: 15 },
        dailyStats: [{ date: TODAY, studySeconds: 15 * 60 }],
      });
      await page.goto('/');

      await expect(todayStudyText(page)).toHaveText('Hôm nay: 15 / 15 phút');
      await expect(page.getByText(GOAL_REACHED_TEXT)).toBeVisible();
    });

    test('TC-S8.1-AC2-7: S8.1-AC2 Vừa đúng mục tiêu — 14 phút 50 giây', async ({
      page,
    }) => {
      await seedProgress(page, {
        settings: { dailyGoalMinutes: 15 },
        dailyStats: [{ date: TODAY, studySeconds: 14 * 60 + 50 }],
      });
      await page.goto('/');

      await expect(todayStudyText(page)).toHaveText('Hôm nay: 14 / 15 phút');
      await expect(page.getByText(GOAL_REACHED_TEXT)).toHaveCount(0);
    });

    test('TC-S8.1-AC2-18: S8.1-AC2 Sang ngày mới đếm lại', async ({ page }) => {
      await seedProgress(page, {
        settings: { dailyGoalMinutes: 15 },
        dailyStats: [{ date: YESTERDAY, studySeconds: 20 * 60 }],
      });
      await page.goto('/');

      await expect(todayStudyText(page)).toHaveText('Hôm nay: 0 / 15 phút');
      await expect(page.getByText(GOAL_REACHED_TEXT)).toHaveCount(0);
    });

    test('TC-S8.1-AC2-25: S8.1-AC2 Thời gian học đã lưu bị hỏng', async ({
      page,
    }) => {
      await seedProgress(page, {
        settings: { dailyGoalMinutes: 15 },
        dailyStats: [{ date: TODAY, studySeconds: 'abc' }],
      });
      await page.goto('/');

      await expectHomeScreen(page);
      await expect(todayStudyText(page)).toHaveText('Hôm nay: 0 / 15 phút');
      await expect(page.getByRole('alert')).toHaveCount(0);
    });
  });
});
