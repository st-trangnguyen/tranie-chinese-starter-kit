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

  it('should fail with a clear message when a lesson cannot be loaded', async () => {
    const source = makeSource();
    vi.mocked(source.getLesson).mockRejectedValueOnce(new Error('404'));
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
});
