import { vi } from 'vitest';

import type { ContentRoot } from '@csk/shared';

import { createDatabase } from '@core/helpers/db.helper';
import type { ContentSource } from '@core/services/content-source.service';
import type { FileSaver } from '@core/services/file-saver.service';
import { DexieProgressStore } from '@core/services/progress-store.service';
import type { BackupFileSource } from '@shared/models/progress-backup.model';

import { BackupService } from '@shared/services/backup.service';

/** Lộ trình 4 chủ đề của design D10: A (01, 02), B (03, 04), C (05, 06), D (07, 08). */
export const ROOT: ContentRoot = {
  contentVersion: '0123456789ab',
  stages: [
    {
      id: 'intro',
      title: 'Nhập môn',
      units: [
        {
          id: 'unit-a',
          title: 'Chủ đề A',
          lessonIds: ['intro-01', 'intro-02'],
        },
        {
          id: 'unit-b',
          title: 'Chủ đề B',
          lessonIds: ['intro-03', 'intro-04'],
        },
        {
          id: 'unit-c',
          title: 'Chủ đề C',
          lessonIds: ['intro-05', 'intro-06'],
        },
        {
          id: 'unit-d',
          title: 'Chủ đề D',
          lessonIds: ['intro-07', 'intro-08'],
        },
      ],
    },
  ],
};

const notUsed = (): Promise<never> =>
  Promise.reject(new Error('Sao lưu không cần nạp nội dung này.'));

const createContentSource = (): ContentSource => ({
  getContentRoot: vi.fn(async () => ROOT),
  getLesson: vi.fn(notUsed),
  getWords: vi.fn(notUsed),
  getSentences: vi.fn(notUsed),
  getStrokeIndex: vi.fn(notUsed),
  getStrokeData: vi.fn(notUsed),
  getAudioIndex: vi.fn(notUsed),
});

export interface SavedFile {
  fileName: string;
  content: string;
}

/** Ranh giới trình duyệt: ghi nhận file được đưa cho trình duyệt thay vì tải xuống thật. */
const createFileSaver = () => {
  const savedFiles: SavedFile[] = [];
  const saver: FileSaver = {
    save: (fileName, content) => {
      savedFiles.push({ fileName, content });
    },
  };
  return { saver, savedFiles };
};

export interface Machine {
  store: DexieProgressStore;
  backup: BackupService;
  savedFiles: SavedFile[];
}

/** Một máy: IndexedDB riêng (tên ngẫu nhiên). */
export const createMachine = (): Machine => {
  const store = new DexieProgressStore(
    createDatabase(`test-${crypto.randomUUID()}`),
  );
  const { saver, savedFiles } = createFileSaver();
  const backup = new BackupService(store, createContentSource(), saver);
  return { store, backup, savedFiles };
};

/** 10:00 sáng 17/11/2026 theo giờ máy. */
export const NOW = new Date(2026, 10, 17, 10).getTime();

/** File người học chọn để nhập, dựng từ nội dung đã xuất (`File` thật chỉ cần `size` và `text()`). */
export const toBackupFileSource = (content: string): BackupFileSource => ({
  size: new TextEncoder().encode(content).byteLength,
  text: async () => content,
});
