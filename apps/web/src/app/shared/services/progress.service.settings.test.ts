import { describe, expect, it, vi } from 'vitest';

import { createDatabase } from '@core/helpers/db.helper';
import { DexieProgressStore } from '@core/services/progress-store.service';

import { ProgressService } from './progress.service';

const createStore = () =>
  new DexieProgressStore(createDatabase(`test-${crypto.randomUUID()}`));

/** DB của người học đã xong onboarding với mục tiêu 30 phút. */
const createOnboardedStore = async () => {
  const store = createStore();
  await new ProgressService(store).completeOnboarding(30);
  return store;
};

describe('ProgressService — đổi mục tiêu mỗi ngày', () => {
  it('S8.2-AC1 Đổi mục tiêu không hiện lại onboarding: lưu 60 phút, onboarding vẫn xong', async () => {
    const store = await createOnboardedStore();
    const service = new ProgressService(store);

    await service.changeDailyGoal(60);

    const reopened = new ProgressService(store);
    expect(await reopened.needsOnboarding()).toBe(false);
    expect((await reopened.getLearningPreferences()).dailyGoalMinutes).toBe(60);
  });

  it('S8.2-AC1 Đổi mục tiêu không hiện lại onboarding: mục tiêu sai thì từ chối và không ghi', async () => {
    const store = await createOnboardedStore();
    const service = new ProgressService(store);
    const saveSpy = vi.spyOn(store, 'saveSettings');

    await expect(service.changeDailyGoal(45)).rejects.toThrow(
      'Mục tiêu mỗi ngày phải là 15, 30 hoặc 60 phút.',
    );

    expect(saveSpy).not.toHaveBeenCalled();
    expect((await store.getSettings()).dailyGoalMinutes).toBe(30);
  });

  it('S8.2-AC1 Đổi mục tiêu không hiện lại onboarding: chỉ ghi khóa mục tiêu, không đọc rồi ghi đè', async () => {
    const store = createStore();
    vi.spyOn(store, 'getSettings').mockRejectedValue(new Error('read failed'));
    const saveSpy = vi.spyOn(store, 'saveSettings');
    const service = new ProgressService(store);

    await service.changeDailyGoal(30);

    expect(saveSpy.mock.calls).toStrictEqual([[{ dailyGoalMinutes: 30 }]]);
  });
});

describe('ProgressService — tốc độ audio mặc định', () => {
  it.each([
    ['normal', true],
    ['slow', true],
    ['fast', false],
    ['', false],
    ['0.75', false],
  ])(
    'S8.2-AC2 Tốc độ mặc định giữ sau khi mở lại app: isValidAudioSpeed(%j) là %s',
    (value, isValid) => {
      const service = new ProgressService(createStore());

      expect(service.isValidAudioSpeed(value)).toBe(isValid);
    },
  );

  it('S8.2-AC2 Tốc độ mặc định giữ sau khi mở lại app: chọn Chậm, mở lại vẫn là Chậm', async () => {
    const dbName = `test-${crypto.randomUUID()}`;
    await new ProgressService(
      new DexieProgressStore(createDatabase(dbName)),
    ).changeDefaultAudioSpeed('slow');

    const reopened = new ProgressService(
      new DexieProgressStore(createDatabase(dbName)),
    );
    expect((await reopened.getLearningPreferences()).defaultAudioSpeed).toBe(
      'slow',
    );
  });

  it('S8.2-AC2 Tốc độ mặc định giữ sau khi mở lại app: tốc độ sai thì từ chối và không ghi', async () => {
    const store = await createOnboardedStore();
    const service = new ProgressService(store);
    const saveSpy = vi.spyOn(store, 'saveSettings');

    await expect(service.changeDefaultAudioSpeed('fast')).rejects.toThrow(
      'Tốc độ audio mặc định phải là bình thường hoặc chậm.',
    );

    expect(saveSpy).not.toHaveBeenCalled();
    expect((await store.getSettings()).defaultAudioSpeed).toBe('normal');
  });
});

describe('ProgressService — hiện pinyin', () => {
  const openService = (dbName: string) =>
    new ProgressService(new DexieProgressStore(createDatabase(dbName)));

  it('S8.2-AC3 Tùy chọn pinyin giữ sau khi mở lại app: tắt pinyin, mở lại vẫn tắt; bật lại, mở lại thì bật', async () => {
    const dbName = `test-${crypto.randomUUID()}`;

    await openService(dbName).changePinyinVisibility(false);
    expect(
      (await openService(dbName).getLearningPreferences()).isPinyinVisible,
    ).toBe(false);

    await openService(dbName).changePinyinVisibility(true);
    expect(
      (await openService(dbName).getLearningPreferences()).isPinyinVisible,
    ).toBe(true);
  });

  it('S8.2-AC3 Tùy chọn pinyin giữ sau khi mở lại app: chỉ ghi khóa pinyin, giữ mục tiêu đã lưu', async () => {
    const store = await createOnboardedStore();
    const saveSpy = vi.spyOn(store, 'saveSettings');

    await new ProgressService(store).changePinyinVisibility(false);

    expect(saveSpy.mock.calls).toStrictEqual([[{ isPinyinVisible: false }]]);
    const preferences = await new ProgressService(
      store,
    ).getLearningPreferences();
    expect(preferences.dailyGoalMinutes).toBe(30);
    expect(preferences.isPinyinVisible).toBe(false);
  });
});
