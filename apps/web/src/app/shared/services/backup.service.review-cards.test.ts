import { describe, expect, it } from 'vitest';

import {
  PROGRESS_BACKUP_FORMAT,
  PROGRESS_BACKUP_FORMAT_VERSION,
  type ReviewCard,
} from '@csk/shared';

import {
  createMachine,
  toBackupFileSource,
} from '@test/backup-machine.helpers';

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

const SCENARIO_DUPLICATE_CARD =
  'S9.1-AC1 (bổ sung) File có hai thẻ trùng bị từ chối cả file';

describe('BackupService.checkBackupText — file v2 có thẻ trùng', () => {
  it(`${SCENARIO_DUPLICATE_CARD}: hai thẻ 你好 chiều nghĩa (khác state) → corrupted`, () => {
    const service = new BackupService();
    const duplicateCard: ReviewCard = {
      ...newCard('你好', 'meaning'),
      state: 'review',
      reps: 1,
    };
    const text = JSON.stringify(
      buildV2File([newCard('你好', 'meaning'), duplicateCard]),
    );

    expect(service.checkBackupText(text)).toEqual({
      status: 'rejected',
      reason: 'corrupted',
    });
  });

  it(`${SCENARIO_DUPLICATE_CARD}: 你好 chiều nghĩa và chiều nghe → valid`, () => {
    const service = new BackupService();
    const file = buildV2File([
      newCard('你好', 'meaning'),
      newCard('你好', 'listening'),
    ]);

    expect(service.checkBackupText(JSON.stringify(file))).toEqual({
      status: 'valid',
      file,
    });
  });
});

const SCENARIO_DUPLICATE_CHARACTER =
  'S9.1-AC2 (bổ sung) File có chữ đã viết trùng bị từ chối cả file';

const buildV2FileWithCharacters = (
  writtenCharacters: readonly unknown[],
): Record<string, unknown> => ({
  ...buildV2File([newCard('你好', 'meaning'), newCard('你好', 'listening')]),
  writtenCharacters,
});

describe('BackupService.checkBackupText — file v2 có chữ đã viết trùng', () => {
  it.each<[string, readonly string[]]>([
    ['chữ 你 xuất hiện hai lần', ['你', '你']],
    ["mục không phải một chữ Hán ('ab')", ['ab']],
  ])(
    `${SCENARIO_DUPLICATE_CHARACTER}: %s → corrupted`,
    (_label, characters) => {
      const service = new BackupService();
      const text = JSON.stringify(buildV2FileWithCharacters(characters));

      expect(service.checkBackupText(text)).toEqual({
        status: 'rejected',
        reason: 'corrupted',
      });
    },
  );

  it(`${SCENARIO_DUPLICATE_CHARACTER}: chữ 你 và 好 → valid`, () => {
    const service = new BackupService();
    const file = buildV2FileWithCharacters(['你', '好']);

    expect(service.checkBackupText(JSON.stringify(file))).toEqual({
      status: 'valid',
      file,
    });
  });
});

const SCENARIO_OLD_FILE = 'S9.1-AC1 (bổ sung) Nhập file sao lưu bản cũ';

/** File do bản app trước S9.1 xuất (version 1): không có thẻ, không có chữ đã viết. */
const V1_FILE = {
  format: PROGRESS_BACKUP_FORMAT,
  formatVersion: 1,
  exportedOn: '2026-11-20',
  settings: SETTINGS,
  lessonProgress: [{ lessonId: 's91-a', status: 'completed' }],
  dailyStats: [],
} as const;

describe('BackupService — nhập file sao lưu bản cũ (version 1)', () => {
  it(`${SCENARIO_OLD_FILE}: file v1 hợp lệ → valid, không có thẻ và chữ đã viết`, () => {
    const service = new BackupService();

    const check = service.checkBackupText(JSON.stringify(V1_FILE));

    expect(check).toMatchObject({
      status: 'valid',
      file: { lessonProgress: V1_FILE.lessonProgress },
    });
    if (check.status !== 'valid') {
      return;
    }
    expect(check.file.cards).toEqual([]);
    expect(check.file.writtenCharacters).toEqual([]);
  });

  it(`${SCENARIO_OLD_FILE}: máy có thẻ 谢谢 và chữ 人, nhập file v1 → không còn thẻ, chữ; bài s91-a đã xong`, async () => {
    const machineB = createMachine();
    await machineB.store.addNewCards([
      newCard('谢谢', 'meaning'),
      newCard('谢谢', 'listening'),
    ]);
    await machineB.store.addWrittenCharacter('人');
    expect(await machineB.store.getAllCards()).toHaveLength(2);

    const inspection = await machineB.backup.inspectImportFile(
      toBackupFileSource(JSON.stringify(V1_FILE)),
    );
    expect(inspection.status).toBe('valid');
    if (inspection.status !== 'valid') {
      return;
    }
    await machineB.backup.importProgress(inspection.snapshot);

    expect(await machineB.store.getAllCards()).toEqual([]);
    expect(await machineB.store.getWrittenCharacters()).toEqual([]);
    expect(await machineB.store.getLessonProgress('s91-a')).toMatchObject({
      status: 'completed',
    });
  });
});
