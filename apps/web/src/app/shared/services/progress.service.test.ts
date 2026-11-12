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
