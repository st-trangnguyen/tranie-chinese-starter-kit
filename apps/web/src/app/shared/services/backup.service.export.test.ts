import { describe, expect, it, vi } from 'vitest';

import { createMachine, NOW } from '@test/backup-machine.helpers';

import { ProgressService } from './progress.service';

describe('BackupService.exportProgress', () => {
  it('S8.5-AC1 Chưa học gì vẫn xuất được: lưu một file tên theo ngày, nội dung hợp lệ, chưa có bài và ngày học', async () => {
    const { store, backup, savedFiles } = createMachine();
    await new ProgressService(store).completeOnboarding(15);

    await backup.exportProgress(NOW);

    expect(savedFiles).toHaveLength(1);
    const [saved] = savedFiles;
    expect(saved?.fileName).toBe('tranie-tien-do-2026-11-17.json');
    const check = backup.checkBackupText(saved?.content ?? '');
    expect(check).toMatchObject({
      status: 'valid',
      file: { lessonProgress: [], dailyStats: [] },
    });
  });

  it('S8.5-AC1 Không đọc được tiến độ thì báo lỗi: reject với lỗi rõ nghĩa, không lưu file nào', async () => {
    const { store, backup, savedFiles } = createMachine();
    await new ProgressService(store).completeOnboarding(15);
    vi.spyOn(store, 'exportAll').mockRejectedValue(
      new Error('DatabaseClosedError: Database has been closed'),
    );

    await expect(backup.exportProgress(NOW)).rejects.toThrow(
      new Error('Không đọc được tiến độ để xuất.'),
    );
    expect(savedFiles).toHaveLength(0);
  });
});
