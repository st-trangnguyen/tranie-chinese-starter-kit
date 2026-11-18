import Dexie from 'dexie';
import {
  DEFAULT_SETTINGS,
  type LessonProgress,
  type Settings,
} from '@csk/shared';

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
      defaultAudioSpeed: 'normal',
      isPinyinVisible: true,
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

describe('DexieProgressStore — saveSettings(patch)', () => {
  const STORED_SETTINGS: Settings = {
    hasCompletedOnboarding: true,
    dailyGoalMinutes: 30,
    defaultAudioSpeed: 'slow',
    isPinyinVisible: false,
  };

  const makeSeededStores = async () => {
    const name = `test-${crypto.randomUUID()}`;
    const db = createDatabase(name);
    await db.settings.bulkPut(
      Object.entries(STORED_SETTINGS).map(([key, value]) => ({ key, value })),
    );
    return {
      db,
      storeA: new DexieProgressStore(db),
      openStoreB: () => new DexieProgressStore(createDatabase(name)),
    };
  };

  it('S8.2-AC1: should write only the given key and keep the other settings', async () => {
    const { storeA, openStoreB } = await makeSeededStores();

    await storeA.saveSettings({ dailyGoalMinutes: 60 });

    await expect(openStoreB().getSettings()).resolves.toEqual({
      hasCompletedOnboarding: true,
      dailyGoalMinutes: 60,
      defaultAudioSpeed: 'slow',
      isPinyinVisible: false,
    });
  });

  it('S8.2-AC1: should skip keys whose value is undefined', async () => {
    const { db, storeA, openStoreB } = await makeSeededStores();

    await storeA.saveSettings({
      dailyGoalMinutes: 15,
      isPinyinVisible: undefined,
    });

    await expect(openStoreB().getSettings()).resolves.toEqual({
      hasCompletedOnboarding: true,
      dailyGoalMinutes: 15,
      defaultAudioSpeed: 'slow',
      isPinyinVisible: false,
    });
    const rows = await db.settings.toArray();
    expect(rows.filter((row) => row.value === undefined)).toEqual([]);
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

describe('DexieProgressStore — saveLessonProgressBatch', () => {
  it('S3.6-AC2: should write every row of the batch', async () => {
    const { store } = makeStore();

    await store.saveLessonProgressBatch([
      { lessonId: 'intro-01', status: 'completed' },
      { lessonId: 'intro-02', status: 'completed' },
      { lessonId: 'intro-03', status: 'completed' },
    ]);

    await expect(store.getAllLessonProgress()).resolves.toEqual([
      { lessonId: 'intro-01', status: 'completed' },
      { lessonId: 'intro-02', status: 'completed' },
      { lessonId: 'intro-03', status: 'completed' },
    ]);
  });

  it('S3.6-AC2: should write no row when one row fails (atomic)', async () => {
    const { store } = makeStore();
    // Hàm không structured-clone được → IndexedDB từ chối dòng này.
    const unwritable = {
      lessonId: 'intro-02',
      status: 'completed',
      cursor: () => 1,
    } as unknown as LessonProgress;

    await expect(
      store.saveLessonProgressBatch([
        { lessonId: 'intro-01', status: 'completed' },
        unwritable,
        { lessonId: 'intro-03', status: 'completed' },
      ]),
    ).rejects.toThrow();

    await expect(store.getAllLessonProgress()).resolves.toEqual([]);
  });
});
