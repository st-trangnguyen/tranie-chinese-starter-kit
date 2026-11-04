import { DEFAULT_SETTINGS, type Settings } from '@csk/shared';

import { createDatabase } from '@core/helpers/db.helper';
import { DexieProgressStore } from './progress-store.service';

const makeStore = () => {
  const db = createDatabase(`test-${crypto.randomUUID()}`);
  return { db, store: new DexieProgressStore(db) };
};

describe('DexieProgressStore', () => {
  it('returns default settings on a fresh database', async () => {
    const { store } = makeStore();

    await expect(store.getSettings()).resolves.toEqual(DEFAULT_SETTINGS);
  });

  it('round-trips saved settings', async () => {
    const { store } = makeStore();
    const settings: Settings = {
      dailyGoalMinutes: 30,
      hasCompletedOnboarding: true,
    };

    await store.saveSettings(settings);

    await expect(store.getSettings()).resolves.toEqual(settings);
  });

  it('falls back to defaults for corrupted rows', async () => {
    const { db, store } = makeStore();
    await db.settings.put({ key: 'dailyGoalMinutes', value: 'abc' });
    await db.settings.put({ key: 'hasCompletedOnboarding', value: true });

    await expect(store.getSettings()).resolves.toEqual({
      ...DEFAULT_SETTINGS,
      hasCompletedOnboarding: true,
    });
  });
});
