/**
 * e2e S9.1 Tạo thẻ ôn tập: xuất / nhập tiến độ giữ thẻ (test-cases.md: TC-S9.1-AC1-18, AC1-19,
 * AC1-20, AC1-23, AC1-24, AC1-25, AC1-26). Máy A / máy B là hai `browser.newContext()`.
 * File mẫu, file bản cũ, từ lạ: `s9.1-review-cards-backup-files.spec.ts`; chiều viết:
 * `s9.1-review-cards-backup-writing.spec.ts`.
 */
import { expect, test, type Browser, type Page } from '@playwright/test';

import {
  backupAlert,
  backupStatus,
  breakLessonProgressWrites,
  cancelButton,
  IMPORT_FAILED_MESSAGE,
  importConfirmDialog,
  importFile,
  overwriteButton,
} from '../E8/backup.helpers';
import { openSettingsFromPath } from '../E8/settings.helpers';

import {
  closeMachines,
  expectCardRows,
  exportFromSettings,
  importAndOverwrite,
  openNewLearnerSettings,
  openMachine,
  readBackupReviewPart,
  reviewFixturePath,
  toCardRows,
} from './review-cards-backup.helpers';
import {
  expectCards,
  finishReviewLesson,
  newMeaningAndListening,
  openReviewPath,
  pathLessonStatus,
} from './review-cards-lesson.helpers';
import { REVIEW_LESSON_IDS } from './review-cards.content';
import {
  newCard,
  readReviewCards,
  readWrittenCharacters,
  reviewedOnceCard,
  seedReviewProgress,
} from './review-cards.helpers';
import {
  newAllFacets,
  NO_WRITE_SETTLE_MS,
  practiceCharacter,
} from './review-cards-writing.helpers';

/** Thẻ nạp sẵn ở máy A: "你好" nghĩa đã ôn một lần, "你好" nghe "mới". */
const SEEDED_NIHAO_CARDS = [
  reviewedOnceCard('你好', 'meaning'),
  newCard('你好', 'listening'),
];

/** Máy A: nạp sẵn đã học xong "你好" qua bài mẫu H (thẻ như trên), xuất; trả về đường dẫn file. */
const exportSeededNihaoFromMachineA = async (
  browser: Browser,
): Promise<string> => {
  const machineA = await openMachine(browser);
  await seedReviewProgress(machineA, {
    lessonProgress: [{ lessonId: REVIEW_LESSON_IDS.h, status: 'completed' }],
    cards: SEEDED_NIHAO_CARDS,
  });
  await expectCardRows(machineA, SEEDED_NIHAO_CARDS);
  return exportFromSettings(machineA);
};

/** Người học mới xong bài mẫu A (4 thẻ "mới"), đang ở màn Cài đặt. */
const finishLessonAThenOpenSettings = async (
  browser: Browser,
): Promise<Page> => {
  const page = await openNewLearnerSettings(browser);
  await finishReviewLesson(page, 'a');
  await expectCards(page, newMeaningAndListening('你好', '谢谢'));
  await openSettingsFromPath(page);
  return page;
};

test.afterEach(async () => {
  await closeMachines();
});

test.describe('S9.1-AC1 Xuất rồi nhập ở máy khác vẫn còn thẻ', () => {
  test('TC-S9.1-AC1-18: S9.1-AC1 (bổ sung) Xuất rồi nhập ở máy khác vẫn còn thẻ — máy B có đúng 2 thẻ "你好" như lúc nạp ở máy A', async ({
    browser,
  }) => {
    const backupPath = await exportSeededNihaoFromMachineA(browser);

    const machineB = await openNewLearnerSettings(browser);
    expect(await readReviewCards(machineB)).toEqual([]);
    await importAndOverwrite(machineB, backupPath);

    await expectCardRows(machineB, SEEDED_NIHAO_CARDS);
  });

  test('TC-S9.1-AC1-19: S9.1-AC1 (bổ sung) Xuất rồi nhập ở máy khác vẫn còn thẻ — file có đúng 2 thẻ "你好" với trạng thái và ngày ôn như lúc nạp', async ({
    browser,
  }) => {
    const backupPath = await exportSeededNihaoFromMachineA(browser);

    const { cards } = await readBackupReviewPart(backupPath);

    expect(toCardRows(cards)).toEqual(toCardRows(SEEDED_NIHAO_CARDS));
  });

  test('TC-S9.1-AC1-20: S9.1-AC1 (bổ sung) Xuất rồi nhập ở máy khác vẫn còn thẻ — thẻ tạo bằng thao tác thật ở bài mẫu A', async ({
    browser,
  }) => {
    const machineA = await finishLessonAThenOpenSettings(browser);
    const backupPath = await exportFromSettings(machineA);

    const machineB = await openNewLearnerSettings(browser);
    await importAndOverwrite(machineB, backupPath);

    await expectCards(machineB, newMeaningAndListening('你好', '谢谢'));
  });
});

test.describe('S9.1-AC1 Nhập ghi đè, hủy, lỗi ghi giữa chừng', () => {
  test('TC-S9.1-AC1-23: S9.1-AC1 (bổ sung) Nhập ghi đè thẻ trên máy — chỉ còn thẻ "你好" của file, không còn "谢谢"', async ({
    browser,
  }) => {
    const page = await finishLessonAThenOpenSettings(browser);
    const fixture = reviewFixturePath('the-nihao.json');
    const { cards } = await readBackupReviewPart(fixture);

    await importAndOverwrite(page, fixture);

    await expectCardRows(page, cards);
    await expectCards(page, newMeaningAndListening('你好'));
  });

  test('TC-S9.1-AC1-24: S9.1-AC1 (bổ sung) Nhập ghi đè thẻ trên máy — mất thẻ và chữ "人" đã viết; xong bài mẫu B lại không có thẻ chiều viết', async ({
    browser,
  }) => {
    const page = await openNewLearnerSettings(browser);
    await finishReviewLesson(page, 'b');
    await practiceCharacter(page, '人');
    await expectCards(page, newAllFacets('人'));
    await openSettingsFromPath(page);

    await importAndOverwrite(page, reviewFixturePath('the-nihao.json'));

    await expectCards(page, newMeaningAndListening('你好'));
    expect(await readWrittenCharacters(page)).toEqual([]);

    await openReviewPath(page);
    await expect(pathLessonStatus(page, 'b')).toHaveText('Đang mở');
    await finishReviewLesson(page, 'b');

    await expectCards(page, newMeaningAndListening('你好', '人'));
    await page.waitForTimeout(NO_WRITE_SETTLE_MS);
    await expectCards(page, newMeaningAndListening('你好', '人'));
  });

  test('TC-S9.1-AC1-25: S9.1-AC1 (bổ sung) Hủy nhập thì thẻ không đổi', async ({
    browser,
  }) => {
    const page = await finishLessonAThenOpenSettings(browser);
    const before = await readReviewCards(page);

    await importFile(page, reviewFixturePath('the-nihao.json'));
    await expect(importConfirmDialog(page)).toBeVisible();
    await cancelButton(page).click();

    await expect(importConfirmDialog(page)).toHaveCount(0);
    await expect(backupStatus(page)).toHaveText('');
    await expect(backupAlert(page)).toHaveText('');
    await page.waitForTimeout(NO_WRITE_SETTLE_MS);
    expect(await readReviewCards(page)).toEqual(before);
  });

  test('TC-S9.1-AC1-26: S9.1-AC1 (bổ sung) Ghi lỗi giữa chừng thì giữ nguyên thẻ — báo lỗi, thẻ như trước, bài mẫu A vẫn "Đã xong"', async ({
    browser,
  }) => {
    const page = await finishLessonAThenOpenSettings(browser);
    const before = await readReviewCards(page);

    await importFile(page, reviewFixturePath('the-nihao.json'));
    await expect(importConfirmDialog(page)).toBeVisible();
    await breakLessonProgressWrites(page);
    await overwriteButton(page).click();

    await expect(backupAlert(page)).toContainText(IMPORT_FAILED_MESSAGE);
    await expect(backupStatus(page)).toHaveText('');
    expect(await readReviewCards(page)).toEqual(before);
    await openReviewPath(page);
    await expect(pathLessonStatus(page, 'a')).toHaveText('Đã xong');
    expect(await readReviewCards(page)).toEqual(before);
  });
});
