/**
 * e2e S9.1 Tạo thẻ ôn tập khi không có mạng (test-cases.md: TC-S9.1-AC1-2, TC-S9.1-AC2-19,
 * TC-S9.1-AC1-21). Nội dung mẫu nằm trong bản build e2e, bật bằng cookie fixture trước lần mở
 * trang đầu; service worker precache cùng code (design D12). App mở khi có mạng, service worker
 * điều khiển trang, rồi mới `context.setOffline(true)`.
 */
import {
  expect,
  test,
  type Browser,
  type BrowserContext,
  type Page,
} from '@playwright/test';

import {
  completeOnboarding,
  FINISHED_MESSAGE,
  LEARNING_PATH_URL,
} from '../E7/intro-lessons.helpers';
import {
  backupAlert,
  backupStatus,
  exportProgress,
  IMPORTED_MESSAGE,
  importFile,
  overwriteButton,
} from '../E8/backup.helpers';
import { finishLesson, learningPathLink } from '../E8/home.helpers';
import { openOnceWithServiceWorker } from '../E8/offline-audio.helpers';
import {
  alertsOutsideBackup,
  openSettingsFromPath,
} from '../E8/settings.helpers';

import {
  REVIEW_LESSON_IDS,
  REVIEW_LESSON_TITLES,
  type ReviewLessonKey,
} from './review-cards.content';
import {
  readReviewCards,
  readWrittenCharacters,
  seedReviewProgress,
  useReviewCardsFixture,
  type ReviewCardRow,
} from './review-cards.helpers';

/** Thẻ rút gọn để so: từ · chiều · trạng thái. */
const summarize = (
  cards: readonly ReviewCardRow[],
): { wordId: string; facet: string; state: string }[] =>
  cards.map(({ wordId, facet, state }) => ({ wordId, facet, state }));

const NEW_CARDS_LESSON_A = [
  { wordId: '你好', facet: 'listening', state: 'new' },
  { wordId: '你好', facet: 'meaning', state: 'new' },
  { wordId: '谢谢', facet: 'listening', state: 'new' },
  { wordId: '谢谢', facet: 'meaning', state: 'new' },
];

const NEW_CARDS_LESSON_C = [
  { wordId: '人', facet: 'listening', state: 'new' },
  { wordId: '人', facet: 'meaning', state: 'new' },
  { wordId: '人', facet: 'writing', state: 'new' },
];

const lessonLink = (page: Page, key: ReviewLessonKey) =>
  page.getByRole('link', {
    name: new RegExp(`^${REVIEW_LESSON_TITLES[key]}\\s`),
  });

/** Ở màn Lộ trình (đã mở khi có mạng), bấm bài `key` rồi làm hết tới màn tổng kết. */
const finishLessonFromPath = async (
  page: Page,
  key: ReviewLessonKey,
): Promise<void> => {
  await lessonLink(page, key).click();
  await expect(page).toHaveURL(
    new RegExp(`/lessons/${REVIEW_LESSON_IDS[key]}$`),
  );
  await finishLesson(page);
  await expect(page.getByText(FINISHED_MESSAGE)).toBeVisible();
  await expect(alertsOutsideBackup(page)).toHaveCount(0);
};

const expectCards = async (
  page: Page,
  expected: readonly { wordId: string; facet: string; state: string }[],
): Promise<void> => {
  await expect
    .poll(async () => summarize(await readReviewCards(page)))
    .toEqual(expected);
};

/** Bật nội dung mẫu (trước lần mở trang đầu) rồi chờ service worker điều khiển trang. */
const openWithReviewFixture = async (page: Page): Promise<void> => {
  await useReviewCardsFixture(page.context());
  await openOnceWithServiceWorker(page);
};

/** Người học mới: onboarding và mở màn Lộ trình khi còn mạng. */
const openPathAsNewLearner = async (page: Page): Promise<void> => {
  await openWithReviewFixture(page);
  await completeOnboarding(page);
  await page.goto(LEARNING_PATH_URL);
  await expect(lessonLink(page, 'a')).toBeVisible();
};

/** Từ màn tổng kết về Trang chủ, sang Lộ trình rồi mở Cài đặt (điều hướng trong app). */
const openSettingsFromSummary = async (page: Page): Promise<void> => {
  await page.getByRole('link', { name: 'Trang chủ' }).click();
  await learningPathLink(page).click();
  await expect(page).toHaveURL(new RegExp(`${LEARNING_PATH_URL}$`));
  await openSettingsFromPath(page);
};

const contexts: BrowserContext[] = [];

/** Một "máy": phiên trình duyệt riêng (IndexedDB, service worker, cookie tách biệt). */
const openMachine = async (browser: Browser): Promise<Page> => {
  const context = await browser.newContext();
  contexts.push(context);
  return context.newPage();
};

test.afterEach(async () => {
  await Promise.all(contexts.splice(0).map((context) => context.close()));
});

test.describe('S9.1 Tạo thẻ ôn tập khi không có mạng', () => {
  test('TC-S9.1-AC1-2: S9.1-AC1 Xong bài học thì tạo thẻ nghĩa và nghe — offline, bài mẫu A có đúng 4 thẻ "mới"', async ({
    page,
    context,
  }) => {
    await openPathAsNewLearner(page);
    expect(await readReviewCards(page)).toEqual([]);

    await context.setOffline(true);
    await finishLessonFromPath(page, 'a');

    await expectCards(page, NEW_CARDS_LESSON_A);
  });

  test('TC-S9.1-AC2-19: S9.1-AC2 Làm hết bài có câu viết chữ thì có đủ ba chiều — offline, bài mẫu C có 3 thẻ "人"', async ({
    page,
    context,
  }) => {
    await openWithReviewFixture(page);
    // Bài A, B đã xong (không có thẻ, như tiến độ nạp sẵn) để bài C "Đang mở" trên Lộ trình:
    // khi offline không tải được trang bằng địa chỉ, chỉ vào bài bằng liên kết trong app.
    await seedReviewProgress(page, {
      lessonProgress: [
        { lessonId: REVIEW_LESSON_IDS.a, status: 'completed' },
        { lessonId: REVIEW_LESSON_IDS.b, status: 'completed' },
      ],
    });
    await page.goto(LEARNING_PATH_URL);
    await expect(lessonLink(page, 'c')).toBeVisible();
    expect(await readReviewCards(page)).toEqual([]);

    await context.setOffline(true);
    await finishLessonFromPath(page, 'c');

    await expect.poll(() => readWrittenCharacters(page)).toEqual(['人']);
    await expectCards(page, NEW_CARDS_LESSON_C);
  });

  test('TC-S9.1-AC1-21: S9.1-AC1 (bổ sung) Xuất rồi nhập ở máy khác vẫn còn thẻ — cả hai máy offline', async ({
    browser,
  }) => {
    const machineA = await openMachine(browser);
    await openPathAsNewLearner(machineA);
    await machineA.context().setOffline(true);
    await finishLessonFromPath(machineA, 'a');
    await expectCards(machineA, NEW_CARDS_LESSON_A);
    await openSettingsFromSummary(machineA);
    const download = await exportProgress(machineA);
    const backupPath = await download.path();

    const machineB = await openMachine(browser);
    await openPathAsNewLearner(machineB);
    await machineB.context().setOffline(true);
    await openSettingsFromPath(machineB);
    await importFile(machineB, backupPath);
    await overwriteButton(machineB).click();

    await expect(backupStatus(machineB)).toHaveText(IMPORTED_MESSAGE);
    await expect(backupAlert(machineB)).toHaveText('');
    await expect(alertsOutsideBackup(machineB)).toHaveCount(0);
    await expectCards(machineB, NEW_CARDS_LESSON_A);
  });
});
