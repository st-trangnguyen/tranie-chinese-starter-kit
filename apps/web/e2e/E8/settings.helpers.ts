/** Helper e2e của màn Cài đặt S8.2 (design mục Test). */
import { expect, type Locator, type Page } from '@playwright/test';

import { LEARNING_PATH_URL } from '../E7/intro-lessons.helpers';

export const SETTINGS_URL = /\/settings$/;
export const LEARNING_PATH_URL_PATTERN = /\/learning-paths$/;
export const SETTINGS_TITLE = 'Cài đặt';
export const SETTINGS_LINK_LABEL = 'Cài đặt';
export const BACK_TO_PATH_LABEL = 'Về lộ trình';
export const LEARNING_PATH_TITLE = 'Lộ trình học';
export const SAVE_ERROR_MESSAGE = 'Không lưu được cài đặt. Hãy thử lại.';

export const DAILY_GOAL_GROUP_LABEL = 'Mục tiêu mỗi ngày';
export const AUDIO_SPEED_GROUP_LABEL = 'Tốc độ audio mặc định';
export const PINYIN_GROUP_LABEL = 'Hiện pinyin';

export const NORMAL_SPEED_LABEL = 'Bình thường (1x)';
export const SLOW_SPEED_LABEL = 'Chậm (0.75x)';
export type SpeedLabel = typeof NORMAL_SPEED_LABEL | typeof SLOW_SPEED_LABEL;

const DB_NAME = 'tranie-chinese';
const BREAK_WRITES_FLAG = 'csk-e2e-break-settings-writes';
const BREAK_READS_FLAG = 'csk-e2e-break-settings-reads';

export const learningPathHeading = (page: Page): Locator =>
  page.getByRole('heading', { level: 1, name: LEARNING_PATH_TITLE });

export const settingsHeading = (page: Page): Locator =>
  page.getByRole('heading', { level: 1, name: SETTINGS_TITLE });

export const settingsLink = (page: Page): Locator =>
  page.getByRole('link', { name: SETTINGS_LINK_LABEL, exact: true });

export const backToPathLink = (page: Page): Locator =>
  page.getByRole('link', { name: BACK_TO_PATH_LABEL });

export const goalGroup = (page: Page): Locator =>
  page.getByRole('group', { name: DAILY_GOAL_GROUP_LABEL });

export const speedGroup = (page: Page): Locator =>
  page.getByRole('group', { name: AUDIO_SPEED_GROUP_LABEL });

export const pinyinGroup = (page: Page): Locator =>
  page.getByRole('group', { name: PINYIN_GROUP_LABEL });

export const goalRadio = (page: Page, minutes: 15 | 30 | 60): Locator =>
  goalGroup(page).getByRole('radio', { name: `${minutes} phút`, exact: true });

export const speedRadio = (page: Page, label: SpeedLabel): Locator =>
  speedGroup(page).getByRole('radio', { name: label, exact: true });

export const pinyinSwitch = (page: Page): Locator =>
  pinyinGroup(page).getByRole('switch', { name: PINYIN_GROUP_LABEL });

export const saveErrorAlert = (page: Page): Locator => page.getByRole('alert');

export const expectLearningPathScreen = async (page: Page): Promise<void> => {
  await expect(page).toHaveURL(LEARNING_PATH_URL_PATTERN);
  await expect(learningPathHeading(page)).toBeVisible();
};

export const expectSettingsScreen = async (page: Page): Promise<void> => {
  await expect(page).toHaveURL(SETTINGS_URL);
  await expect(settingsHeading(page)).toBeVisible();
  await expect(goalGroup(page)).toBeVisible();
};

/** Mở màn Lộ trình bằng URL, chờ tiêu đề hiện. */
export const openLearningPath = async (page: Page): Promise<void> => {
  await page.goto(LEARNING_PATH_URL);
  await expectLearningPathScreen(page);
};

/** Ở màn Lộ trình (mở nếu chưa ở), bấm liên kết "Cài đặt", chờ màn Cài đặt hiện đủ nhóm. */
export const openSettingsFromPath = async (page: Page): Promise<void> => {
  if (!LEARNING_PATH_URL_PATTERN.test(page.url())) {
    await openLearningPath(page);
  }
  await settingsLink(page).click();
  await expectSettingsScreen(page);
};

/**
 * Giá trị thô của khóa `key` trong bảng `settings` của IndexedDB (`undefined` khi chưa có).
 * Dùng để chờ lần lưu tự động xong trước khi tải lại trang.
 */
export const readStoredSetting = (page: Page, key: string): Promise<unknown> =>
  page.evaluate(
    ({ dbName, settingKey }) =>
      new Promise<unknown>((resolve, reject) => {
        const request = indexedDB.open(dbName);
        request.onerror = () => reject(new Error('Không mở được IndexedDB.'));
        request.onsuccess = () => {
          const db = request.result;
          const read = db
            .transaction('settings', 'readonly')
            .objectStore('settings')
            .get(settingKey);
          read.onsuccess = () => {
            const row: unknown = read.result;
            db.close();
            resolve(
              typeof row === 'object' && row !== null && 'value' in row
                ? row.value
                : undefined,
            );
          };
          read.onerror = () => {
            db.close();
            reject(new Error('Không đọc được cài đặt.'));
          };
        };
      }),
    { dbName: DB_NAME, settingKey: key },
  );

/** Chờ khóa `key` đã được lưu thành `value` (lưu tự động, không có nút "Lưu"). */
export const expectStoredSetting = async (
  page: Page,
  key: string,
  value: unknown,
): Promise<void> => {
  await expect.poll(() => readStoredSetting(page, key)).toEqual(value);
};

declare global {
  interface Window {
    cskSettingsGuardInstalled?: boolean;
  }
}

/**
 * Bọc `IDBDatabase.prototype.transaction`: phạm vi có bảng `settings` thì throw `UnknownError`
 * khi cờ trong `sessionStorage` bật (`readwrite` cho ghi, `readonly` cho đọc). Đọc cờ ở mỗi lần
 * gọi nên bật/tắt cờ có hiệu lực ngay. Chạy cả trong trang hiện tại lẫn mỗi lần tải lại.
 */
const installSettingsGuard = ({
  writesFlag,
  readsFlag,
}: {
  writesFlag: string;
  readsFlag: string;
}): void => {
  if (window.cskSettingsGuardInstalled === true) {
    return;
  }
  window.cskSettingsGuardInstalled = true;
  const originalTransaction = IDBDatabase.prototype.transaction;
  IDBDatabase.prototype.transaction = function transaction(
    this: IDBDatabase,
    storeNames: string | string[],
    mode?: IDBTransactionMode,
    options?: IDBTransactionOptions,
  ): IDBTransaction {
    const names =
      typeof storeNames === 'string' ? [storeNames] : Array.from(storeNames);
    if (names.includes('settings')) {
      const isWrite = mode === 'readwrite';
      const flag = isWrite ? writesFlag : readsFlag;
      if (sessionStorage.getItem(flag) === 'on') {
        throw new DOMException(
          isWrite ? 'E2E: ghi settings lỗi' : 'E2E: đọc settings lỗi',
          'UnknownError',
        );
      }
    }
    return originalTransaction.call(this, storeNames, mode, options);
  };
};

const setGuardFlag = async (
  page: Page,
  flag: string,
  isOn: boolean,
): Promise<void> => {
  const flags = { writesFlag: BREAK_WRITES_FLAG, readsFlag: BREAK_READS_FLAG };
  await page.addInitScript(installSettingsGuard, flags);
  await page.evaluate(installSettingsGuard, flags);
  await page.evaluate(
    ({ key, on }) => {
      if (on) {
        sessionStorage.setItem(key, 'on');
      } else {
        sessionStorage.removeItem(key);
      }
    },
    { key: flag, on: isOn },
  );
};

/** Từ giờ mọi lần ghi bảng `settings` đều lỗi (kể cả sau khi tải lại trang). */
export const breakSettingsWrites = (page: Page): Promise<void> =>
  setGuardFlag(page, BREAK_WRITES_FLAG, true);

/** Ghi bảng `settings` lại được bình thường. */
export const restoreSettingsWrites = (page: Page): Promise<void> =>
  setGuardFlag(page, BREAK_WRITES_FLAG, false);

/** Từ giờ mọi lần đọc bảng `settings` đều lỗi (kể cả sau khi tải lại trang). */
export const breakSettingsReads = (page: Page): Promise<void> =>
  setGuardFlag(page, BREAK_READS_FLAG, true);
