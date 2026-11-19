import { progressBackupEnvelopeSchema } from '@csk/shared';

import type { BackupCheck } from '@shared/models/progress-backup.model';

export class BackupService {
  // ── PHẦN 1 — TRUY CẬP DỮ LIỆU ─────────────────────────

  // ── PHẦN 2 — QUY TẮC NGHIỆP VỤ ───────────────────────

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
    if (!progressBackupEnvelopeSchema.safeParse(parsed).success) {
      return { status: 'rejected', reason: 'not-backup' };
    }
    return { status: 'valid', file: parsed };
  }

  // ── PHẦN 3 — USE CASES ───────────────────────────────
}
