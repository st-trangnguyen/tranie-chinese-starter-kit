import type { Stage } from '@csk/shared';

import { ProgressService } from './progress.service';

const stage = (id: string, units: Record<string, string[]>): Stage => ({
  id,
  title: id,
  units: Object.entries(units).map(([unitId, lessonIds]) => ({
    id: unitId,
    title: unitId,
    lessonIds,
  })),
});

// 2 giai đoạn × 2 nhóm × 2 bài.
const STAGES: Stage[] = [
  stage('intro', { 'intro-a': ['l1', 'l2'], 'intro-b': ['l3', 'l4'] }),
  stage('hsk1', { 'hsk1-a': ['l5', 'l6'], 'hsk1-b': ['l7', 'l8'] }),
];

describe('ProgressService — findNextLessonId', () => {
  const service = new ProgressService();

  const nextLessonOf = (completed: string[]) =>
    service.findNextLessonId(
      STAGES,
      service.deriveLessonStatuses(STAGES, new Set(completed)),
    );

  it('S8.1-AC1 Chưa học bài nào: bài tiếp theo là bài đầu tiên của lộ trình', () => {
    expect(nextLessonOf([])).toBe('l1');
  });

  it('S8.1-AC1 Đã xong vài bài: bài tiếp theo là bài kế tiếp theo thứ tự lộ trình', () => {
    expect(nextLessonOf(['l1', 'l2'])).toBe('l3');
  });

  it('S8.1-AC1 Bài kế tiếp ở nhóm sau: xong mọi bài nhóm 1 thì là bài đầu nhóm 2', () => {
    expect(nextLessonOf(['l1', 'l2'])).toBe('l3');
  });

  it('S8.1-AC1 Bài kế tiếp ở giai đoạn sau: xong mọi bài giai đoạn 1 thì là bài đầu giai đoạn 2', () => {
    expect(nextLessonOf(['l1', 'l2', 'l3', 'l4'])).toBe('l5');
  });

  it('S8.1-AC1 Còn bài đang mở ở trước một bài đã xong: bài tiếp theo là bài đầu lộ trình', () => {
    // Chỉ xong l5 (bài đầu nhóm 3 'hsk1-a'): l6 ngay sau cũng đang mở, nhưng l1 mở và đứng trước.
    const statuses = service.deriveLessonStatuses(STAGES, new Set(['l5']));
    expect(statuses.get('l1')).toBe('open');
    expect(statuses.get('l6')).toBe('open');

    expect(service.findNextLessonId(STAGES, statuses)).toBe('l1');
  });
});
