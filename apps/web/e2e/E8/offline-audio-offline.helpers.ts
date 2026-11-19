/** Helper e2e S8.4 cho nghe audio khi offline: ghi lượt phát, nghe/bỏ qua câu, hồ sơ trình duyệt bền. */
import { randomUUID } from 'crypto';
import {
  chromium,
  expect,
  type BrowserContext,
  type Locator,
  type Page,
  type TestInfo,
} from '@playwright/test';

import { readAudioPlays } from '../E7/intro-lessons.helpers';
import {
  FIXTURE_COOKIE,
  SESSION_COOKIE,
  fixtureCookieValue,
} from '../fixtures/offlineAudioFixtures';

export { installAudioRecorder } from '../E7/intro-lessons.helpers';

/** Chủ đề Nhập môn thật (có audio, nằm trong precache). */
export const INTRO_UNIT_TITLE = 'Pinyin và chữ Hán cơ bản';
/** Thông báo lỗi phát hiện có của dạng câu nói theo mẫu (nút "Nghe mẫu"). */
export const SAMPLE_PLAY_ERROR = 'Không phát được bản ghi.';
/** Thông báo lỗi phát hiện có của nút "Nghe" (từ cần nhận ra). */
export const LISTEN_ERROR = 'Không phát được audio.';
/** Đủ để lần phát vừa bấm kịp báo lỗi nếu không lấy được audio. */
const PLAY_SETTLE_MS = 1_500;

const escapeRegExp = (text: string): string =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const listenButton = (page: Page): Locator =>
  page.getByRole('button', { name: /^Nghe( mẫu)?$/ });

/** Có thông báo lỗi phát audio (của "Nghe mẫu" hoặc "Nghe"). */
const playErrors = (page: Page): Locator =>
  page.getByRole('alert').filter({
    hasText: new RegExp(
      `^(${escapeRegExp(SAMPLE_PLAY_ERROR)}|${escapeRegExp(LISTEN_ERROR)})$`,
    ),
  });

/**
 * Bấm nút nghe của câu đang hiện: lần phát mới phải là `path`, bắt đầu phát với thời lượng > 0 và
 * không hiện lỗi. Cần `installAudioRecorder` trước khi mở trang.
 */
export const expectListenPlays = async (
  page: Page,
  path: string,
): Promise<void> => {
  const playsBefore = (await readAudioPlays(page)).length;
  await listenButton(page).click();

  await expect
    .poll(async () => (await readAudioPlays(page)).length)
    .toBeGreaterThan(playsBefore);
  await expect
    .poll(async () => (await readAudioPlays(page)).at(-1)?.duration ?? 0, {
      message: `${path} phải phát được (thời lượng > 0)`,
    })
    .toBeGreaterThan(0);
  const newPlays = (await readAudioPlays(page)).slice(playsBefore);
  expect(newPlays.map((play) => play.error)).toEqual(newPlays.map(() => null));
  for (const play of newPlays) {
    expect(play.src).toMatch(new RegExp(`/${escapeRegExp(path)}$`));
  }
  await page.waitForTimeout(PLAY_SETTLE_MS);
  await expect(playErrors(page)).toHaveCount(0);
};

/**
 * Bấm "Nghe mẫu" của câu đang hiện: audio `path` không phát được; bài hiện lỗi phát như hiện có và
 * nút "Nghe mẫu" vẫn còn để thử lại.
 */
export const expectSampleCannotPlay = async (
  page: Page,
  path: string,
): Promise<void> => {
  const playsBefore = (await readAudioPlays(page)).length;
  await listenButton(page).click();

  await expect(page.getByRole('alert')).toHaveText(SAMPLE_PLAY_ERROR);
  const newPlays = (await readAudioPlays(page)).slice(playsBefore);
  for (const play of newPlays) {
    expect(play.src).toMatch(new RegExp(`/${escapeRegExp(path)}$`));
    expect(play.duration, `${path} không được phát`).toBeNull();
  }
  await expect(
    page.getByRole('button', { name: 'Nghe mẫu', exact: true }),
  ).toBeEnabled();
};

/** Tự đánh giá "Đúng" rồi sang câu kế (không cần nghe). */
export const passSpeakQuestion = async (page: Page): Promise<void> => {
  await page
    .getByRole('group', { name: 'Tự đánh giá phát âm' })
    .getByRole('button', { name: 'Đúng', exact: true })
    .click();
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
};

/** Câu `position` / `total` đang hiện. */
export const expectQuestion = async (
  page: Page,
  position: number,
  total: number,
): Promise<void> => {
  await expect(
    page.getByText(`Câu ${position} / ${total}`, { exact: true }),
  ).toBeVisible();
};

/** `audio/<file>.mp3` có ở bất kỳ cache nào của origin (kể cả precache có `__WB_REVISION__`). */
export const isInAnyCache = (page: Page, path: string): Promise<boolean> =>
  page.evaluate(
    async (url) =>
      (await caches.match(url, { ignoreSearch: true })) !== undefined,
    `/${path}`,
  );

/**
 * Mở trình duyệt với hồ sơ bền ở `profileDir` (đóng rồi mở lại cùng thư mục = mở lại app), bật nội
 * dung mẫu và phiên điều khiển mạng `sessionId`. Cookie phiên không còn sau khi đóng trình duyệt nên
 * đặt lại mỗi lần mở.
 */
export const launchPersistentApp = async (
  testInfo: TestInfo,
  profileDir: string,
  sessionId: string = randomUUID(),
): Promise<{ context: BrowserContext; page: Page }> => {
  const { baseURL, locale } = testInfo.project.use;
  const context = await chromium.launchPersistentContext(profileDir, {
    baseURL,
    locale,
  });
  const origin = new URL(baseURL ?? 'http://localhost').hostname;
  await context.addCookies([
    {
      name: FIXTURE_COOKIE,
      value: fixtureCookieValue('default'),
      domain: origin,
      path: '/',
    },
    { name: SESSION_COOKIE, value: sessionId, domain: origin, path: '/' },
  ]);
  const page = context.pages()[0] ?? (await context.newPage());
  return { context, page };
};
