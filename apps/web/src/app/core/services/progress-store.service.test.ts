import Dexie from 'dexie';
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

describe('DexieProgressStore — lesson progress', () => {
  it('should return no lesson progress on a fresh database', async () => {
    const { store } = makeStore();

    await expect(store.getAllLessonProgress()).resolves.toEqual([]);
  });

  it('S3.1-AC2: should skip corrupted lesson progress rows', async () => {
    const { db, store } = makeStore();
    await db.lessonProgress.bulkPut([
      { lessonId: 'intro-01', status: 'completed' },
      { lessonId: 'intro-02', status: 'done' },
      { lessonId: 'intro-03', status: 'in-progress' },
    ]);

    await expect(store.getAllLessonProgress()).resolves.toEqual([
      { lessonId: 'intro-01', status: 'completed' },
      { lessonId: 'intro-03', status: 'in-progress' },
    ]);
  });

  it('should keep settings when upgrading a version 1 database', async () => {
    const name = `test-${crypto.randomUUID()}`;
    const legacy = new Dexie(name);
    legacy.version(1).stores({ settings: 'key' });
    await legacy.table('settings').put({ key: 'dailyGoalMinutes', value: 60 });
    legacy.close();

    const store = new DexieProgressStore(createDatabase(name));

    await expect(store.getSettings()).resolves.toEqual({
      ...DEFAULT_SETTINGS,
      dailyGoalMinutes: 60,
    });
    await expect(store.getAllLessonProgress()).resolves.toEqual([]);
  });
});
