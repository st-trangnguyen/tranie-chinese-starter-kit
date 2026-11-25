// Fixture + ContentSource giả cho test ContentService (use case và rule).

import { vi } from 'vitest';
import type {
  ContentRoot,
  Lesson,
  Sentence,
  StrokeData,
  StrokeIndex,
  Word,
} from '@csk/shared';

import type { ContentSource } from '@core/services/content-source.service';

export const ROOT: ContentRoot = {
  contentVersion: '0123456789ab',
  stages: [
    {
      id: 'intro',
      title: 'Nhập môn',
      units: [
        { id: 'intro-a', title: 'Phát âm', lessonIds: ['l1', 'l2'] },
        { id: 'intro-b', title: 'Chào hỏi', lessonIds: ['l3'] },
      ],
    },
    {
      id: 'hsk1',
      title: 'HSK 1',
      units: [{ id: 'hsk1-a', title: 'Gia đình', lessonIds: ['l4'] }],
    },
  ],
};

export const makeLesson = (id: string): Lesson => ({
  id,
  type: 'lesson',
  title: `Bài ${id}`,
  exercises: [{ id: 'e1', kind: 'tone-choice', wordId: '八' }],
});

export const makeWord = (id: string): Word => ({
  id,
  hanzi: '八',
  pinyin: 'bā',
  vi: ['tám'],
  viReviewed: true,
  hsk: 1,
  audio: 'audio/0123456789abcdef.mp3',
});

export const makeSentence = (id: string): Sentence => ({
  id,
  hanzi: '你好',
  pinyin: 'nǐ hǎo',
  vi: 'xin chào',
  voice: 'female',
  audio: 'audio/fedcba9876543210.mp3',
});

/** Từ tiếng Trung thật (id = chữ Hán) cho test tạo thẻ ôn tập (S9.1). */
export const SRS_WORD_IDS = ['你好', '谢谢', '人', '你', '好', '杯'] as const;

const WORDS: Word[] = [
  ...['w1', 'w2', 'w3'].map(makeWord),
  ...SRS_WORD_IDS.map((id) => ({ ...makeWord(id), hanzi: id })),
];
const STROKE_INDEX: StrokeIndex = ['八', '人', '你', '好', '谢'];
const STROKE_DATA: StrokeData = {
  strokes: ['M 0 0 L 1 1'],
  medians: [
    [
      [0, 0],
      [1, 1],
    ],
  ],
};
const SENTENCES: Sentence[] = ['s1', 's2'].map(makeSentence);

export const makeSource = (): ContentSource => ({
  getContentRoot: vi.fn(async () => ROOT),
  getLesson: vi.fn(async (lessonId: string) => makeLesson(lessonId)),
  getWords: vi.fn(async () => WORDS),
  getSentences: vi.fn(async () => SENTENCES),
  getStrokeIndex: vi.fn(async () => STROKE_INDEX),
  getStrokeData: vi.fn(async () => STROKE_DATA),
  getAudioIndex: vi.fn(async () => ({ units: {}, bytes: {}, precached: [] })),
});
