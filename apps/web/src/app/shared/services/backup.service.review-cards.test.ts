import { describe, expect, it } from 'vitest';

import {
  PROGRESS_BACKUP_FORMAT,
  PROGRESS_BACKUP_FORMAT_VERSION,
  type ReviewCard,
} from '@csk/shared';

import { BackupService } from './backup.service';

const SCENARIO_BAD_CARD =
  'S9.1-AC1 (bổ sung) File có thẻ sai bị từ chối cả file';

const SETTINGS = {
  dailyGoalMinutes: 15,
  hasCompletedOnboarding: true,
  defaultAudioSpeed: 'normal',
  isPinyinVisible: true,
} as const;

/** Thẻ "mới" hợp lệ (design D2). */
const newCard = (wordId: string, facet: ReviewCard['facet']): ReviewCard => ({
  wordId,
  facet,
  state: 'new',
  due: Date.UTC(2026, 10, 23, 2),
  stability: 0,
  difficulty: 0,
  elapsedDays: 0,
  scheduledDays: 0,
  learningSteps: 0,
  reps: 0,
  lapses: 0,
});

/** Nội dung file v2 (design D6) với danh sách thẻ cho trước. */
const buildV2File = (cards: readonly unknown[]): Record<string, unknown> => ({
  format: PROGRESS_BACKUP_FORMAT,
  formatVersion: 2,
  exportedOn: '2026-11-23',
  settings: SETTINGS,
  lessonProgress: [{ lessonId: 's91-a', status: 'completed' }],
  dailyStats: [],
  cards,
  writtenCharacters: ['你'],
});

const withoutDue = (card: ReviewCard): Record<string, unknown> =>
  Object.fromEntries(Object.entries(card).filter(([key]) => key !== 'due'));

describe('BackupService.checkBackupText — file v2 có thẻ ôn tập', () => {
  it(`${SCENARIO_BAD_CARD}: file v2 hợp lệ → valid, giữ thẻ và chữ đã viết`, () => {
    const service = new BackupService();
    const cards = [newCard('你好', 'meaning'), newCard('你好', 'listening')];
    const file = buildV2File(cards);

    expect(service.checkBackupText(JSON.stringify(file))).toEqual({
      status: 'valid',
      file,
    });
  });

  it.each<[string, unknown]>([
    [
      'một thẻ có chiều "speaking"',
      { ...newCard('你好', 'listening'), facet: 'speaking' },
    ],
    ['một thẻ thiếu due', withoutDue(newCard('你好', 'listening'))],
  ])(`${SCENARIO_BAD_CARD}: %s → corrupted`, (_label, badCard) => {
    const service = new BackupService();
    const text = JSON.stringify(
      buildV2File([newCard('你好', 'meaning'), badCard]),
    );

    expect(service.checkBackupText(text)).toEqual({
      status: 'rejected',
      reason: 'corrupted',
    });
  });

  it(`${SCENARIO_BAD_CARD}: phiên bản hiện tại là 2, file phiên bản kế tiếp → newer-version`, () => {
    const service = new BackupService();
    const text = JSON.stringify({
      ...buildV2File([newCard('你好', 'meaning')]),
      formatVersion: PROGRESS_BACKUP_FORMAT_VERSION + 1,
    });

    expect(PROGRESS_BACKUP_FORMAT_VERSION).toBe(2);
    expect(service.checkBackupText(text)).toEqual({
      status: 'rejected',
      reason: 'newer-version',
    });
  });
});
