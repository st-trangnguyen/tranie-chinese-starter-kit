import {
  PROGRESS_BACKUP_FORMAT,
  PROGRESS_BACKUP_FORMAT_VERSION,
  progressBackupEnvelopeSchema,
  progressBackupV1Schema,
  type ProgressBackupFile,
  type ProgressSnapshot,
} from '@csk/shared';

import type { BackupCheck } from '@shared/models/progress-backup.model';

export class BackupService {
  // ── PHẦN 1 — TRUY CẬP DỮ LIỆU ─────────────────────────

  // ── PHẦN 2 — QUY TẮC NGHIỆP VỤ ───────────────────────

  // TODO(S8.5 task 4.2): skeleton RED, chưa có hành vi.
  public buildBackupFileName(now: number): string {
    void now;
    return '';
  }

  // TODO(S8.5 task 4.2): skeleton RED, chưa có hành vi.
  public buildBackupFile(
    snapshot: ProgressSnapshot,
    now: number,
  ): ProgressBackupFile {
    void now;
    return {
      ...snapshot,
      format: PROGRESS_BACKUP_FORMAT,
      formatVersion: PROGRESS_BACKUP_FORMAT_VERSION,
      exportedOn: '',
    };
  }

  // TODO(S8.5 task 4.2): skeleton RED, chưa có hành vi.
  public serializeBackupFile(file: ProgressBackupFile): string {
    void file;
    return '';
  }

  /** Rule: chỉ file JSON do app xuất, đúng định dạng và phiên bản, mới được nhập. */
  public checkBackupText(text: string): BackupCheck {
    if (text.trim() === '') {
      return { status: 'rejected', reason: 'not-backup' };
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { status: 'rejected', reason: 'not-backup' };
    }
    const envelope = progressBackupEnvelopeSchema.safeParse(parsed);
    if (!envelope.success) {
      return { status: 'rejected', reason: 'not-backup' };
    }
    if (envelope.data.formatVersion > PROGRESS_BACKUP_FORMAT_VERSION) {
      return { status: 'rejected', reason: 'newer-version' };
    }
    const file = progressBackupV1Schema.safeParse(parsed);
    if (!file.success) {
      return { status: 'rejected', reason: 'corrupted' };
    }
    return { status: 'valid', file: file.data };
  }

  // ── PHẦN 3 — USE CASES ───────────────────────────────
}
