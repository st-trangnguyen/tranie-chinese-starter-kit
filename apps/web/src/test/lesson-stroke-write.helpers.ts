import { createElement } from 'react';
import { afterEach, beforeEach, expect, vi } from 'vitest';
import type { Word } from '@csk/shared';

import { createDatabase } from '@core/helpers/db.helper';
import LessonRunnerContainer from '@app/pages/lesson/containers/LessonRunnerContainer';
import { mockContentFetch } from '@test/mocks/content-fetch';
import { FakeHanziWriter, type FakePoint } from '@test/mocks/hanzi-writer';
import {
  mockStrokeFetch,
  type StrokeFetchMock,
} from '@test/mocks/stroke-fetch';
import { act, renderWithProviders, screen, waitFor } from '@test/render';
import { stubReducedMotion } from '@test/stroke-order-route';

/**
 * Helper dùng chung cho test câu viết (`stroke-write`) trong màn bài (S7.1 nhóm 3–4).
 * Test file vẫn phải tự gọi `vi.mock('hanzi-writer', …)` (vi.mock chỉ được hoist trong test file)
 * và `setupLessonStrokeWrite()`.
 *
 * Fetch giả ghép bài thử + `words.json` riêng (`mockContentFetch`) với file nét thật do
 * `content:build` sinh (`mockStrokeFetch`) cho URL `/content/strokes/…`.
 */

export const LESSON_ID = 'l1';
export const PERSON = '人';
export const TEN = '十';
/** Chữ hợp lệ nhưng không có trong `strokes/index.json` thật: câu viết không có dữ liệu nét. */
export const NO_STROKE_DATA = '龘';

/** Nét dài (600 đơn vị hộp 1024, ≥ 30): đủ dài để tính là một lần viết sai. */
export const LONG_STROKE_POINTS: readonly FakePoint[] = [
  { x: 100, y: 100 },
  { x: 100, y: 700 },
];

export interface TestLesson {
  id: string;
  type: 'lesson';
  title: string;
  exercises: readonly Record<string, string>[];
}

/** Bài thử mặc định: `[tone-choice 八, stroke-write 人, stroke-write 十]`. */
export const STROKE_WRITE_LESSON: TestLesson = {
  id: LESSON_ID,
  type: 'lesson',
  title: 'Bài có câu viết',
  exercises: [
    { id: 'e1', kind: 'tone-choice', wordId: '八' },
    { id: 'e2', kind: 'stroke-write', wordId: PERSON },
    { id: 'e3', kind: 'stroke-write', wordId: TEN },
  ],
};

const word = (
  hanzi: string,
  pinyin: string,
  vi: string,
  audioHash: string,
): Word => ({
  id: hanzi,
  hanzi,
  pinyin,
  vi: [vi],
  viReviewed: true,
  hsk: 1,
  audio: `audio/${audioHash}.mp3`,
});

/** Từ của bài thử, mỗi từ một `audio` khác nhau. */
export const STROKE_WRITE_WORDS: readonly Word[] = [
  word('八', 'bā', 'tám', '0000000000000008'),
  word(PERSON, 'rén', 'người', '0000000000000001'),
  word(TEN, 'shí', 'mười', '0000000000000010'),
  word(NO_STROKE_DATA, 'dá', 'rồng bay', '00000000000000aa'),
];

export interface LessonStrokeWriteFetchOptions {
  lesson?: TestLesson;
  words?: readonly Word[];
  /** Ghi đè phản hồi file nét theo tên file, vd `{ '人.json': () => new Response('', { status: 500 }) }`. */
  strokeOverrides?: Parameters<typeof mockStrokeFetch>[0];
}

/** Gắn `fetch` giả cho test hiện tại; trả mock nét để kiểm URL đã gọi. */
export const installLessonStrokeWriteFetch = ({
  lesson = STROKE_WRITE_LESSON,
  words = STROKE_WRITE_WORDS,
  strokeOverrides = {},
}: LessonStrokeWriteFetchOptions = {}): StrokeFetchMock => {
  const strokeFetch = mockStrokeFetch(strokeOverrides);
  const contentFetch = mockContentFetch(
    (input) => {
      const url = input instanceof Request ? input.url : String(input);
      if (/\/content\/lessons\/.+\.json$/.test(url)) {
        return Response.json(lesson);
      }
      if (url.startsWith('/content/strokes/')) {
        return strokeFetch.fetch(input);
      }
      return new Response('', { status: 404 });
    },
    { words },
  );
  vi.spyOn(globalThis, 'fetch').mockImplementation(contentFetch);
  return strokeFetch;
};

export interface LessonStrokeWriteEnv {
  /** Mock fetch nét đang gắn cho test hiện tại. */
  readonly strokeFetch: StrokeFetchMock;
  /** Thay fetch giả (bài, từ, override file nét) cho test hiện tại. */
  replaceFetch: (options: LessonStrokeWriteFetchOptions) => StrokeFetchMock;
}

/**
 * Đăng ký beforeEach/afterEach: xoá tiến độ bài đã lưu, reset FakeHanziWriter, tắt giảm chuyển
 * động, gắn fetch giả mặc định; dọn mock sau mỗi test.
 */
export const setupLessonStrokeWrite = (): LessonStrokeWriteEnv => {
  let current: StrokeFetchMock = mockStrokeFetch();

  beforeEach(async () => {
    const db = createDatabase();
    await db.lessonProgress.clear();
    db.close();
    FakeHanziWriter.reset();
    stubReducedMotion(false);
    current = installLessonStrokeWriteFetch();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  return {
    get strokeFetch() {
      return current;
    },
    replaceFetch: (options) => {
      vi.restoreAllMocks();
      current = installLessonStrokeWriteFetch(options);
      return current;
    },
  };
};

/** Mở màn bài thử với registry thật. */
export const renderLessonRunner = (): ReturnType<typeof renderWithProviders> =>
  renderWithProviders(
    createElement(LessonRunnerContainer, { lessonId: LESSON_ID }),
    { route: `/lessons/${LESSON_ID}` },
  );

type User = ReturnType<typeof renderWithProviders>['user'];

/** Trả lời câu chọn thanh của 八 (chọn đúng "Thanh 1") rồi bấm "Tiếp tục". */
export const answerToneChoiceAndContinue = async (
  user: User,
): Promise<void> => {
  await user.click(await screen.findByRole('button', { name: 'Thanh 1' }));
  await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));
};

/** Chờ khung viết của `character` hiện trong màn bài. */
export const findLessonPad = (character: string): Promise<HTMLElement> =>
  screen.findByRole(
    'figure',
    { name: `Khung viết chữ ${character}` },
    { timeout: 3000 },
  );

/** Path của lớp chữ mờ nền, không tính path do writer vẽ trong host. */
export const outlinePathsOf = (figure: HTMLElement): SVGPathElement[] =>
  [
    ...figure.querySelectorAll<SVGPathElement>('.stroke-order-outline path'),
  ].filter((path) => path.closest('.writing-pad-writer-host') === null);

/** Chờ writer mới nhất của `character` có quiz đang kích hoạt, trả writer đó. */
export const waitForActiveQuiz = async (
  character: string,
): Promise<FakeHanziWriter> => {
  await waitFor(() => {
    const writer = FakeHanziWriter.instances
      .filter((instance) => instance.character === character)
      .at(-1);
    expect(writer?.isQuizActive).toBe(true);
  });
  const writer = FakeHanziWriter.instances
    .filter((instance) => instance.character === character)
    .at(-1);
  if (!writer) {
    throw new Error(`Chưa có writer cho chữ ${character}`);
  }
  return writer;
};

/** Người học vẽ sai nét hiện tại (mặc định đường dài, đủ tính là một lần sai). */
export const emitMistake = (
  writer: FakeHanziWriter,
  points: readonly FakePoint[] = LONG_STROKE_POINTS,
): void => {
  act(() => writer.emitMistake({ points }));
};

/** Người học vẽ đúng nét hiện tại. */
export const emitCorrectStroke = (writer: FakeHanziWriter): void => {
  act(() => writer.emitCorrectStroke());
};
