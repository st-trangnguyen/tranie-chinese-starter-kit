/**
 * e2e S9.1 Tạo thẻ ôn tập: file sao lưu có thẻ hoặc chữ đã viết sai bị từ chối cả file
 * (test-cases.md: TC-S9.1-AC1-27, AC1-33, TC-S9.1-AC2-23). Máy chặn service worker (design D10).
 */
import { expect, test, type Page } from '@playwright/test';

import {
  backupAlert,
  backupStatus,
  CORRUPTED_MESSAGE,
  importConfirmDialog,
  importFile,
} from '../E8/backup.helpers';
import { openSettingsFromPath } from '../E8/settings.helpers';

import {
  closeMachines,
  openNewLearnerSettings,
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
import { readReviewCards, type ReviewCardRow } from './review-cards.helpers';

const COMPLETED_LABEL = 'Đã xong';
const PATH_STATUS_SELECTOR = '.learning-path-lesson-status';

interface Snapshot {
  pathStatuses: string[];
  cards: ReviewCardRow[];
}

/** Ghi lại màn Lộ trình (nhãn trạng thái mọi bài) và danh sách thẻ trên máy. */
const takeSnapshot = async (page: Page): Promise<Snapshot> => {
  await openReviewPath(page);
  return {
    pathStatuses: await page.locator(PATH_STATUS_SELECTOR).allTextContents(),
    cards: await readReviewCards(page),
  };
};

/** Người học mới xong bài mẫu A (你好, 谢谢): 4 thẻ "mới"; ghi lại trạng thái rồi mở Cài đặt. */
const setUpAfterLessonA = async (page: Page): Promise<Snapshot> => {
  await finishReviewLesson(page, 'a');
  await expectCards(page, newMeaningAndListening('你好', '谢谢'));
  const before = await takeSnapshot(page);
  await expect(pathLessonStatus(page, 'a')).toHaveText(COMPLETED_LABEL);
  await openSettingsFromPath(page);
  return before;
};

/** Màn báo file hỏng, không có hộp xác nhận, không báo đã nhập; Lộ trình và thẻ như trước. */
const expectRejectedUnchanged = async (
  page: Page,
  before: Snapshot,
): Promise<void> => {
  await expect(backupAlert(page)).toContainText(CORRUPTED_MESSAGE);
  await expect(importConfirmDialog(page)).toHaveCount(0);
  await expect(backupStatus(page)).toHaveText('');

  const after = await takeSnapshot(page);
  await expect(pathLessonStatus(page, 'a')).toHaveText(COMPLETED_LABEL);
  expect(after.pathStatuses).toEqual(before.pathStatuses);
  expect(after.cards).toEqual(before.cards);
};

const rejectedFixtures: readonly {
  id: string;
  title: string;
  fixture: ReviewBackupFixture;
}[] = [
  {
    id: 'TC-S9.1-AC1-27',
    title:
      'S9.1-AC1 (bổ sung) File có thẻ sai bị từ chối cả file — thẻ chiều không hợp lệ',
    fixture: 'the-sai-chieu.json',
  },
  {
    id: 'TC-S9.1-AC1-33',
    title:
      'S9.1-AC1 (bổ sung) File có hai thẻ trùng bị từ chối cả file — vẫn có "谢谢" nghĩa và nghe',
    fixture: 'the-trung.json',
  },
  {
    id: 'TC-S9.1-AC2-23',
    title: 'S9.1-AC2 (bổ sung) File có chữ đã viết trùng bị từ chối cả file',
    fixture: 'chu-trung.json',
  },
];

test.afterEach(async () => {
  await closeMachines();
});

test.describe('S9.1 Nhập file có thẻ hoặc chữ đã viết sai', () => {
  for (const { id, title, fixture } of rejectedFixtures) {
    test(`${id}: ${title}`, async ({ browser }) => {
      const page = await openNewLearnerSettings(browser);
      const before = await setUpAfterLessonA(page);

      await importFile(page, reviewFixturePath(fixture));

      await expectRejectedUnchanged(page, before);
      await expectCards(page, newMeaningAndListening('你好', '谢谢'));
    });
  }
});
