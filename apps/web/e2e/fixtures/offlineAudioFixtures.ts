/*
 * Nội dung mẫu S8.4 (design D12, test-cases "Điều kiện đầu chung"): stage "HSK mẫu" sau Nhập môn
 * với các chủ đề mẫu. Bài `e2e-*` và mp3 mẫu có trong mọi bản build `--mode e2e`; lộ trình, câu và
 * audio-index gộp mẫu chỉ được phục vụ khi có cookie fixture (`offlineAudioNetworkPlugin`).
 * File này được `vite.config.ts` nạp: chỉ import type từ `@csk/shared` (Node không chạy mã TS đó).
 */
import type { Lesson, Sentence } from '@csk/shared';

export const FIXTURE_COOKIE = 'csk-e2e-fixture';
export const SESSION_COOKIE = 'csk-e2e-session';
export const OFFLINE_AUDIO_FIXTURE = 'offline-audio';
export const INTRO_EMPTY_VARIANT = 'intro-empty';

/** `default`: chỉ stage "HSK mẫu"; `intro-empty`: thêm chủ đề "Nhập môn không audio" vào stage intro. */
export type OfflineAudioVariant = 'default' | typeof INTRO_EMPTY_VARIANT;

/** Giá trị cookie fixture: `offline-audio` hoặc `offline-audio,intro-empty`. */
export const fixtureCookieValue = (variant: OfflineAudioVariant): string =>
  variant === 'default'
    ? OFFLINE_AUDIO_FIXTURE
    : `${OFFLINE_AUDIO_FIXTURE},${variant}`;

export const OFFLINE_AUDIO_STAGE = { id: 'e2e-hsk', title: 'HSK mẫu' } as const;
export const INTRO_STAGE_ID = 'intro';

/** Mp3 mẫu: đường dẫn hợp `audioPathSchema` (16 hex, tiền tố `e2e0`), dung lượng đúng từng byte. */
const e2eAudio = (index: number, bytes: number) => ({
  path: `audio/e2e0${index.toString(16).padStart(12, '0')}.mp3`,
  bytes,
});

export const E2E_AUDIO = {
  /** Chung "Chào hỏi" – "Gia đình". Bốn file "Chào hỏi" tổng 2 516 582 byte ("2,4 MB"). */
  greetFamily: e2eAudio(1, 629_146),
  greetOnly1: e2eAudio(2, 629_146),
  greetOnly2: e2eAudio(3, 629_145),
  greetOnly3: e2eAudio(4, 629_145),
  /** Chung "Gia đình" – "Chủ đề C". */
  familyC: e2eAudio(5, 208_500),
  familyOnly: e2eAudio(6, 312_750),
  roundX: e2eAudio(7, 20_850),
  roundY: e2eAudio(8, 20_850),
  roundZ: e2eAudio(9, 20_850),
  pair1: e2eAudio(10, 20_850),
  pair2: e2eAudio(11, 20_850),
  /** Hai file "Chủ đề KB" tổng 870 400 byte ("850 KB"). */
  kb1: e2eAudio(12, 435_200),
  kb2: e2eAudio(13, 435_200),
  /** 300 byte ("1 KB"): chỉ byte đệm, không phát được. */
  small: e2eAudio(14, 300),
  /** 1 048 064 byte ("1,0 MB"). */
  nearMb: e2eAudio(15, 1_048_064),
  /** 1 310 720 byte ("1,3 MB"). */
  mb13: e2eAudio(16, 1_310_720),
  locked: e2eAudio(17, 20_850),
  introSharedOwn: e2eAudio(18, 20_850),
} as const;

export type E2eAudioKey = keyof typeof E2E_AUDIO;
const E2E_AUDIO_KEYS = Object.keys(E2E_AUDIO).filter(
  (key): key is E2eAudioKey => key in E2E_AUDIO,
);

/** Câu Nhập môn thật (audio nằm trong `precached`) dùng lại ở chủ đề HSK mẫu. */
export const INTRO_SENTENCE_IDS = {
  c: 'intro-12-ni-hao-ma',
  shared: 'intro-02-nihao',
  only: ['intro-12-laoshi-hao', 'intro-12-wo-hen-hao'],
} as const;

const sentenceIdOf = (key: E2eAudioKey): string => `e2e-${key}`;

/** Mỗi mp3 mẫu một câu (dạng `speak` + `sentenceId`, nút "Nghe mẫu"). */
export const OFFLINE_AUDIO_SENTENCES: Sentence[] = E2E_AUDIO_KEYS.map(
  (key, index) => ({
    id: sentenceIdOf(key),
    hanzi: '你好',
    pinyin: 'nǐ hǎo',
    vi: `Câu mẫu ${index + 1}`,
    voice: 'female',
    audio: E2E_AUDIO[key].path,
  }),
);

type SentenceRef = E2eAudioKey | { intro: string };

const toSentenceId = (ref: SentenceRef): string =>
  typeof ref === 'string' ? sentenceIdOf(ref) : ref.intro;

const speakLesson = (
  id: string,
  title: string,
  refs: readonly SentenceRef[],
  type: Lesson['type'] = 'lesson',
): Lesson => ({
  id,
  type,
  title,
  exercises: refs.map((ref, index) => ({
    id: `e${index + 1}`,
    kind: 'speak',
    sentenceId: toSentenceId(ref),
  })),
});

/** Bài chỉ có câu viết: không phát audio nào. */
const noAudioLesson = (id: string, title: string): Lesson => ({
  id,
  type: 'lesson',
  title,
  exercises: [{ id: 'e1', kind: 'stroke-write', wordId: '好' }],
});

export interface FixtureUnit {
  id: string;
  title: string;
  lessons: Lesson[];
}

const unit = (id: string, title: string, lessons: Lesson[]): FixtureUnit => ({
  id: `e2e-${id}`,
  title,
  lessons,
});

const one = (id: string, title: string, refs: readonly SentenceRef[]) =>
  unit(id, title, [speakLesson(`e2e-${id}`, `Bài ${title}`, refs)]);

const intro = (sentenceId: string): SentenceRef => ({ intro: sentenceId });

/** Chủ đề của stage "HSK mẫu", đúng thứ tự trên bản đồ. Mọi chủ đề đều khóa (sau Nhập môn). */
export const OFFLINE_AUDIO_UNITS: FixtureUnit[] = [
  unit('greet', 'Chào hỏi', [
    speakLesson('e2e-greet', 'Bài Chào hỏi', [
      'greetFamily',
      'greetOnly1',
      'greetOnly2',
      'greetOnly3',
    ]),
    // Bài `test` cuối: chủ đề khóa có link "Kiểm tra vượt cấp"; không thêm audio mới.
    speakLesson('e2e-greet-test', 'Kiểm tra Chào hỏi', ['greetFamily'], 'test'),
  ]),
  one('family', 'Gia đình', ['greetFamily', 'familyC', 'familyOnly']),
  one('c', 'Chủ đề C', ['familyC', intro(INTRO_SENTENCE_IDS.c)]),
  one('round-1', 'Vòng 1', ['roundX', 'roundY']),
  one('round-2', 'Vòng 2', ['roundY', 'roundZ']),
  one('round-3', 'Vòng 3', ['roundX', 'roundZ']),
  one('pair-1', 'Đôi 1', ['pair1', 'pair2']),
  one('pair-2', 'Đôi 2', ['pair1', 'pair2']),
  one('kb', 'Chủ đề KB', ['kb1', 'kb2']),
  one('small', 'Chủ đề nhỏ', ['small']),
  one('near-mb', 'Chủ đề sát 1 MB', ['nearMb']),
  one('mb13', 'Chủ đề 1,3 MB', ['mb13']),
  one('locked', 'Chủ đề khóa', ['locked']),
  unit('no-audio', 'Chủ đề không audio', [
    noAudioLesson('e2e-no-audio', 'Bài Chủ đề không audio'),
  ]),
  one('intro-shared', 'Chủ đề dùng chung Nhập môn', [
    intro(INTRO_SENTENCE_IDS.shared),
    'introSharedOwn',
  ]),
  one('intro-only', 'Chủ đề chỉ Nhập môn', INTRO_SENTENCE_IDS.only.map(intro)),
];

/** Biến thể `intro-empty`: chủ đề Nhập môn không có audio, thêm sau chủ đề Nhập môn thật. */
export const INTRO_EMPTY_UNIT: FixtureUnit = unit(
  'intro-empty',
  'Nhập môn không audio',
  [noAudioLesson('e2e-intro-empty', 'Bài Nhập môn không audio')],
);

/** Mọi bài mẫu, emit lúc build vào `content/lessons/<id>.json`. */
export const OFFLINE_AUDIO_LESSONS: Lesson[] = [
  ...OFFLINE_AUDIO_UNITS,
  INTRO_EMPTY_UNIT,
].flatMap((item) => item.lessons);

export const lessonFilePath = (lessonId: string): string =>
  `content/lessons/${lessonId}.json`;

/** Tiêu đề chủ đề theo id ngắn, để test tra cứu (`offlineAudioBlock(page, TOPIC.greet)`). */
export const unitTitle = (id: string): string => {
  const found = [...OFFLINE_AUDIO_UNITS, INTRO_EMPTY_UNIT].find(
    (item) => item.id === `e2e-${id}`,
  );
  if (!found) {
    throw new Error(`Không có chủ đề mẫu "${id}".`);
  }
  return found.title;
};
