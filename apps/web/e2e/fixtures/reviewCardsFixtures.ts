/*
 * Nội dung mẫu S9.1 (design D10, D12): lộ trình mẫu, bài `s91-*`, từ thêm vào `words.json`.
 * Hai đường cùng nguồn này: `serveReviewCardsPath` (`page.route`, spec E9 có mạng) và bản build e2e
 * (bài `s91-*` emit lúc build, lộ trình + `words.json` gộp chỉ phục vụ khi có cookie fixture).
 * File này được `vite.config.ts` nạp: chỉ import type từ `@csk/shared` (Node không chạy mã TS đó).
 * Validate bằng Zod ở `e2e/E9/review-cards.content.ts`.
 */
import type { ContentRoot, Exercise, Lesson, Word } from '@csk/shared';

/** Giá trị cookie `csk-e2e-fixture` bật nội dung mẫu S9.1 trên bản build e2e. */
export const REVIEW_CARDS_FIXTURE = 'review-cards';

/** Lesson ID của bài mẫu (bảng design D10). */
export const REVIEW_LESSON_IDS = {
  a: 's91-a',
  aSkip: 's91-a-skip',
  b: 's91-b',
  c: 's91-c',
  d: 's91-d',
  e: 's91-e',
  f: 's91-f',
  g: 's91-g',
  h: 's91-h',
  k: 's91-k',
  kt1: 's91-kt-1',
  ktTest: 's91-kt-test',
  vc1: 's91-vc1',
  vc2: 's91-vc2',
  vcTest: 's91-vc-test',
} as const;

/** Tiêu đề người học thấy của từng bài mẫu. */
export const REVIEW_LESSON_TITLES = {
  a: 'Bài mẫu A',
  aSkip: "Bài mẫu A'",
  b: 'Bài mẫu B',
  c: 'Bài mẫu C',
  d: 'Bài mẫu D',
  e: 'Bài mẫu E',
  f: 'Bài mẫu F',
  g: 'Bài mẫu G',
  h: 'Bài mẫu H',
  k: 'Bài mẫu K',
  kt1: 'Bài KT 1',
  ktTest: 'Kiểm tra KT',
  vc1: 'Bài VC1',
  vc2: 'Bài VC2',
  vcTest: 'Kiểm tra VC',
} as const;

export type ReviewLessonKey = keyof typeof REVIEW_LESSON_IDS;

export const REVIEW_UNIT_TITLES = {
  main: 'Chủ đề mẫu',
  kt: 'Chủ đề KT',
  vc: 'Chủ đề VC',
} as const;

/** Chữ không có trong `strokes/index.json` (bài A', bài K, file `chu-khong-net`). */
export const NO_STROKE_CHARACTER = '杯';
/** Từ / chữ không có trong nội dung app (file `the-tu-la`, `chu-la`). */
export const UNKNOWN_WORD_ID = '龘龘';
export const UNKNOWN_CHARACTER = '龘';
/** Câu thật của bài Nhập môn 2 dùng cho bài mẫu E (chỉ câu). */
export const SENTENCE_ID = 'intro-02-nihao';

const toneChoice = (id: string, wordId: string): Exercise => ({
  id,
  kind: 'tone-choice',
  wordId,
});
const pinyinType = (id: string, wordId: string): Exercise => ({
  id,
  kind: 'pinyin-type',
  wordId,
});
const strokeWrite = (id: string, wordId: string): Exercise => ({
  id,
  kind: 'stroke-write',
  wordId,
});

const lesson = (
  key: ReviewLessonKey,
  exercises: Exercise[],
  type: Lesson['type'] = 'lesson',
): Lesson => ({
  id: REVIEW_LESSON_IDS[key],
  type,
  title: REVIEW_LESSON_TITLES[key],
  exercises,
});

/** Mọi bài mẫu (emit lúc build vào `content/lessons/<id>.json`, D12). */
export const REVIEW_LESSONS: readonly Lesson[] = [
  lesson('a', [pinyinType('a-1', '你好'), pinyinType('a-2', '谢谢')]),
  lesson('aSkip', [
    pinyinType('a-skip-1', '你好'),
    pinyinType('a-skip-2', '谢谢'),
    strokeWrite('a-skip-3', NO_STROKE_CHARACTER),
  ]),
  lesson('b', [toneChoice('b-1', '人'), pinyinType('b-2', '人')]),
  lesson('c', [strokeWrite('c-1', '人'), toneChoice('c-2', '人')]),
  lesson('d', [
    {
      id: 'd-1',
      kind: 'sound-pair',
      wordIds: ['妈', '马'],
      answerWordId: '妈',
    },
  ]),
  lesson('e', [{ id: 'e-1', kind: 'speak', sentenceId: SENTENCE_ID }]),
  lesson('f', [toneChoice('f-1', '你')]),
  lesson('g', [toneChoice('g-1', '你'), toneChoice('g-2', '好')]),
  lesson('h', [pinyinType('h-1', '你好')]),
  lesson('k', [
    toneChoice('k-1', NO_STROKE_CHARACTER),
    pinyinType('k-2', NO_STROKE_CHARACTER),
  ]),
  lesson('kt1', [toneChoice('kt-1-1', '你')]),
  lesson(
    'ktTest',
    [toneChoice('kt-test-1', '你'), toneChoice('kt-test-2', '八')],
    'test',
  ),
  lesson('vc1', [pinyinType('vc1-1', '你好'), pinyinType('vc1-2', '你好')]),
  lesson('vc2', [toneChoice('vc2-1', '人'), pinyinType('vc2-2', '人')]),
  lesson(
    'vcTest',
    [pinyinType('vc-test-1', '你好'), toneChoice('vc-test-2', '人')],
    'test',
  ),
];

export const findReviewLesson = (lessonId: string): Lesson | undefined =>
  REVIEW_LESSONS.find((item) => item.id === lessonId);

const ids = (...keys: ReviewLessonKey[]): string[] =>
  keys.map((key) => REVIEW_LESSON_IDS[key]);

/**
 * Lộ trình mẫu: bài A là bài 1, bài B ngay sau (file `the-nihao`: A xong thì B "Đang mở"); chủ đề VC
 * là chủ đề cuối, chưa mở với người học mới, bài cuối là bài kiểm tra vượt cấp.
 */
export const REVIEW_CONTENT_ROOT: ContentRoot = {
  contentVersion: '5e9100000001',
  stages: [
    {
      id: 's91-stage',
      title: 'Giai đoạn mẫu S9.1',
      units: [
        {
          id: 's91-unit-main',
          title: REVIEW_UNIT_TITLES.main,
          lessonIds: ids('a', 'b', 'c', 'aSkip', 'd', 'e', 'f', 'g', 'h', 'k'),
        },
        {
          id: 's91-unit-kt',
          title: REVIEW_UNIT_TITLES.kt,
          lessonIds: ids('kt1', 'ktTest'),
        },
        {
          id: 's91-unit-vc',
          title: REVIEW_UNIT_TITLES.vc,
          lessonIds: ids('vc1', 'vc2', 'vcTest'),
        },
      ],
    },
  ],
};

/** Từ dùng trong bài mẫu nhưng không có trong `words.json` thật. */
const EXTRA_WORD_SEEDS = [
  { id: '你好', pinyin: 'nǐhǎo', vi: ['xin chào'] },
  { id: '妈', pinyin: 'mā', vi: ['mẹ'] },
  { id: '马', pinyin: 'mǎ', vi: ['ngựa'] },
] as const;

/**
 * `words.json` phục vụ trong test: từ thật + từ thêm (dùng lại `audio` của một từ thật, đúng
 * `audioPathSchema`). Từ thêm đã có trong bản thật thì giữ bản thật. Pure, không validate.
 */
export const withExtraWords = (realWords: readonly Word[]): Word[] => {
  const audio = realWords[0]?.audio;
  if (audio === undefined) {
    throw new Error('words.json thật rỗng, không lấy được audio mẫu.');
  }
  const realIds = new Set(realWords.map((word) => word.id));
  const extras = EXTRA_WORD_SEEDS.filter((seed) => !realIds.has(seed.id)).map(
    (seed): Word => ({
      id: seed.id,
      hanzi: seed.id,
      pinyin: seed.pinyin,
      vi: [...seed.vi],
      viReviewed: false,
      hsk: 1,
      audio,
    }),
  );
  return [...realWords, ...extras];
};
