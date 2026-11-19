import { describe, expect, it } from 'vitest';

import {
  createMachine,
  NOW,
  toBackupFileSource,
} from '@test/backup-machine.helpers';
import { toLocalDateKey } from '@shared/utils/date.utils';

import { ProgressService } from './progress.service';

describe('BackupService.inspectImportFile + importProgress', () => {
  it('S8.5-AC1 Xuất ở máy này, nhập ở máy khác thì có đúng tiến độ: máy B có đúng bài đã xong, vị trí đang học và lựa chọn của máy A', async () => {
    const machineA = createMachine();
    const progressA = new ProgressService(machineA.store);
    await machineA.store.saveLessonProgress({
      lessonId: 'intro-01',
      status: 'completed',
    });
    await machineA.store.saveLessonProgress({
      lessonId: 'intro-02',
      status: 'completed',
    });
    await machineA.store.saveLessonProgress({
      lessonId: 'intro-03',
      status: 'in-progress',
      cursor: 3,
    });
    await progressA.completeOnboarding(30);
    await progressA.changeDefaultAudioSpeed('slow');
    await machineA.backup.exportProgress(NOW);
    const exported = machineA.savedFiles[0]?.content ?? '';

    const machineB = createMachine();
    const progressB = new ProgressService(machineB.store);
    await progressB.completeOnboarding(15);

    const inspection = await machineB.backup.inspectImportFile(
      toBackupFileSource(exported),
    );
    expect(inspection).toMatchObject({
      status: 'valid',
      preview: { completedLessonCount: 2 },
    });
    if (inspection.status !== 'valid') {
      return;
    }
    await machineB.backup.importProgress(inspection.snapshot);

    expect(await progressB.getCompletedLessonIds()).toEqual(
      new Set(['intro-01', 'intro-02']),
    );
    const inProgress = await machineB.store.getLessonProgress('intro-03');
    expect(inProgress?.cursor).toBe(3);
    expect(await progressB.getLearningPreferences()).toMatchObject({
      dailyGoalMinutes: 30,
      defaultAudioSpeed: 'slow',
    });
  });

  it('S8.5-AC1 File có lựa chọn hiện pinyin: máy A tắt hiện pinyin, máy B đang bật, nhập file của A thì máy B tắt', async () => {
    const machineA = createMachine();
    const progressA = new ProgressService(machineA.store);
    await progressA.completeOnboarding(15);
    await progressA.changePinyinVisibility(false);
    await machineA.backup.exportProgress(NOW);
    const exported = machineA.savedFiles[0]?.content ?? '';

    const machineB = createMachine();
    const progressB = new ProgressService(machineB.store);
    await progressB.completeOnboarding(15);
    expect((await progressB.getLearningPreferences()).isPinyinVisible).toBe(
      true,
    );

    const inspection = await machineB.backup.inspectImportFile(
      toBackupFileSource(exported),
    );
    expect(inspection.status).toBe('valid');
    if (inspection.status !== 'valid') {
      return;
    }
    await machineB.backup.importProgress(inspection.snapshot);

    expect((await progressB.getLearningPreferences()).isPinyinVisible).toBe(
      false,
    );
  });

  it('S8.5-AC1 File có số phút đã học từng ngày: máy A học 12 phút hôm nay với mục tiêu 15, nhập ở máy B cùng ngày thì hiện 12 / 15 phút', async () => {
    const machineA = createMachine();
    const progressA = new ProgressService(machineA.store);
    await progressA.completeOnboarding(15);
    await machineA.store.addStudySeconds(toLocalDateKey(NOW), 720);
    await machineA.backup.exportProgress(NOW);
    const exported = machineA.savedFiles[0]?.content ?? '';

    const machineB = createMachine();
    const progressB = new ProgressService(machineB.store);
    await progressB.completeOnboarding(30);

    const inspection = await machineB.backup.inspectImportFile(
      toBackupFileSource(exported),
    );
    expect(inspection.status).toBe('valid');
    if (inspection.status !== 'valid') {
      return;
    }
    await machineB.backup.importProgress(inspection.snapshot);

    expect(await progressB.getTodayStudy(NOW)).toMatchObject({
      minutes: 12,
      goalMinutes: 15,
    });
  });
});
