import {
  PROGRESS_BACKUP_FORMAT,
  PROGRESS_BACKUP_FORMAT_VERSION,
  progressBackupEnvelopeSchema,
  progressBackupV1Schema,
  type LessonProgress,
  type ProgressBackupFile,
  type ProgressSnapshot,
} from '@csk/shared';

import {
  contentSource,
  type ContentSource,
} from '@core/services/content-source.service';
import { fileSaver, type FileSaver } from '@core/services/file-saver.service';
import {
  progressStore,
  type ProgressStore,
} from '@core/services/progress-store.service';
import type {
  BackupCheck,
  BackupFileSource,
  ImportInspection,
} from '@shared/models/progress-backup.model';
import { toLocalDateKey } from '@shared/utils/date.utils';
import { listLessonIdsInOrder } from '@shared/utils/learning-path.utils';

export class BackupService {
  constructor(
    private readonly store: ProgressStore = progressStore,
    private readonly content: ContentSource = contentSource,
    private readonly saver: FileSaver = fileSaver,
  ) {}

  // ── PHẦN 1 — TRUY CẬP DỮ LIỆU ─────────────────────────

  private readSnapshot(): Promise<ProgressSnapshot> {
    return this.store.exportAll();
  }

  private writeSnapshot(snapshot: ProgressSnapshot): Promise<void> {
    return this.store.importAll(snapshot);
  }

  private async readKnownLessonIds(): Promise<ReadonlySet<string>> {
    const root = await this.content.getContentRoot();
    return new Set(listLessonIdsInOrder(root.stages));
  }

  private saveFile(fileName: string, text: string): void {
    this.saver.save(fileName, text, 'application/json');
  }

  // ── PHẦN 2 — QUY TẮC NGHIỆP VỤ ───────────────────────

  /** Rule: tên file sao lưu mang ngày xuất theo giờ máy, để người học nhận ra bản nào mới hơn. */
  public buildBackupFileName(now: number): string {
    return `tranie-tien-do-${toLocalDateKey(now)}.json`;
  }

  /** Rule: file sao lưu gắn định dạng, phiên bản hiện tại và ngày xuất (giờ máy) quanh tiến độ. */
  public buildBackupFile(
    snapshot: ProgressSnapshot,
    now: number,
  ): ProgressBackupFile {
    return {
      format: PROGRESS_BACKUP_FORMAT,
      formatVersion: PROGRESS_BACKUP_FORMAT_VERSION,
      exportedOn: toLocalDateKey(now),
      settings: snapshot.settings,
      lessonProgress: snapshot.lessonProgress,
      dailyStats: snapshot.dailyStats,
    };
  }

  /** Rule: file sao lưu là JSON thụt lề, người học mở bằng trình soạn thảo vẫn đọc được. */
  public serializeBackupFile(file: ProgressBackupFile): string {
    return JSON.stringify(file, null, 2);
  }

  // TODO(S8.5 task 6.16): skeleton RED, chưa có hành vi.
  public isBackupFileTooLarge(bytes: number): boolean {
    void bytes;
    return false;
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

  /**
   * Rule: số bài đã xong là số dòng `completed` của bài có trong nội dung app, kể cả bài qua bằng
   * kiểm tra vượt cấp (cũng lưu `completed`); bài không còn trong app không được đếm.
   */
  public countCompletedLessons(
    lessonProgress: readonly LessonProgress[],
    knownLessonIds: ReadonlySet<string>,
  ): number {
    return lessonProgress.filter(
      (progress) =>
        progress.status === 'completed' &&
        knownLessonIds.has(progress.lessonId),
    ).length;
  }

  // ── PHẦN 3 — USE CASES ───────────────────────────────

  /** Xuất toàn bộ tiến độ thành một file JSON tên theo ngày, đưa cho trình duyệt lưu xuống máy. */
  public async exportProgress(now: number = Date.now()): Promise<void> {
    let snapshot: ProgressSnapshot;
    try {
      snapshot = await this.readSnapshot();
    } catch (error) {
      throw new Error('Không đọc được tiến độ để xuất.', { cause: error });
    }
    const text = this.serializeBackupFile(this.buildBackupFile(snapshot, now));
    this.saveFile(this.buildBackupFileName(now), text);
  }

  /** Đọc file người học chọn, kiểm tra và dựng bản xem trước; không ghi gì vào máy. */
  public async inspectImportFile(
    file: BackupFileSource,
  ): Promise<ImportInspection> {
    const check = this.checkBackupText(await file.text());
    if (check.status === 'rejected') {
      return check;
    }
    const { exportedOn, settings, lessonProgress, dailyStats } = check.file;
    const knownLessonIds = await this.readKnownLessonIds();
    return {
      status: 'valid',
      snapshot: { settings, lessonProgress, dailyStats },
      preview: {
        exportedOn,
        completedLessonCount: this.countCompletedLessons(
          lessonProgress,
          knownLessonIds,
        ),
      },
    };
  }

  /** Ghi đè toàn bộ tiến độ trên máy bằng tiến độ từ file đã kiểm tra. */
  public importProgress(snapshot: ProgressSnapshot): Promise<void> {
    return this.writeSnapshot(snapshot);
  }
}
