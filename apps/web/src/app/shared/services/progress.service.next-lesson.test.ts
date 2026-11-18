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
});
