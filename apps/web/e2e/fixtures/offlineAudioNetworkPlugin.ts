/*
 * S8.4 (design D12): middleware của `vite preview --mode e2e`, theo cookie. Service worker gửi kèm
 * cookie cùng origin nên điều khiển được cả request do SW gửi. Không có cookie → mọi thứ như cũ.
 * - `csk-e2e-fixture=offline-audio[,intro-empty]`: phục vụ nội dung gộp mẫu.
 * - `csk-e2e-session=<id>`: luật mạng cho `/audio/*` (chậm, giữ tới khi thả, lỗi 503, offline) và
 *   log lượt phục vụ, riêng từng phiên (test song song không ảnh hưởng nhau).
 */
import type { IncomingMessage, ServerResponse } from 'http';
import Path from 'path';
import { z } from 'zod';
import type { Connect, Plugin } from 'vite';

import {
  MERGED_CONTENT_FILES,
  readMergedContent,
  type MergedContentFile,
} from './offlineAudioContent';
import {
  FIXTURE_COOKIE,
  INTRO_EMPTY_VARIANT,
  OFFLINE_AUDIO_FIXTURE,
  SESSION_COOKIE,
  fixtureCookieValue,
  type OfflineAudioVariant,
} from './offlineAudioFixtures';

export const AUDIO_NETWORK_API = '/__e2e/audio-network';
export const FIXTURE_ENTRY_URL = `/__e2e/fixture/${OFFLINE_AUDIO_FIXTURE}`;

/** Luật gửi lên `POST /__e2e/audio-network`; field vắng mặt giữ giá trị cũ của phiên. */
export const audioNetworkRulesSchema = z.object({
  delayMs: z.number().int().nonnegative().optional(),
  failPaths: z.array(z.string()).optional(),
  holdPaths: z.array(z.string()).optional(),
  isOffline: z.boolean().optional(),
});
export type AudioNetworkRules = z.infer<typeof audioNetworkRulesSchema>;
const releaseSchema = z.object({ path: z.string() });

interface PendingRequest {
  path: string;
  req: IncomingMessage;
  res: ServerResponse;
  next: Connect.NextFunction;
  isDelayed: boolean;
}

interface Session {
  rules: Required<AudioNetworkRules>;
  pending: PendingRequest[];
  served: string[];
}

/** Đường dẫn audio dạng `audio/<file>.mp3` (như audio-index), bỏ `/` đầu. */
const normalizePath = (path: string): string => path.replace(/^\/+/, '');

const readCookies = (req: IncomingMessage): Map<string, string> =>
  new Map(
    (req.headers.cookie ?? '').split(';').flatMap((part) => {
      const separator = part.indexOf('=');
      return separator < 0
        ? []
        : [
            [
              part.slice(0, separator).trim(),
              decodeURIComponent(part.slice(separator + 1).trim()),
            ] as const,
          ];
    }),
  );

const fixtureVariantOf = (
  req: IncomingMessage,
): OfflineAudioVariant | undefined => {
  const flags = (readCookies(req).get(FIXTURE_COOKIE) ?? '').split(',');
  if (!flags.includes(OFFLINE_AUDIO_FIXTURE)) {
    return undefined;
  }
  return flags.includes(INTRO_EMPTY_VARIANT) ? INTRO_EMPTY_VARIANT : 'default';
};

const pathnameOf = (req: IncomingMessage): string =>
  decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);

const sendJson = (res: ServerResponse, status: number, body: unknown): void => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
};

const readBody = async (req: IncomingMessage): Promise<unknown> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }
  const text = Buffer.concat(chunks).toString('utf8');
  return text === '' ? {} : JSON.parse(text);
};

const isMergedContentFile = (file: string): file is MergedContentFile =>
  MERGED_CONTENT_FILES.some((item) => item === file);

/** Nội dung gộp mẫu khi có cookie fixture; `GET /__e2e/fixture/offline-audio` đặt cookie (chạy tay). */
const fixtureMiddleware =
  (contentDir: string): Connect.NextHandleFunction =>
  (req, res, next) => {
    const pathname = pathnameOf(req);
    if (pathname === FIXTURE_ENTRY_URL) {
      const query = new URL(req.url ?? '/', 'http://localhost').searchParams;
      const variant =
        query.get('variant') === INTRO_EMPTY_VARIANT
          ? INTRO_EMPTY_VARIANT
          : 'default';
      res.statusCode = 302;
      res.setHeader(
        'Set-Cookie',
        `${FIXTURE_COOKIE}=${fixtureCookieValue(variant)}; Path=/; SameSite=Lax`,
      );
      res.setHeader('Location', '/');
      res.end();
      return;
    }
    const file = pathname.replace(/^\/content\//, '');
    const variant = fixtureVariantOf(req);
    if (
      variant === undefined ||
      !pathname.startsWith('/content/') ||
      !isMergedContentFile(file)
    ) {
      next();
      return;
    }
    readMergedContent(contentDir, file, variant).then(
      (body) => sendJson(res, 200, body),
      (error: unknown) => next(error),
    );
  };

const createSession = (): Session => ({
  rules: { delayMs: 0, failPaths: [], holdPaths: [], isOffline: false },
  pending: [],
  served: [],
});

/** Áp luật cho một request audio; gọi lại khi luật đổi, khi thả, hoặc hết thời gian chậm. */
const handleAudio = (session: Session, request: PendingRequest): void => {
  const { rules } = session;
  const { res } = request;
  if (rules.isOffline) {
    request.req.socket.destroy();
    return;
  }
  if (rules.holdPaths.includes(request.path)) {
    session.pending.push(request);
    return;
  }
  if (rules.failPaths.includes(request.path)) {
    res.statusCode = 503;
    res.end();
    return;
  }
  if (rules.delayMs > 0 && !request.isDelayed) {
    setTimeout(() => {
      handleAudio(session, { ...request, isDelayed: true });
    }, rules.delayMs);
    return;
  }
  session.served.push(request.path);
  request.next();
};

const resumePending = (session: Session): void => {
  const waiting = session.pending;
  session.pending = [];
  waiting.forEach((request) => handleAudio(session, request));
};

const audioNetworkMiddleware = (): Connect.NextHandleFunction => {
  const sessions = new Map<string, Session>();
  const sessionOf = (id: string): Session => {
    const existing = sessions.get(id);
    if (existing) {
      return existing;
    }
    const created = createSession();
    sessions.set(id, created);
    return created;
  };

  const handleApi = async (
    req: IncomingMessage,
    res: ServerResponse,
    session: Session,
    pathname: string,
  ): Promise<void> => {
    if (pathname === `${AUDIO_NETWORK_API}/log` && req.method === 'GET') {
      sendJson(res, 200, { served: session.served });
      return;
    }
    if (pathname === `${AUDIO_NETWORK_API}/release` && req.method === 'POST') {
      const { path } = releaseSchema.parse(await readBody(req));
      const released = normalizePath(path);
      session.rules = {
        ...session.rules,
        holdPaths: session.rules.holdPaths.filter((item) => item !== released),
      };
    } else if (pathname === AUDIO_NETWORK_API && req.method === 'POST') {
      const rules = audioNetworkRulesSchema.parse(await readBody(req));
      session.rules = {
        delayMs: rules.delayMs ?? session.rules.delayMs,
        failPaths: (rules.failPaths ?? session.rules.failPaths).map(
          normalizePath,
        ),
        holdPaths: (rules.holdPaths ?? session.rules.holdPaths).map(
          normalizePath,
        ),
        isOffline: rules.isOffline ?? session.rules.isOffline,
      };
    } else {
      sendJson(res, 404, { error: `Không có API ${req.method} ${pathname}` });
      return;
    }
    resumePending(session);
    sendJson(res, 200, { rules: session.rules });
  };

  return (req, res, next) => {
    const pathname = pathnameOf(req);
    const isApi = pathname.startsWith(AUDIO_NETWORK_API);
    if (!isApi && !pathname.startsWith('/audio/')) {
      next();
      return;
    }
    const sessionId = readCookies(req).get(SESSION_COOKIE);
    if (sessionId === undefined) {
      if (isApi) {
        sendJson(res, 400, { error: `Thiếu cookie ${SESSION_COOKIE}` });
        return;
      }
      next();
      return;
    }
    const session = sessionOf(sessionId);
    if (isApi) {
      handleApi(req, res, session, pathname).catch((error: unknown) =>
        sendJson(res, 400, { error: String(error) }),
      );
      return;
    }
    const request: PendingRequest = {
      path: normalizePath(pathname),
      req,
      res,
      next,
      isDelayed: false,
    };
    handleAudio(session, request);
  };
};

/** Chỉ `vite preview` (bản build `--mode e2e`): nội dung gộp mẫu và điều khiển mạng audio. */
export const offlineAudioNetworkPlugin = (): Plugin => ({
  name: 'csk-e2e-offline-audio-network',
  apply: (_, env) => env.isPreview === true,
  configurePreviewServer(server) {
    const outDir = Path.resolve(server.config.root, server.config.build.outDir);
    server.middlewares.use(fixtureMiddleware(Path.join(outDir, 'content')));
    server.middlewares.use(audioNetworkMiddleware());
  },
});
