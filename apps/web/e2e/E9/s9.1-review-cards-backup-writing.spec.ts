/**
 * e2e S9.1 Tạo thẻ ôn tập: xuất rồi nhập vẫn còn thẻ chiều viết và chữ đã viết (test-cases.md:
 * TC-S9.1-AC2-14, AC2-15). Máy A / máy B là hai `browser.newContext()`.
 */
import { expect, test, type Browser } from '@playwright/test';

import {
  closeMachines,
  exportFromSettings,
  importAndOverwrite,
  newCardSummaries,
  openMachine,
  openNewLearnerSettings,
  readBackupReviewPart,
} from './review-cards-backup.helpers';
import {
  expectCards,
  finishReviewLesson,
  openReviewPath,
  pathLessonStatus,
} from './review-cards-lesson.helpers';
import { REVIEW_LESSON_IDS } from './review-cards.content';
import {
  readWrittenCharacters,
  seedReviewProgress,
} from './review-cards.helpers';
import {
  newAllFacets,
  NO_WRITE_SETTLE_MS,
  practiceCharacter,
} from './review-cards-writing.helpers';

/**
 * Máy A: nạp sẵn tiến độ bài (bài mẫu G "Đã xong" để bài mẫu H "Đang mở", không thẻ), xong bài mẫu B,
 * viết xong "人" và "你" (không viết "好"), xuất; trả về đường dẫn file.
 */
const exportWritingFromMachineA = async (browser: Browser): Promise<string> => {
  const machineA = await openMachine(browser);
  await seedReviewProgress(machineA, {
    lessonProgress: [{ lessonId: REVIEW_LESSON_IDS.g, status: 'completed' }],
  });
  await openReviewPath(machineA);
  await expect(pathLessonStatus(machineA, 'h')).toHaveText('Đang mở');

  await finishReviewLesson(machineA, 'b');
  await practiceCharacter(machineA, '人');
  await expectCards(machineA, newAllFacets('人'));
  await practiceCharacter(machineA, '你');
  await machineA.waitForTimeout(NO_WRITE_SETTLE_MS);
  expect(await readWrittenCharacters(machineA)).toEqual(
    ['人', '你'].toSorted((left, right) => left.localeCompare(right)),
  );
  return exportFromSettings(machineA);
};

test.afterEach(async () => {
  await closeMachines();
});

test.describe('S9.1-AC2 Xuất rồi nhập vẫn còn thẻ chiều viết và chữ đã viết', () => {
  test('TC-S9.1-AC2-14: S9.1-AC2 (bổ sung) Xuất rồi nhập vẫn còn thẻ chiều viết và chữ đã viết — máy B có thẻ "人" viết; xong bài H rồi viết "好" có thẻ "你好" viết', async ({
    browser,
  }) => {
    const backupPath = await exportWritingFromMachineA(browser);

    const machineB = await openNewLearnerSettings(browser);
    await importAndOverwrite(machineB, backupPath);
    await expectCards(machineB, newAllFacets('人'));

    await openReviewPath(machineB);
    await expect(pathLessonStatus(machineB, 'h')).toHaveText('Đang mở');
    await finishReviewLesson(machineB, 'h');
    const afterLessonH = newCardSummaries(
      ['人', 'meaning'],
      ['人', 'listening'],
      ['人', 'writing'],
      ['你好', 'meaning'],
      ['你好', 'listening'],
    );
    await expectCards(machineB, afterLessonH);
    await machineB.waitForTimeout(NO_WRITE_SETTLE_MS);
    await expectCards(machineB, afterLessonH);

    await practiceCharacter(machineB, '好');

    await expectCards(
      machineB,
      newCardSummaries(
        ['人', 'meaning'],
        ['人', 'listening'],
        ['人', 'writing'],
        ['你好', 'meaning'],
        ['你好', 'listening'],
        ['你好', 'writing'],
      ),
    );
  });

  test('TC-S9.1-AC2-15: S9.1-AC2 (bổ sung) Xuất rồi nhập vẫn còn thẻ chiều viết và chữ đã viết — file có thẻ "人" viết, chữ "人", "你", không có "好"', async ({
    browser,
  }) => {
    const backupPath = await exportWritingFromMachineA(browser);

    const { cards, writtenCharacters } = await readBackupReviewPart(backupPath);

    expect(
      cards.filter((card) => card.wordId === '人' && card.facet === 'writing'),
    ).toHaveLength(1);
    expect(writtenCharacters).toEqual(
      ['人', '你'].toSorted((left, right) => left.localeCompare(right)),
    );
    expect(writtenCharacters).not.toContain('好');
  });
});
