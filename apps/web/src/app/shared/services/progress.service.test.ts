import {
  DEFAULT_SETTINGS,
  type LessonProgress,
  type Settings,
  type Stage,
} from '@csk/shared';

import type { ProgressStore } from '@core/services/progress-store.service';
import { ProgressService } from './progress.service';

const makeStore = (
  initial: Settings = DEFAULT_SETTINGS,
  lessonProgress: LessonProgress[] = [],
) => {
  let saved = initial;
  const store: ProgressStore = {
    getSettings: vi.fn(async () => saved),
    saveSettings: vi.fn(async (settings: Settings) => {
      saved = settings;
    }),
    getAllLessonProgress: vi.fn(async () => lessonProgress),
    getLessonProgress: vi.fn(async (lessonId: string) =>
      lessonProgress.find((progress) => progress.lessonId === lessonId),
    ),
    saveLessonProgress: vi.fn(async () => undefined),
    saveLessonProgressBatch: vi.fn(async () => undefined),
    getDailyStat: vi.fn(async () => undefined),
    addStudySeconds: vi.fn(async () => undefined),
    getAllDailyStats: vi.fn(async () => []),
    saveDailyGoal: vi.fn(async () => undefined),
    exportAll: vi.fn(async () => ({
      settings: saved,
      lessonProgress,
      dailyStats: [],
    })),
    importAll: vi.fn(async () => undefined),
  };
  return store;
};

describe('ProgressService — rules', () => {
  const service = new ProgressService(makeStore());

  it.each([15, 30, 60])('accepts %i minutes as a daily goal', (minutes) => {
    expect(service.isValidDailyGoal(minutes)).toBe(true);
  });

  it.each([0, 20, 45, 61, -15, 30.5])('rejects %s minutes', (minutes) => {
    expect(service.isValidDailyGoal(minutes)).toBe(false);
  });

  it('shows onboarding only until it is completed', () => {
    expect(service.shouldShowOnboarding(DEFAULT_SETTINGS)).toBe(true);
    expect(
      service.shouldShowOnboarding({
        ...DEFAULT_SETTINGS,
        hasCompletedOnboarding: true,
      }),
    ).toBe(false);
  });
});

describe('ProgressService — lesson status rule', () => {
  const service = new ProgressService(makeStore());

  const stage = (id: string, units: Record<string, string[]>): Stage => ({
    id,
    title: id,
    units: Object.entries(units).map(([unitId, lessonIds]) => ({
      id: unitId,
      title: unitId,
      lessonIds,
    })),
  });

  const STAGES: Stage[] = [
    stage('intro', { 'intro-a': ['l1', 'l2'], 'intro-b': ['l3'] }),
    stage('hsk1', { 'hsk1-a': ['l4', 'l5'] }),
  ];

  const statusesOf = (completed: string[]) =>
    Object.fromEntries(
      service.deriveLessonStatuses(STAGES, new Set(completed)),
    );

  it('S3.1-AC2: should open only the first lesson when nothing is completed', () => {
    expect(statusesOf([])).toEqual({
      l1: 'open',
      l2: 'locked',
      l3: 'locked',
      l4: 'locked',
      l5: 'locked',
    });
  });

  it('S3.1-AC2: should open the next lesson when the previous ones are completed', () => {
    expect(statusesOf(['l1', 'l2'])).toEqual({
      l1: 'completed',
      l2: 'completed',
      l3: 'open',
      l4: 'locked',
      l5: 'locked',
    });
  });

  it('S3.1-AC2: should open the first lesson of the next unit or stage', () => {
    expect(statusesOf(['l1', 'l2', 'l3'])).toMatchObject({
      l3: 'completed',
      l4: 'open',
      l5: 'locked',
    });
  });

  it('S3.1-AC2: should ignore completed ids that are not in the path', () => {
    expect(statusesOf(['unknown'])).toMatchObject({ l1: 'open', l2: 'locked' });
  });

  it('S8.5-AC3 Bài không có trong app không ảnh hưởng lộ trình: bài 1 + bài lạ đã xong → bài 2 mở, còn lại khóa', () => {
    const introStages: Stage[] = [
      stage('intro', {
        'intro-a': ['intro-01', 'intro-02'],
        'intro-b': ['intro-03', 'intro-04'],
      }),
    ];

    const statuses = service.deriveLessonStatuses(
      introStages,
      new Set(['intro-01', 'khong-co-bai-nay']),
    );

    expect(Object.fromEntries(statuses)).toEqual({
      'intro-01': 'completed',
      'intro-02': 'open',
      'intro-03': 'locked',
      'intro-04': 'locked',
    });
    expect(statuses.has('khong-co-bai-nay')).toBe(false);
  });
});

describe('ProgressService — placement test rule', () => {
  const service = new ProgressService(makeStore());

  const STAGES: Stage[] = [
    {
      id: 'hsk1',
      title: 'hsk1',
      units: [
        { id: 'u1', title: 'u1', lessonIds: ['a1', 'a2', 'a-test'] },
        {
          id: 'u2',
          title: 'u2',
          lessonIds: ['b1', 'b-test-1', 'b2', 'b-test-2'],
        },
        { id: 'u3', title: 'u3', lessonIds: ['c1', 'c2'] },
      ],
    },
  ];
  const unitOf = (unitId: string) => {
    const found = STAGES.flatMap((stage) => stage.units).find(
      (unit) => unit.id === unitId,
    );
    if (!found) {
      throw new Error(`missing unit ${unitId}`);
    }
    return found;
  };
  const statusesOf = (completed: string[]) =>
    new Map(service.deriveLessonStatuses(STAGES, new Set(completed)));
  const lessonTypes = new Map<string, 'lesson' | 'test'>([
    ['a1', 'lesson'],
    ['a2', 'lesson'],
    ['a-test', 'test'],
    ['b1', 'lesson'],
    ['b-test-1', 'test'],
    ['b2', 'lesson'],
    ['b-test-2', 'test'],
    ['c1', 'lesson'],
    ['c2', 'lesson'],
  ]);

  it('S3.6-AC1: should return the last test lesson when the unit is fully locked', () => {
    expect(
      service.getPlacementTestLessonId(
        unitOf('u2'),
        statusesOf([]),
        lessonTypes,
      ),
    ).toBe('b-test-2');
  });

  it('S3.6-AC1: should return no test lesson when the unit has an open lesson', () => {
    expect(
      service.getPlacementTestLessonId(
        unitOf('u1'),
        statusesOf([]),
        lessonTypes,
      ),
    ).toBeUndefined();
  });

  it('S3.6-AC1: should return no test lesson when the unit is completed', () => {
    const statuses = statusesOf(['a1', 'a2', 'a-test']);
    expect(
      service.getPlacementTestLessonId(unitOf('u1'), statuses, lessonTypes),
    ).toBeUndefined();
  });

  it('S3.6-AC1: should return no test lesson when a locked unit has no test lesson', () => {
    expect(
      service.getPlacementTestLessonId(
        unitOf('u3'),
        statusesOf([]),
        lessonTypes,
      ),
    ).toBeUndefined();
  });
});

describe('ProgressService — use cases', () => {
  it('reports that a first-time learner needs onboarding', async () => {
    const service = new ProgressService(makeStore());

    await expect(service.needsOnboarding()).resolves.toBe(true);
  });

  it('saves the goal and marks onboarding done', async () => {
    const store = makeStore();
    const service = new ProgressService(store);

    await service.completeOnboarding(30);

    expect(store.saveSettings).toHaveBeenCalledWith({
      dailyGoalMinutes: 30,
      hasCompletedOnboarding: true,
      defaultAudioSpeed: 'normal',
      isPinyinVisible: true,
    });
    await expect(service.needsOnboarding()).resolves.toBe(false);
  });

  it('refuses an invalid goal without touching the store', async () => {
    const store = makeStore();
    const service = new ProgressService(store);

    await expect(service.completeOnboarding(45)).rejects.toThrow(
      'Mục tiêu mỗi ngày phải là 15, 30 hoặc 60 phút.',
    );
    expect(store.saveSettings).not.toHaveBeenCalled();
  });

  it('S3.1-AC2: should list only completed lessons as completed', async () => {
    const service = new ProgressService(
      makeStore(DEFAULT_SETTINGS, [
        { lessonId: 'intro-01', status: 'completed' },
        { lessonId: 'intro-02', status: 'in-progress' },
        { lessonId: 'intro-03', status: 'completed' },
      ]),
    );

    await expect(service.getCompletedLessonIds()).resolves.toEqual(
      new Set(['intro-01', 'intro-03']),
    );
  });
});
