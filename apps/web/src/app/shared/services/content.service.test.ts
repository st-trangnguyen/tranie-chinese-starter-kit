import type { ContentRoot, Lesson } from '@csk/shared';

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

const makeSource = (): ContentSource => ({
  getContentRoot: vi.fn(async () => ROOT),
  getLesson: vi.fn(async (lessonId: string) => makeLesson(lessonId)),
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
