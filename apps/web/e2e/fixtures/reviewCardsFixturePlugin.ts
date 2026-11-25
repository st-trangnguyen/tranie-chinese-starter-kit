/*
 * S9.1 (design D12): nội dung mẫu E9 trong bản build e2e để spec offline chạy với service worker.
 * - Build: emit bài `s91-*` vào `content/lessons/` (là `.json` nên vào precache).
 * - Preview: theo cookie `csk-e2e-fixture` có cờ `review-cards`, `content.json` = lộ trình mẫu,
 *   `words.json` = từ thật + từ thêm. Không có cờ → `next()`, e2e cũ không đổi.
 * Dùng `zod` trực tiếp vì file chạy trong Node (không nạp được mã TS của `@csk/shared`).
 */
import type { IncomingMessage } from 'http';
import { readFile } from 'fs/promises';
import Path from 'path';
import { z } from 'zod';
import type { Connect, Plugin } from 'vite';
import type { Word } from '@csk/shared';

import { FIXTURE_COOKIE, lessonFilePath } from './offlineAudioFixtures';
import { pathnameOf, readCookies, sendJson } from './offlineAudioNetworkPlugin';
import {
  REVIEW_CARDS_FIXTURE,
  REVIEW_CONTENT_ROOT,
  REVIEW_LESSONS,
  withExtraWords,
} from './reviewCardsFixtures';

export const REVIEW_CARDS_ENTRY_URL = `/__e2e/fixture/${REVIEW_CARDS_FIXTURE}`;

/**
 * Kiểm hình dạng `Word` (không kiểm regex hanzi/pinyin/audio); app validate đầy đủ khi nạp bằng
 * `wordSchema` của `@csk/shared`.
 */
const wordsSchema = z.array(
  z.object({
    id: z.string(),
    hanzi: z.string(),
    pinyin: z.string(),
    vi: z.array(z.string()),
    viReviewed: z.boolean(),
    hsk: z.number(),
    audio: z.string(),
  }),
);

/** Chỉ bản build `--mode e2e`: thêm bài `s91-*` (tên mới, không đè file thật). */
export const reviewCardsBuildPlugin = (): Plugin => ({
  name: 'csk-e2e-review-cards-build',
  apply: 'build',
  generateBundle() {
    REVIEW_LESSONS.forEach((lesson) => {
      this.emitFile({
        type: 'asset',
        fileName: lessonFilePath(lesson.id),
        source: JSON.stringify(lesson),
      });
    });
  },
});

const hasReviewCardsFlag = (req: IncomingMessage): boolean =>
  (readCookies(req).get(FIXTURE_COOKIE) ?? '')
    .split(',')
    .includes(REVIEW_CARDS_FIXTURE);

const readWordsWithExtras = async (contentDir: string): Promise<Word[]> => {
  const raw: unknown = JSON.parse(
    await readFile(Path.join(contentDir, 'words.json'), 'utf8'),
  );
  return withExtraWords(wordsSchema.parse(raw));
};

const reviewCardsMiddleware =
  (contentDir: string): Connect.NextHandleFunction =>
  (req, res, next) => {
    const pathname = pathnameOf(req);
    if (pathname === REVIEW_CARDS_ENTRY_URL) {
      res.statusCode = 302;
      res.setHeader(
        'Set-Cookie',
        `${FIXTURE_COOKIE}=${REVIEW_CARDS_FIXTURE}; Path=/; SameSite=Lax`,
      );
      res.setHeader('Location', '/');
      res.end();
      return;
    }
    if (!hasReviewCardsFlag(req)) {
      next();
      return;
    }
    if (pathname === '/content/content.json') {
      sendJson(res, 200, REVIEW_CONTENT_ROOT);
      return;
    }
    if (pathname === '/content/words.json') {
      readWordsWithExtras(contentDir).then(
        (words) => sendJson(res, 200, words),
        (error: unknown) => next(error),
      );
      return;
    }
    next();
  };

/** Chỉ `vite preview` (bản build `--mode e2e`): lộ trình và từ mẫu S9.1 theo cookie. */
export const reviewCardsPreviewPlugin = (): Plugin => ({
  name: 'csk-e2e-review-cards-preview',
  apply: (_, env) => env.isPreview === true,
  configurePreviewServer(server) {
    const outDir = Path.resolve(server.config.root, server.config.build.outDir);
    server.middlewares.use(reviewCardsMiddleware(Path.join(outDir, 'content')));
  },
});
