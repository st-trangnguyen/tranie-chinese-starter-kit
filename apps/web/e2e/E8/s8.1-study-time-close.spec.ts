import { test } from '@playwright/test';

import {
  expectTodayMinutes,
  MINUTE,
  NOW,
  openHomeThenStartLesson,
  reopenApp,
  SECOND,
  stayInLessonThenLeave,
  TIMEZONE,
} from './home.helpers';

test.use({ timezoneId: TIMEZONE });

test.describe('S8.1-AC2 đóng app', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: NOW });
  });

  test('TC-S8.1-AC2-21: S8.1-AC2 Đóng app giữa bài chỉ mất tối đa 30 giây cuối — đóng tab', async ({
    page,
    context,
  }) => {
    await openHomeThenStartLesson(page);
    await page.clock.runFor(3 * MINUTE + 40 * SECOND);

    await page.close();
    const reopened = await reopenApp(context);

    await expectTodayMinutes(reopened, 3);
  });

  test('TC-S8.1-AC2-30: S8.1-AC2 Đóng app giữa bài chỉ mất tối đa 30 giây cuối — buộc thoát', async ({
    page,
    context,
  }) => {
    await openHomeThenStartLesson(page);
    await page.clock.runFor(3 * MINUTE + 40 * SECOND);

    // Trang sập không phát `pagehide`/`visibilitychange`: chỉ còn những gì đã ghi định kỳ.
    const session = await context.newCDPSession(page);
    const crashed = page.waitForEvent('crash');
    session.send('Page.crash').catch(() => {
      // Trang sập ngay nên CDP không kịp trả lời; sự kiện `crash` mới là tín hiệu cần chờ.
    });
    await crashed;
    const reopened = await reopenApp(context);

    await expectTodayMinutes(reopened, 3);
  });

  test('TC-S8.1-AC2-23: S8.1-AC2 Số phút còn sau khi mở lại app', async ({
    page,
    context,
  }) => {
    await openHomeThenStartLesson(page);
    await stayInLessonThenLeave(page, 9 * MINUTE + 10 * SECOND);
    await expectTodayMinutes(page, 9);

    await page.close();
    const reopened = await reopenApp(context);

    await expectTodayMinutes(reopened, 9);
  });
});
