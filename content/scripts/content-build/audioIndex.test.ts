import {
  INTRO_STAGE_ID,
  type Lesson,
  type Sentence,
  type Stage,
  type Word,
} from '@csk/shared';

import { buildAudioIndex, lessonAudioPaths } from './audioIndex';

const audioPath = (digit: string): string => `audio/${digit.repeat(16)}.mp3`;

const AUDIO_BA = audioPath('1');
const AUDIO_MA = audioPath('2');
const AUDIO_MA4 = audioPath('3');
const AUDIO_NI = audioPath('4');
const AUDIO_SENTENCE = audioPath('5');
const AUDIO_SHUI = audioPath('6');

const word = (id: string, pinyin: string, audio: string): Word => ({
  id,
  hanzi: id,
  pinyin,
  vi: ['nghĩa'],
  viReviewed: true,
  hsk: 1,
  audio,
});

const WORDS: Word[] = [
  word('八', 'bā', AUDIO_BA),
  word('妈', 'mā', AUDIO_MA),
  word('骂', 'mà', AUDIO_MA4),
  word('你', 'nǐ', AUDIO_NI),
  word('水', 'shuǐ', AUDIO_SHUI),
];

const SENTENCES: Sentence[] = [
  {
    id: 's1',
    hanzi: '你好！',
    pinyin: 'nǐ hǎo!',
    vi: 'Xin chào!',
    voice: 'female',
    audio: AUDIO_SENTENCE,
  },
];

const wordById = new Map(WORDS.map((item) => [item.id, item]));
const sentenceById = new Map(SENTENCES.map((item) => [item.id, item]));

const lesson = (id: string, exercises: Lesson['exercises']): Lesson => ({
  id,
  type: 'lesson',
  title: `Bài ${id}`,
  exercises,
});

describe('lessonAudioPaths', () => {
  it('S8.4-AC1 Chủ đề chưa tải có nút tải kèm dung lượng: tone-choice và pinyin-type phát audio của từ', () => {
    const result = lessonAudioPaths(
      lesson('l1', [
        { id: 'e1', kind: 'tone-choice', wordId: '八' },
        { id: 'e2', kind: 'pinyin-type', wordId: '你' },
      ]),
      wordById,
      sentenceById,
    );

    expect(result).toEqual([AUDIO_BA, AUDIO_NI]);
  });

  it('S8.4-AC1 Chủ đề chưa tải có nút tải kèm dung lượng: sound-pair phát audio của cả hai từ', () => {
    const result = lessonAudioPaths(
      lesson('l1', [
        {
          id: 'e1',
          kind: 'sound-pair',
          wordIds: ['妈', '骂'],
          answerWordId: '妈',
        },
      ]),
      wordById,
      sentenceById,
    );

    expect(result).toEqual([AUDIO_MA, AUDIO_MA4]);
  });

  it('S8.4-AC1 Chủ đề chưa tải có nút tải kèm dung lượng: speak phát audio của từ hoặc của câu', () => {
    const result = lessonAudioPaths(
      lesson('l1', [
        { id: 'e1', kind: 'speak', wordId: '八' },
        { id: 'e2', kind: 'speak', sentenceId: 's1' },
      ]),
      wordById,
      sentenceById,
    );

    expect(result).toEqual([AUDIO_BA, AUDIO_SENTENCE]);
  });

  it('S8.4-AC1 Chủ đề chưa tải có nút tải kèm dung lượng: stroke-write không phát audio', () => {
    const withStroke = lessonAudioPaths(
      lesson('l1', [
        { id: 'e1', kind: 'stroke-write', wordId: '水' },
        { id: 'e2', kind: 'tone-choice', wordId: '八' },
      ]),
      wordById,
      sentenceById,
    );

    expect(withStroke).toEqual([AUDIO_BA]);
    expect(withStroke).not.toContain(AUDIO_SHUI);
  });
});

describe('buildAudioIndex', () => {
  const LESSONS: Lesson[] = [
    lesson('hsk-01', [
      { id: 'e1', kind: 'tone-choice', wordId: '妈' },
      {
        id: 'e2',
        kind: 'sound-pair',
        wordIds: ['妈', '骂'],
        answerWordId: '骂',
      },
    ]),
    lesson('hsk-02', [
      { id: 'e1', kind: 'speak', sentenceId: 's1' },
      { id: 'e2', kind: 'pinyin-type', wordId: '骂' },
      { id: 'e3', kind: 'tone-choice', wordId: '八' },
    ]),
    lesson('hsk-03', [{ id: 'e1', kind: 'pinyin-type', wordId: '你' }]),
  ];

  const STAGES: Stage[] = [
    {
      id: 'hsk1',
      title: 'HSK 1',
      units: [
        { id: 'u-family', title: 'Gia đình', lessonIds: ['hsk-01', 'hsk-02'] },
        { id: 'u-greet', title: 'Chào hỏi', lessonIds: ['hsk-03'] },
      ],
    },
  ];

  const SIZES = new Map<string, number>([
    [AUDIO_MA, 12_000],
    [AUDIO_MA4, 13_500],
    [AUDIO_SENTENCE, 20_480],
    [AUDIO_NI, 9_000],
  ]);

  const build = (): ReturnType<typeof buildAudioIndex> =>
    buildAudioIndex(STAGES, LESSONS, wordById, sentenceById, (path) =>
      SIZES.get(path),
    );

  it('S8.4-AC1 Chủ đề chưa tải có nút tải kèm dung lượng: audio các bài của nhóm, không trùng, theo thứ tự bài', () => {
    const index = build();

    expect(index.units).toEqual({
      'u-family': [AUDIO_MA, AUDIO_MA4, AUDIO_SENTENCE, AUDIO_BA],
      'u-greet': [AUDIO_NI],
    });
  });

  it('S8.4-AC1 Chủ đề chưa tải có nút tải kèm dung lượng: bytes lấy từ dung lượng file, file chưa có ghi 0', () => {
    const index = build();

    expect(index.bytes).toEqual({
      [AUDIO_MA]: 12_000,
      [AUDIO_MA4]: 13_500,
      [AUDIO_SENTENCE]: 20_480,
      [AUDIO_BA]: 0,
      [AUDIO_NI]: 9_000,
    });
  });
});

describe('buildAudioIndex precached', () => {
  const LESSONS: Lesson[] = [
    lesson('intro-01', [
      { id: 'e1', kind: 'tone-choice', wordId: '骂' },
      { id: 'e2', kind: 'tone-choice', wordId: '八' },
    ]),
    lesson('intro-02', [
      { id: 'e1', kind: 'pinyin-type', wordId: '妈' },
      { id: 'e2', kind: 'pinyin-type', wordId: '八' },
    ]),
    lesson('hsk-01', [
      { id: 'e1', kind: 'tone-choice', wordId: '妈' },
      { id: 'e2', kind: 'pinyin-type', wordId: '你' },
      { id: 'e3', kind: 'speak', sentenceId: 's1' },
    ]),
  ];

  const STAGES: Stage[] = [
    {
      id: 'hsk1',
      title: 'HSK 1',
      units: [{ id: 'u-greet', title: 'Chào hỏi', lessonIds: ['hsk-01'] }],
    },
    {
      id: INTRO_STAGE_ID,
      title: 'Nhập môn',
      units: [
        { id: 'u-tones', title: 'Thanh điệu', lessonIds: ['intro-01'] },
        { id: 'u-pinyin', title: 'Pinyin', lessonIds: ['intro-02'] },
      ],
    },
  ];

  const build = (): ReturnType<typeof buildAudioIndex> =>
    buildAudioIndex(STAGES, LESSONS, wordById, sentenceById, () => 10_000);

  it('S8.4-AC1 Mới cài app thì audio HSK chưa có trên máy: precached chỉ gồm audio các nhóm Nhập môn, không trùng, đã sort', () => {
    const index = build();

    expect(index.precached).toEqual([AUDIO_BA, AUDIO_MA, AUDIO_MA4]);
  });

  it('S8.4-AC1 Mới cài app thì audio HSK chưa có trên máy: audio chỉ thuộc HSK không được lưu sẵn', () => {
    const index = build();

    expect(index.units['u-greet']).toEqual([
      AUDIO_MA,
      AUDIO_NI,
      AUDIO_SENTENCE,
    ]);
    expect(index.precached).toContain(AUDIO_MA);
    expect(index.precached).not.toContain(AUDIO_NI);
    expect(index.precached).not.toContain(AUDIO_SENTENCE);
  });
});

describe('buildAudioIndex nhóm không có audio', () => {
  const LESSONS: Lesson[] = [
    lesson('hsk-write', [
      { id: 'e1', kind: 'stroke-write', wordId: '水' },
      { id: 'e2', kind: 'stroke-write', wordId: '八' },
    ]),
    lesson('hsk-01', [{ id: 'e1', kind: 'tone-choice', wordId: '妈' }]),
  ];

  const STAGES: Stage[] = [
    {
      id: 'hsk1',
      title: 'HSK 1',
      units: [
        { id: 'u-write', title: 'Tập viết', lessonIds: ['hsk-write'] },
        { id: 'u-greet', title: 'Chào hỏi', lessonIds: ['hsk-01'] },
      ],
    },
  ];

  it('S8.4-AC1 Chủ đề không có audio: nhóm chỉ có bài stroke-write vẫn giữ key với danh sách rỗng', () => {
    const index = buildAudioIndex(
      STAGES,
      LESSONS,
      wordById,
      sentenceById,
      () => 10_000,
    );

    expect(index.units).toHaveProperty('u-write');
    expect(index.units['u-write']).toEqual([]);
    expect(index.units['u-greet']).toEqual([AUDIO_MA]);
    expect(index.bytes).not.toHaveProperty(AUDIO_SHUI);
  });
});
