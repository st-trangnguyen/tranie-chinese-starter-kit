import { expect, test, type Page } from '@playwright/test';

import {
  completeOnboarding,
  expectHomeScreen,
  expectTodayMinutes,
  finishLesson,
  GOAL_15,
  learningPathLink,
  leaveLessonToHome,
  lessonProgress,
  MINUTE,
  NOW,
  runClockUntil,
  SECOND,
  seedProgress,
  setPageVisibility,
  startLesson,
  TIMEZONE,
} from './home.helpers';
import {
  atDayTime,
  changeDailyGoalInStorage,
  dayKey,
  expectStreak,
  reachedDay,
  studiedDay,
} from './streak.helpers';

test.use({ timezoneId: TIMEZONE });

const MINUTES = 60;

/** Rời Trang chủ sang màn Lộ trình rồi quay lại bằng liên kết "Trang chủ" (không tải lại trang). */
const leaveThenReturnHome = async (page: Page): Promise<void> => {
  await learningPathLink(page).click();
  await page.getByRole('link', { name: 'Trang chủ' }).click();
  await expectHomeScreen(page);
};

/** Đang ở màn bài: ở liên tục `durationMs` (đồng hồ giả), làm xong bài, bấm "Trang chủ" trên màn tổng kết. */
const studyThenFinishLesson = async (
  page: Page,
  durationMs: number,
): Promise<void> => {
  await page.clock.runFor(durationMs);
  await finishLesson(page);
  await page.getByRole('link', { name: 'Trang chủ' }).click();
  await expectHomeScreen(page);
};

test.describe('S8.3 Streak — đồng hồ giả, học thật', () => {
  test.describe('S8.3-AC1 đếm streak', () => {
    test('TC-S8.3-AC1-6: S8.3-AC1 Người học mới chưa có ngày nào', async ({
      page,
    }) => {
      await page.clock.install({ time: NOW });
      // Context Playwright mới: dữ liệu trang trống như người dùng mới.
      await completeOnboarding(page, 15);
      await page.goto('/');

      await expectHomeScreen(page);
      await expectTodayMinutes(page, 0);
      await expectStreak(page, 0);
    });

    test('TC-S8.3-AC1-9: S8.3-AC1 Ngày mới bắt đầu sau nửa đêm theo giờ máy', async ({
      page,
    }) => {
      await page.clock.install({ time: atDayTime(0, '23:58') });
      await seedProgress(page, {
        ...GOAL_15,
        dailyStats: [reachedDay(-1), reachedDay(0)],
      });
      await page.goto('/');
      await expectTodayMinutes(page, 20);
      await expectStreak(page, 2);

      await runClockUntil(page, atDayTime(1, '00:01'));
      await leaveThenReturnHome(page);

      await expectTodayMinutes(page, 0);
      await expectStreak(page, 2);

      await runClockUntil(page, atDayTime(2, '10:00'));
      await page.goto('/');

      await expectHomeScreen(page);
      await expectTodayMinutes(page, 0);
      await expectStreak(page, 0);
    });

    test('TC-S8.3-AC1-14: S8.3-AC1 Đổi mục tiêu sau khi đã học, qua 0:00 streak không đổi', async ({
      page,
    }) => {
      await page.clock.install({ time: atDayTime(0, '23:58') });
      await seedProgress(page, {
        ...GOAL_15,
        dailyStats: [studiedDay(0, 20 * MINUTES, 15)],
      });
      await page.goto('/');
      await expectTodayMinutes(page, 20);
      await expectStreak(page, 1);

      // Đổi mục tiêu đang chọn 15 → 30 sau khi đã học: chưa có S8.2 nên ghi thẳng dữ liệu, kèm cập nhật mục tiêu
      // của dòng hôm nay như `changeDailyGoal` (chỉ ghi settings thì sau 0:00 hôm qua vẫn so 15 phút → 1 ngày).
      await changeDailyGoalInStorage(page, 30, dayKey(0));
      await page.goto('/');
      await expectTodayMinutes(page, 20, 30);
      await expectStreak(page, 0);

      await runClockUntil(page, atDayTime(1, '00:01'));
      await leaveThenReturnHome(page);

      await expectTodayMinutes(page, 0, 30);
      await expectStreak(page, 0);
    });

    test('TC-S8.3-AC1-17: S8.3-AC1 Học qua nửa đêm thì mỗi ngày so với phần thời gian của ngày đó', async ({
      page,
    }) => {
      await page.clock.install({ time: atDayTime(0, '23:50') });
      await seedProgress(page, {
        ...GOAL_15,
        dailyStats: [studiedDay(0, 10 * MINUTES, 15)],
      });
      await page.goto('/');
      await expectTodayMinutes(page, 10);
      await expectStreak(page, 0);

      // Ở màn bài liên tục 23:50 → 0:10 (thêm 10 giây để phần hôm nay chắc chắn đủ 10 phút khi làm tròn xuống).
      await startLesson(page);
      await page.clock.runFor(20 * MINUTE + 10 * SECOND);
      await leaveLessonToHome(page);

      await expectTodayMinutes(page, 10);
      await expectStreak(page, 1);
    });

    test('TC-S8.3-AC1-19: S8.3-AC1 Tăng mục tiêu không đổi các ngày đã qua', async ({
      page,
    }) => {
      await page.clock.install({ time: atDayTime(-3, '09:00') });
      // Context mới (dữ liệu trống); onboarding xong thì app mở thẳng bài đầu tiên. Chờ màn bài hiện rồi mới cho
      // đồng hồ chạy, nếu không 20 phút trôi qua lúc bài còn đang nạp (chưa ở màn bài).
      await completeOnboarding(page, 15);
      await expect(lessonProgress(page)).toBeVisible();
      await studyThenFinishLesson(page, 20 * MINUTE);

      for (const offset of [-2, -1]) {
        await runClockUntil(page, atDayTime(offset, '09:00'));
        await page.goto('/');
        await expectHomeScreen(page);
        await startLesson(page);
        await studyThenFinishLesson(page, 20 * MINUTE);
      }

      await runClockUntil(page, atDayTime(0, '09:00'));
      await page.goto('/');
      await expectHomeScreen(page);
      await expectTodayMinutes(page, 0);
      await expectStreak(page, 3);

      // Đổi mục tiêu đang chọn 15 → 30 (chưa có S8.2): hôm nay chưa học nên chưa có dòng hôm nay, helper chỉ ghi
      // settings, giống `changeDailyGoal`.
      await changeDailyGoalInStorage(page, 30, dayKey(0));
      await page.goto('/');

      await expectHomeScreen(page);
      await expectTodayMinutes(page, 0, 30);
      await expectStreak(page, 3);
    });
  });

  test.describe('S8.3-AC2 streak trên Trang chủ được tính lại', () => {
    test('TC-S8.3-AC2-7: S8.3-AC2 Học đủ mục tiêu rồi quay lại trang chủ thì số tăng ngay', async ({
      page,
    }) => {
      await page.clock.install({ time: NOW });
      await seedProgress(page, {
        ...GOAL_15,
        dailyStats: [
          reachedDay(-2),
          reachedDay(-1),
          studiedDay(0, 13 * MINUTES, 15),
        ],
      });
      await page.goto('/');
      await expectTodayMinutes(page, 13);
      await expectStreak(page, 2);

      await startLesson(page);
      await page.clock.runFor(1 * MINUTE);
      await finishLesson(page);
      await page.clock.runFor(1 * MINUTE + 10 * SECOND);
      await page.getByRole('link', { name: 'Trang chủ' }).click();

      await expectHomeScreen(page);
      await expectTodayMinutes(page, 15);
      await expectStreak(page, 3);
    });

    test('TC-S8.3-AC2-9: S8.3-AC2 Quay lại app từ nền qua ngày mới thì cập nhật', async ({
      page,
    }) => {
      await page.clock.install({ time: atDayTime(0, '23:58') });
      await seedProgress(page, {
        ...GOAL_15,
        dailyStats: [reachedDay(-2), reachedDay(-1), studiedDay(0, 0, 15)],
      });
      await page.goto('/');
      await expectStreak(page, 2);

      await setPageVisibility(page, true);
      await runClockUntil(page, atDayTime(1, '00:01'));
      await setPageVisibility(page, false);

      await expectStreak(page, 0);
    });
  });
});
