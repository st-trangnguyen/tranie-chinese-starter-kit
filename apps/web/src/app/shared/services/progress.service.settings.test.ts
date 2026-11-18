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
