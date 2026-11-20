import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import {
  createMachine,
  NOW,
  ROOT,
  toBackupFileSource,
} from '@test/backup-machine.helpers';
import { previousLocalDateKey, toLocalDateKey } from '@shared/utils/date.utils';

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

  it('S8.5-AC1 File có chủ đề đã qua bằng kiểm tra vượt cấp: máy A xong bài 1 và đạt kiểm tra vượt cấp chủ đề C, nhập ở máy B thì chủ đề C đã xong, chủ đề D mở, chủ đề B vẫn khóa', async () => {
    const machineA = createMachine();
    const progressA = new ProgressService(machineA.store);
    await progressA.completeOnboarding(15);
    await Promise.all(
      ['intro-01', 'intro-05', 'intro-06'].map((lessonId) =>
        machineA.store.saveLessonProgress({ lessonId, status: 'completed' }),
      ),
    );
    await machineA.backup.exportProgress(NOW);
    const exported = machineA.savedFiles[0]?.content ?? '';

    const machineB = createMachine();
    const progressB = new ProgressService(machineB.store);
    await progressB.completeOnboarding(15);

    const inspection = await machineB.backup.inspectImportFile(
      toBackupFileSource(exported),
    );
    expect(inspection.status).toBe('valid');
    if (inspection.status !== 'valid') {
      return;
    }
    await machineB.backup.importProgress(inspection.snapshot);

    const statuses = progressB.deriveLessonStatuses(
      ROOT.stages,
      await progressB.getCompletedLessonIds(),
    );
    expect(Object.fromEntries(statuses)).toMatchObject({
      'intro-01': 'completed',
      'intro-03': 'locked',
      'intro-04': 'locked',
      'intro-05': 'completed',
      'intro-06': 'completed',
      'intro-07': 'open',
    });
  });

  it('S8.5-AC1 Chuỗi ngày học giữ đúng nhờ mục tiêu của từng ngày: máy A hôm qua học 20 phút với mục tiêu 15, hôm nay đổi sang 30 và chưa học, nhập ở máy B cùng ngày thì chuỗi vẫn 1 ngày', async () => {
    const machineA = createMachine();
    const progressA = new ProgressService(machineA.store);
    await progressA.completeOnboarding(15);
    const yesterday = previousLocalDateKey(toLocalDateKey(NOW));
    await machineA.store.addStudySeconds(yesterday, 1200);
    await progressA.changeDailyGoal(30, NOW);
    expect(await progressA.getStudyStreak(NOW)).toBe(1);
    await machineA.backup.exportProgress(NOW);
    const exported = machineA.savedFiles[0]?.content ?? '';

    const machineB = createMachine();
    const progressB = new ProgressService(machineB.store);
    await progressB.completeOnboarding(15);

    const inspection = await machineB.backup.inspectImportFile(
      toBackupFileSource(exported),
    );
    expect(inspection.status).toBe('valid');
    if (inspection.status !== 'valid') {
      return;
    }
    await machineB.backup.importProgress(inspection.snapshot);

    expect(await progressB.getStudyStreak(NOW)).toBe(1);
    expect((await progressB.getLearningPreferences()).dailyGoalMinutes).toBe(
      30,
    );
  });
});

describe('BackupService — file lớn hơn 20 MB', () => {
  it.each([
    ['20 000 001 byte → quá lớn', 20_000_001, true],
    ['đúng 20 000 000 byte → vẫn đọc', 20_000_000, false],
    ['0 byte → vẫn đọc', 0, false],
  ])(
    'S8.5-AC2 File lớn hơn 20 MB bị từ chối: %s',
    (_label, bytes, isTooLarge) => {
      const { backup } = createMachine();
      expect(backup.isBackupFileTooLarge(bytes)).toBe(isTooLarge);
    },
  );

  it('S8.5-AC2 File lớn hơn 20 MB bị từ chối: không đọc nội dung file, báo not-backup, máy vẫn có bài 1 đã xong', async () => {
    const machine = createMachine();
    const progress = new ProgressService(machine.store);
    await progress.completeOnboarding(15);
    await machine.store.saveLessonProgress({
      lessonId: 'intro-01',
      status: 'completed',
    });
    // Nội dung là file sao lưu hợp lệ: chỉ kích thước mới làm file bị từ chối.
    await machine.backup.exportProgress(NOW);
    const exported = machine.savedFiles[0]?.content ?? '';
    const text = vi.fn(async () => exported);

    const inspection = await machine.backup.inspectImportFile({
      size: 20_000_001,
      text,
    });

    expect(inspection).toEqual({ status: 'rejected', reason: 'not-backup' });
    expect(text).not.toHaveBeenCalled();
    expect(await progress.getCompletedLessonIds()).toEqual(
      new Set(['intro-01']),
    );
  });
});

describe('BackupService — không đọc được nội dung file', () => {
  it('S8.5-AC2 File không phải JSON bị từ chối: đọc nội dung file lỗi thì báo not-backup, máy vẫn có bài 1 đã xong', async () => {
    const machine = createMachine();
    const progress = new ProgressService(machine.store);
    await progress.completeOnboarding(15);
    await machine.store.saveLessonProgress({
      lessonId: 'intro-01',
      status: 'completed',
    });

    const inspecting = machine.backup.inspectImportFile({
      size: 1_024,
      text: () => Promise.reject(new Error('NotReadableError')),
    });

    await expect(inspecting).resolves.toEqual({
      status: 'rejected',
      reason: 'not-backup',
    });
    expect(await progress.getCompletedLessonIds()).toEqual(
      new Set(['intro-01']),
    );
  });
});

describe('BackupService — ghi đè bằng file', () => {
  it('S8.5-AC3 Ghi đè thì tiến độ đúng bằng file: máy có bài 1–6 xong, mục tiêu 60, nhập file bài 1–3 xong, mục tiêu 15', async () => {
    const machine = createMachine();
    const progress = new ProgressService(machine.store);
    await progress.completeOnboarding(60);
    await Promise.all(
      ['01', '02', '03', '04', '05', '06'].map((n) =>
        machine.store.saveLessonProgress({
          lessonId: `intro-${n}`,
          status: 'completed',
        }),
      ),
    );
    // File mẫu e2e (design D10): bài 1–3 xong, mục tiêu 15 phút.
    const fileText = readFileSync(
      join(
        __dirname,
        '../../../../e2e/E8/fixtures/progress-backup/hop-le-3-bai-15-phut.json',
      ),
      'utf8',
    );

    const inspection = await machine.backup.inspectImportFile(
      toBackupFileSource(fileText),
    );
    expect(inspection.status).toBe('valid');
    if (inspection.status !== 'valid') {
      return;
    }
    await machine.backup.importProgress(inspection.snapshot);

    const completed = await progress.getCompletedLessonIds();
    expect(completed).toEqual(new Set(['intro-01', 'intro-02', 'intro-03']));
    const statuses = progress.deriveLessonStatuses(ROOT.stages, completed);
    expect(Object.fromEntries(statuses)).toMatchObject({
      'intro-04': 'open',
      'intro-05': 'locked',
      'intro-06': 'locked',
    });
    expect((await progress.getLearningPreferences()).dailyGoalMinutes).toBe(15);
  });
});

describe('BackupService — ghi đè bị lỗi', () => {
  it('S8.5-AC3 Ghi lỗi giữa chừng thì giữ nguyên tiến độ cũ: ghi lỗi thì reject với lỗi rõ nghĩa, giữ lỗi gốc làm cause', async () => {
    const machineA = createMachine();
    await new ProgressService(machineA.store).completeOnboarding(15);
    await Promise.all(
      ['01', '02', '03', '04', '05'].map((n) =>
        machineA.store.saveLessonProgress({
          lessonId: `intro-${n}`,
          status: 'completed',
        }),
      ),
    );
    await machineA.backup.exportProgress(NOW);
    const exported = machineA.savedFiles[0]?.content ?? '';

    const machine = createMachine();
    await new ProgressService(machine.store).completeOnboarding(60);
    const inspection = await machine.backup.inspectImportFile(
      toBackupFileSource(exported),
    );
    expect(inspection.status).toBe('valid');
    if (inspection.status !== 'valid') {
      return;
    }
    const writeError = new Error('QuotaExceededError: ghi bị lỗi giữa chừng');
    vi.spyOn(machine.store, 'importAll').mockRejectedValue(writeError);

    const importing = machine.backup.importProgress(inspection.snapshot);

    await expect(importing).rejects.toThrow(
      new Error('Không ghi được tiến độ đã nhập.'),
    );
    await expect(importing).rejects.toMatchObject({ cause: writeError });
  });
});
