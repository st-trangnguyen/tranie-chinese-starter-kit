import type { BackupCheck } from '@shared/models/progress-backup.model';

export class BackupService {
  // ── PHẦN 1 — TRUY CẬP DỮ LIỆU ─────────────────────────

  // ── PHẦN 2 — QUY TẮC NGHIỆP VỤ ───────────────────────

  /** Rule: chỉ file JSON do app xuất, đúng định dạng và phiên bản, mới được nhập. */
  public checkBackupText(text: string): BackupCheck {
    return { status: 'valid', file: text };
  }

  // ── PHẦN 3 — USE CASES ───────────────────────────────
}
