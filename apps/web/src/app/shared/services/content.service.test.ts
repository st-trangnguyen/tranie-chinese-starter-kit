import type { Exercise } from '@csk/shared';

import { makeLesson, makeSource, ROOT } from '@test/content-service.fixtures';

import { ContentService } from './content.service';

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
