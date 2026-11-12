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

  it('S3.3-AC2: should return the saved lesson progress including cursor', async () => {
    const { db, store } = makeStore();
    await db.lessonProgress.put({
      lessonId: 'intro-01',
      status: 'in-progress',
      cursor: 2,
    });

    await expect(store.getLessonProgress('intro-01')).resolves.toEqual({
      lessonId: 'intro-01',
      status: 'in-progress',
      cursor: 2,
    });
  });

  it('S3.3-AC2: should return undefined when the lesson has no progress row', async () => {
    const { db, store } = makeStore();
    await db.lessonProgress.put({
      lessonId: 'intro-02',
      status: 'in-progress',
      cursor: 1,
    });

    await expect(store.getLessonProgress('intro-01')).resolves.toBeUndefined();
  });

  it('S3.3-AC2: should return undefined when the lesson progress row is corrupted', async () => {
    const { db, store } = makeStore();
    await db.lessonProgress.put({
      lessonId: 'intro-01',
      status: 'done',
      cursor: 1,
    });

    await expect(store.getLessonProgress('intro-01')).resolves.toBeUndefined();
  });

  it('S3.3-X2: should keep completed status when the stored cursor is corrupted', async () => {
    const { db, store } = makeStore();
    await db.lessonProgress.put({
      lessonId: 'intro-01',
      status: 'completed',
      cursor: -3,
    });

    await expect(store.getLessonProgress('intro-01')).resolves.toEqual({
      lessonId: 'intro-01',
      status: 'completed',
    });
  });

  it('S3.3-AC1: should read back lesson progress after saving it', async () => {
    const { store } = makeStore();

    await store.saveLessonProgress({
      lessonId: 'intro-01',
      status: 'in-progress',
      cursor: 3,
    });

    await expect(store.getLessonProgress('intro-01')).resolves.toEqual({
      lessonId: 'intro-01',
      status: 'in-progress',
      cursor: 3,
    });
  });

  it('S3.3-AC1: should overwrite the row of the same lesson and leave other lessons alone', async () => {
    const { store } = makeStore();
    await store.saveLessonProgress({
      lessonId: 'intro-01',
      status: 'in-progress',
      cursor: 1,
    });
    await store.saveLessonProgress({
      lessonId: 'intro-02',
      status: 'in-progress',
      cursor: 4,
    });

    await store.saveLessonProgress({
      lessonId: 'intro-01',
      status: 'in-progress',
      cursor: 2,
    });

    await expect(store.getLessonProgress('intro-01')).resolves.toMatchObject({
      cursor: 2,
    });
    await expect(store.getLessonProgress('intro-02')).resolves.toMatchObject({
      cursor: 4,
    });
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
