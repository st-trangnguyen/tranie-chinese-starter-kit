import { DEFAULT_SETTINGS, type Settings } from '@csk/shared';

import type { ProgressStore } from '@core/services/progress-store.service';
import { ProgressService } from './progress.service';

const makeStore = (initial: Settings = DEFAULT_SETTINGS) => {
  let saved = initial;
  const store: ProgressStore = {
    getSettings: vi.fn(async () => saved),
    saveSettings: vi.fn(async (settings: Settings) => {
      saved = settings;
    }),
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
});
