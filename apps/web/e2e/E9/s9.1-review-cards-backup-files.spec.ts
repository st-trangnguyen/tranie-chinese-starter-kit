/**
 * e2e S9.1 Tạo thẻ ôn tập: nhập file mẫu sao lưu (test-cases.md: TC-S9.1-AC1-28, AC1-31, AC1-34,
 * AC1-35, TC-S9.1-AC2-24, AC2-26, AC2-27). Case "Tiếp …" chạy lại phần đầu trong cùng test để độc lập.
 */
import { expect, test, type Browser, type Page } from '@playwright/test';

import {
  backupAlert,
  cancelButton,
  CONFIRM_WARNING,
  importConfirmDialog,
  importFile,
  overwriteButton,
  backupStatus,
  IMPORTED_MESSAGE,
} from '../E8/backup.helpers';
import { openSettingsFromPath } from '../E8/settings.helpers';

import {
  closeMachines,
  expectCardRows,
  expectNoErrorMessage,
  exportFromSettings,
  importAndOverwrite,
  openNewLearnerSettings,
  readBackupReviewPart,
  reviewFixturePath,
  type ReviewBackupFixture,
} from './review-cards-backup.helpers';
import {
  expectCards,
  finishReviewLesson,
  newMeaningAndListening,
  openReviewPath,
  pathLessonStatus,
} from './review-cards-lesson.helpers';
import { NO_STROKE_CHARACTER } from './review-cards.content';
import { readReviewCards } from './review-cards.helpers';
import { NO_WRITE_SETTLE_MS } from './review-cards-writing.helpers';

const COMPLETED_LABEL = 'Đã xong';

/** Người học mới nhập file mẫu `name`, bấm "Ghi đè"; thẻ trên máy đúng bằng thẻ trong file. */
const importFixtureAsNewLearner = async (
  browser: Browser,
  name: ReviewBackupFixture,
): Promise<Page> => {
  const page = await openNewLearnerSettings(browser);
  const fixture = reviewFixturePath(name);
  await importAndOverwrite(page, fixture);
  const { cards } = await readBackupReviewPart(fixture);
  await expectCardRows(page, cards);
  return page;
};

/** Mở Trang chủ và màn Lộ trình, không có thông báo lỗi nào. */
const expectHomeAndPathWithoutError = async (page: Page): Promise<void> => {
  await page.goto('/');
  await expect(page.getByRole('main')).toBeVisible();
  await page.waitForTimeout(NO_WRITE_SETTLE_MS);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await openReviewPath(page);
  await page.waitForTimeout(NO_WRITE_SETTLE_MS);
  await expect(page.getByRole('alert')).toHaveCount(0);
};

test.afterEach(async () => {
  await closeMachines();
});

test.describe('S9.1-AC1 Nhập file sao lưu bản cũ', () => {
  test('TC-S9.1-AC1-28: S9.1-AC1 (bổ sung) Nhập file sao lưu bản cũ — hộp xác nhận như S8.5, ghi đè thì bài mẫu A "Đã xong", không còn thẻ', async ({
    browser,
  }) => {
    const page = await openNewLearnerSettings(browser);
    await finishReviewLesson(page, 'b');
    await expectCards(page, newMeaningAndListening('人'));
    await openSettingsFromPath(page);

    await importFile(page, reviewFixturePath('ban-truoc-s9-1.json'));

    const dialog = importConfirmDialog(page);
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('20/11/2026');
    await expect(dialog).toContainText('1 bài đã xong');
    await expect(dialog).toContainText(CONFIRM_WARNING);
    await expect(cancelButton(page)).toBeVisible();
    await expect(backupAlert(page)).toHaveText('');

    await overwriteButton(page).click();
    await expect(backupStatus(page)).toHaveText(IMPORTED_MESSAGE);
    await expectNoErrorMessage(page);
    await openReviewPath(page);
    await expect(pathLessonStatus(page, 'a')).toHaveText(COMPLETED_LABEL);
    expect(await readReviewCards(page)).toEqual([]);
  });

  test('TC-S9.1-AC1-31: S9.1-AC1 Bài đã xong từ trước không được tạo bù thẻ — nhập bản cũ, tải lại không có thẻ; làm lại bài mẫu A có 4 thẻ "mới"', async ({
    browser,
  }) => {
    const page = await openNewLearnerSettings(browser);
    await importAndOverwrite(page, reviewFixturePath('ban-truoc-s9-1.json'));

    await page.reload();
    await openReviewPath(page);
    await expect(pathLessonStatus(page, 'a')).toHaveText(COMPLETED_LABEL);
    await page.waitForTimeout(NO_WRITE_SETTLE_MS);
    expect(await readReviewCards(page)).toEqual([]);

    await finishReviewLesson(page, 'a');

    await expectCards(page, newMeaningAndListening('你好', '谢谢'));
  });
});

test.describe('S9.1-AC1 Thẻ của từ không có trong app vẫn nhập được', () => {
  test('TC-S9.1-AC1-34: S9.1-AC1 (bổ sung) Thẻ của từ không có trong app vẫn nhập được — đúng 2 thẻ như file, Trang chủ và Lộ trình không báo lỗi', async ({
    browser,
  }) => {
    const page = await importFixtureAsNewLearner(browser, 'the-tu-la.json');

    await expectHomeAndPathWithoutError(page);
  });

  test('TC-S9.1-AC1-35: S9.1-AC1 (bổ sung) Thẻ của từ không có trong app vẫn nhập được — tải lại, xuất: file vẫn có đúng 2 thẻ', async ({
    browser,
  }) => {
    const page = await importFixtureAsNewLearner(browser, 'the-tu-la.json');
    const expected = await readBackupReviewPart(
      reviewFixturePath('the-tu-la.json'),
    );

    await page.reload();
    const exported = await readBackupReviewPart(await exportFromSettings(page));

    expect(exported.cards).toEqual(expected.cards);
    expect(exported.writtenCharacters).toEqual([]);
  });
});

test.describe('S9.1-AC2 Chữ đã viết lạ hoặc không có dữ liệu nét', () => {
  test('TC-S9.1-AC2-24: S9.1-AC2 (bổ sung) Chữ đã viết không có trong app không tạo thẻ — bài mẫu H "Đã xong", chỉ thẻ "你好" nghĩa và nghe', async ({
    browser,
  }) => {
    const page = await importFixtureAsNewLearner(browser, 'chu-la.json');

    await openReviewPath(page);
    await expect(pathLessonStatus(page, 'h')).toHaveText(COMPLETED_LABEL);
    await page.waitForTimeout(NO_WRITE_SETTLE_MS);
    await expectCards(page, newMeaningAndListening('你好'));
  });

  test('TC-S9.1-AC2-26: S9.1-AC2 (bổ sung) Chữ đã viết không có dữ liệu nét vẫn nhập được và không tạo thẻ — bài mẫu K "Đã xong", đúng 2 thẻ như file', async ({
    browser,
  }) => {
    const page = await importFixtureAsNewLearner(browser, 'chu-khong-net.json');

    await openReviewPath(page);
    await expect(pathLessonStatus(page, 'k')).toHaveText(COMPLETED_LABEL);
    await page.waitForTimeout(NO_WRITE_SETTLE_MS);
    await expectCards(page, newMeaningAndListening(NO_STROKE_CHARACTER));
  });

  test('TC-S9.1-AC2-27: S9.1-AC2 (bổ sung) Chữ đã viết không có dữ liệu nét — làm lại bài mẫu K: vẫn 2 thẻ; file xuất vẫn có chữ đã viết', async ({
    browser,
  }) => {
    const fixture = reviewFixturePath('chu-khong-net.json');
    const page = await importFixtureAsNewLearner(browser, 'chu-khong-net.json');
    const imported = await readBackupReviewPart(fixture);

    await page.reload();
    await finishReviewLesson(page, 'k');
    await page.waitForTimeout(NO_WRITE_SETTLE_MS);

    await expectCardRows(page, imported.cards);
    const exported = await readBackupReviewPart(await exportFromSettings(page));
    await expectNoErrorMessage(page);
    expect(exported.writtenCharacters).toEqual([NO_STROKE_CHARACTER]);
    expect(exported.cards).toEqual(imported.cards);
  });
});
