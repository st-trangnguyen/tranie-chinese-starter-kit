import { describe, expect, it } from 'vitest';

import {
  PROGRESS_BACKUP_FORMAT,
  progressBackupV2Schema,
} from './progress-backup.schema';

/** Phần v1 của file: bài 2 đã xong, đủ bốn field cài đặt. */
const buildValidV1Part = (): Record<string, unknown> => ({
  format: PROGRESS_BACKUP_FORMAT,
  exportedOn: '2026-11-17',
  settings: {
    dailyGoalMinutes: 30,
    hasCompletedOnboarding: true,
    defaultAudioSpeed: 'slow',
    isPinyinVisible: false,
  },
  lessonProgress: [{ lessonId: 'intro-02', status: 'completed' }],
  dailyStats: [{ date: '2026-11-17', studySeconds: 720, goalMinutes: 15 }],
});
const SCENARIO_BAD_CARD =
  'S9.1-AC1 (bổ sung) File có thẻ sai bị từ chối cả file';

/** Thẻ "mới" hợp lệ (design D2). */
const buildNewCard = (
  wordId: string,
  facet: string,
): Record<string, unknown> => ({
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

/** File v2 hợp lệ: bài 2 đã xong, thẻ 你好 chiều nghĩa và nghe, chữ 你 đã viết. */
const buildValidV2File = (
  cards: readonly Record<string, unknown>[] = [
    buildNewCard('你好', 'meaning'),
    buildNewCard('你好', 'listening'),
  ],
): Record<string, unknown> => ({
  ...buildValidV1Part(),
  formatVersion: 2,
  cards,
  writtenCharacters: ['你'],
});

const withoutDue = (card: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(card).filter(([key]) => key !== 'due'));

describe('progressBackupV2Schema — thẻ ôn tập trong file', () => {
  it(`${SCENARIO_BAD_CARD}: file v2 đủ hợp lệ thì qua, giữ thẻ và chữ đã viết`, () => {
    const result = progressBackupV2Schema.safeParse(buildValidV2File());

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      formatVersion: 2,
      cards: [
        buildNewCard('你好', 'meaning'),
        buildNewCard('你好', 'listening'),
      ],
      writtenCharacters: ['你'],
    });
  });

  it.each<[string, Record<string, unknown>]>([
    ['một thẻ có chiều "speaking"', buildNewCard('你好', 'speaking')],
    ['một thẻ thiếu due', withoutDue(buildNewCard('你好', 'listening'))],
  ])(`${SCENARIO_BAD_CARD}: %s → cả file bị từ chối`, (_label, badCard) => {
    const goodCard = buildNewCard('你好', 'meaning');

    expect(
      progressBackupV2Schema.safeParse(buildValidV2File([goodCard])).success,
    ).toBe(true);
    expect(
      progressBackupV2Schema.safeParse(buildValidV2File([goodCard, badCard]))
        .success,
    ).toBe(false);
  });
});

const SCENARIO_DUPLICATE_CARD =
  'S9.1-AC1 (bổ sung) File có hai thẻ trùng bị từ chối cả file';

describe('progressBackupV2Schema — thẻ trùng trong file', () => {
  it(`${SCENARIO_DUPLICATE_CARD}: hai thẻ 你好 chiều nghĩa (khác state) → cả file bị từ chối`, () => {
    const duplicateCard = {
      ...buildNewCard('你好', 'meaning'),
      state: 'review',
      reps: 1,
    };

    expect(
      progressBackupV2Schema.safeParse(
        buildValidV2File([buildNewCard('你好', 'meaning'), duplicateCard]),
      ).success,
    ).toBe(false);
  });

  it(`${SCENARIO_DUPLICATE_CARD}: 你好 chiều nghĩa và chiều nghe không trùng → qua`, () => {
    expect(
      progressBackupV2Schema.safeParse(
        buildValidV2File([
          buildNewCard('你好', 'meaning'),
          buildNewCard('你好', 'listening'),
        ]),
      ).success,
    ).toBe(true);
  });
});

const SCENARIO_DUPLICATE_CHARACTER =
  'S9.1-AC2 (bổ sung) File có chữ đã viết trùng bị từ chối cả file';

const buildV2FileWithCharacters = (
  writtenCharacters: readonly unknown[],
): Record<string, unknown> => ({
  ...buildValidV2File(),
  writtenCharacters,
});

describe('progressBackupV2Schema — chữ đã viết trùng trong file', () => {
  it(`${SCENARIO_DUPLICATE_CHARACTER}: chữ 你 xuất hiện hai lần → cả file bị từ chối`, () => {
    expect(
      progressBackupV2Schema.safeParse(buildV2FileWithCharacters(['你', '你']))
        .success,
    ).toBe(false);
  });

  it(`${SCENARIO_DUPLICATE_CHARACTER}: 你 và 好 không trùng → qua`, () => {
    expect(
      progressBackupV2Schema.safeParse(buildV2FileWithCharacters(['你', '好']))
        .success,
    ).toBe(true);
  });

  it(`${SCENARIO_DUPLICATE_CHARACTER}: mục không phải một chữ Hán ('ab') → cả file bị từ chối`, () => {
    expect(
      progressBackupV2Schema.safeParse(buildV2FileWithCharacters(['ab']))
        .success,
    ).toBe(false);
  });
});
