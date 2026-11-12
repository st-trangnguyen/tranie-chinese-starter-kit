import type {
  ContentRoot,
  Exercise,
  Lesson,
  Sentence,
  Word,
} from '@csk/shared';

import type { ContentSource } from '@core/services/content-source.service';
import { ContentService } from './content.service';

const ROOT: ContentRoot = {
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

const makeLesson = (id: string): Lesson => ({
  id,
  type: 'lesson',
  title: `Bài ${id}`,
  exercises: [{ id: 'e1', kind: 'tone-choice', wordId: '八' }],
});

const makeWord = (id: string): Word => ({
  id,
  hanzi: '八',
  pinyin: 'bā',
  vi: ['tám'],
  viReviewed: true,
  hsk: 1,
  audio: 'audio/0123456789abcdef.mp3',
});

const makeSentence = (id: string): Sentence => ({
  id,
  hanzi: '你好',
  pinyin: 'nǐ hǎo',
  vi: 'xin chào',
  voice: 'female',
  audio: 'audio/fedcba9876543210.mp3',
});

const WORDS: Word[] = ['w1', 'w2', 'w3'].map(makeWord);
const SENTENCES: Sentence[] = ['s1', 's2'].map(makeSentence);

const makeSource = (): ContentSource => ({
  getContentRoot: vi.fn(async () => ROOT),
  getLesson: vi.fn(async (lessonId: string) => makeLesson(lessonId)),
  getWords: vi.fn(async () => WORDS),
  getSentences: vi.fn(async () => SENTENCES),
});

describe('ContentService — use cases', () => {
  it('S3.1-AC1: should keep stages, units and lessons in path order', async () => {
    const service = new ContentService(makeSource());

    const pathMap = await service.getPathMap();

    expect(pathMap.stages).toEqual(ROOT.stages);
    expect([...pathMap.lessonTitles]).toEqual([
      ['l1', 'Bài l1'],
      ['l2', 'Bài l2'],
      ['l3', 'Bài l3'],
      ['l4', 'Bài l4'],
    ]);
  });

  it('S3.6-AC1: should still return the path map, only missing the title, when one lesson cannot be loaded', async () => {
    const source = makeSource();
    vi.mocked(source.getLesson).mockImplementation(async (lessonId: string) => {
      if (lessonId === 'l2') {
        throw new Error('404');
      }
      return makeLesson(lessonId);
    });
    const service = new ContentService(source);

    const pathMap = await service.getPathMap();

    expect(pathMap.stages).toEqual(ROOT.stages);
    expect([...pathMap.lessonTitles]).toEqual([
      ['l1', 'Bài l1'],
      ['l3', 'Bài l3'],
      ['l4', 'Bài l4'],
    ]);
  });

  it('S3.6-AC1: should fail with a clear message when the root content cannot be loaded', async () => {
    const source = makeSource();
    vi.mocked(source.getContentRoot).mockRejectedValueOnce(new Error('404'));
    const service = new ContentService(source);

    await expect(service.getPathMap()).rejects.toThrow(
      'Không tải được lộ trình học.',
    );
  });

  it('S3.2-AC1: should return the requested lesson', async () => {
    const service = new ContentService(makeSource());

    const lesson = await service.getLesson('l2');

    expect(lesson).toEqual(makeLesson('l2'));
  });

  it('S3.2-AC1: should fail with a clear message when the lesson cannot be loaded', async () => {
    const source = makeSource();
    vi.mocked(source.getLesson).mockRejectedValueOnce(new Error('404'));
    const service = new ContentService(source);

    await expect(service.getLesson('missing')).rejects.toThrow(
      'Không mở được bài học.',
    );
  });

  it('S3.6-AC2: should return the lesson ids of the unit in order', async () => {
    const service = new ContentService(makeSource());

    await expect(service.getUnitLessonIds('intro-a')).resolves.toEqual([
      'l1',
      'l2',
    ]);
  });

  it('S3.6-AC2: should fail when the unit does not exist', async () => {
    const service = new ContentService(makeSource());

    await expect(service.getUnitLessonIds('khong-co')).rejects.toThrow(
      'Không tìm thấy chủ đề.',
    );
  });

  it('S3.6-AC2: should map each lesson id to its type', async () => {
    const source = makeSource();
    vi.mocked(source.getLesson).mockImplementation(async (id: string) => ({
      ...makeLesson(id),
      type: id === 'l2' ? 'test' : 'lesson',
    }));
    const service = new ContentService(source);

    const types = await service.getLessonTypes(['l1', 'l2']);

    expect([...types]).toEqual([
      ['l1', 'lesson'],
      ['l2', 'test'],
    ]);
  });
});

describe('ContentService.collectContentIds — rules', () => {
  const service = new ContentService(makeSource());

  it.each<[string, Exercise, { wordIds: string[]; sentenceIds: string[] }]>([
    [
      'tone-choice',
      { id: 'e1', kind: 'tone-choice', wordId: 'w1' },
      { wordIds: ['w1'], sentenceIds: [] },
    ],
    [
      'pinyin-type',
      { id: 'e1', kind: 'pinyin-type', wordId: 'w2' },
      { wordIds: ['w2'], sentenceIds: [] },
    ],
    [
      'stroke-write',
      { id: 'e1', kind: 'stroke-write', wordId: 'w3' },
      { wordIds: ['w3'], sentenceIds: [] },
    ],
    [
      'sound-pair',
      {
        id: 'e1',
        kind: 'sound-pair',
        wordIds: ['w2', 'w1'],
        answerWordId: 'w1',
      },
      { wordIds: ['w2', 'w1'], sentenceIds: [] },
    ],
    [
      'speak with word',
      { id: 'e1', kind: 'speak', wordId: 'w1' },
      { wordIds: ['w1'], sentenceIds: [] },
    ],
    [
      'speak with sentence',
      { id: 'e1', kind: 'speak', sentenceId: 's2' },
      { wordIds: [], sentenceIds: ['s2'] },
    ],
  ])(
    'S4.4-AC1: should collect ids of a %s exercise',
    (_name, exercise, expected) => {
      expect(service.collectContentIds(exercise)).toEqual(expected);
    },
  );
});

describe('ContentService.getExerciseContents — use case', () => {
  const lesson: Lesson = {
    id: 'l1',
    type: 'lesson',
    title: 'Bài l1',
    exercises: [
      {
        id: 'e1',
        kind: 'sound-pair',
        wordIds: ['w3', 'w1'],
        answerWordId: 'w1',
      },
      { id: 'e2', kind: 'speak', sentenceId: 's2' },
      { id: 'e3', kind: 'tone-choice', wordId: 'w2' },
    ],
  };

  it('S4.4-AC1: should map each exercise id to its words and sentences in id order', async () => {
    const service = new ContentService(makeSource());

    const contents = await service.getExerciseContents(lesson);

    expect([...contents.keys()]).toEqual(['e1', 'e2', 'e3']);
    expect(contents.get('e1')).toEqual({
      words: [makeWord('w3'), makeWord('w1')],
      sentences: [],
    });
    expect(contents.get('e2')).toEqual({
      words: [],
      sentences: [makeSentence('s2')],
    });
    expect(contents.get('e3')).toEqual({
      words: [makeWord('w2')],
      sentences: [],
    });
  });

  it('S4.4-AC1: should fail with a clear message when a word id is missing', async () => {
    const service = new ContentService(makeSource());
    const broken: Lesson = {
      ...lesson,
      exercises: [{ id: 'e9', kind: 'tone-choice', wordId: 'nope' }],
    };

    await expect(service.getExerciseContents(broken)).rejects.toThrow(
      'Không tìm thấy từ "nope" của câu "e9".',
    );
  });

  it('S4.4-AC1: should fail naming the sentence when a sentence id is missing', async () => {
    const service = new ContentService(makeSource());
    const broken: Lesson = {
      ...lesson,
      exercises: [{ id: 'e8', kind: 'speak', sentenceId: 'gone' }],
    };

    await expect(service.getExerciseContents(broken)).rejects.toThrow(
      /gone.*e8/,
    );
  });

  it('S4.4-AC1: should wrap a load failure with a clear message and cause', async () => {
    const source = makeSource();
    const failure = new Error('404');
    vi.mocked(source.getWords).mockRejectedValueOnce(failure);
    const service = new ContentService(source);

    const error = await service.getExerciseContents(lesson).then(
      () => null,
      (e: unknown) => e,
    );

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).not.toBe('404');
    expect((error as Error).cause).toBe(failure);
  });
});
