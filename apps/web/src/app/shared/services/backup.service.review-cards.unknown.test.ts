import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import type { Lesson, ReviewCard } from '@csk/shared';

import {
  createMachine,
  NOW,
  toBackupFileSource,
  type Machine,
} from '@test/backup-machine.helpers';
import { makeSource } from '@test/content-service.fixtures';
import { finishedSession } from '@test/srs-lesson.helpers';

import { ProgressService } from './progress.service';
import { SrsService } from './srs.service';

/** File mẫu e2e của S9.1 (asset task 8.1, design D10). */
const FIXTURE_DIR = join(
  __dirname,
  '../../../../e2e/E9/fixtures/progress-backup',
);

/** Đọc file mẫu thành chữ, như `File.text()` trả về khi người học chọn file. */
const readFixture = (name: string): string =>
  readFileSync(join(FIXTURE_DIR, name), 'utf8');

const SCENARIO_UNKNOWN_WORD =
  'S9.1-AC1 (bổ sung) Thẻ của từ không có trong app vẫn nhập được';

const SCENARIO_UNKNOWN_CHARACTER =
  'S9.1-AC2 (bổ sung) Chữ đã viết không có trong app không tạo thẻ';

const SCENARIO_NO_STROKES =
  'S9.1-AC2 (bổ sung) Chữ đã viết không có dữ liệu nét vẫn nhập được và không tạo thẻ';

/** Bài K: chỉ có từ 杯 (chữ 杯 không có dữ liệu nét trong nội dung). */
const CUP_LESSON: Lesson = {
  id: 's91-k',
  type: 'lesson',
  title: 'Bài mẫu K',
  exercises: [
    { id: 'k1', kind: 'tone-choice', wordId: '杯' },
    { id: 'k2', kind: 'pinyin-type', wordId: '杯' },
  ],
};

const cardKeysOf = (cards: readonly ReviewCard[]): string[] =>
  cards.map((card) => `${card.wordId}:${card.facet}`).sort();

const byCardKey = (cards: readonly ReviewCard[]): ReviewCard[] =>
  cards.toSorted((a, b) =>
    `${a.wordId}:${a.facet}`.localeCompare(`${b.wordId}:${b.facet}`),
  );

/** Thẻ ghi trong file mẫu (đọc lại bằng chính `checkBackupText`). */
const cardsInFile = (machine: Machine, content: string): ReviewCard[] => {
  const check = machine.backup.checkBackupText(content);
  return check.status === 'valid' ? [...check.file.cards] : [];
};

/** Máy B đã qua onboarding, kiểm file rồi bấm "Ghi đè". */
const importOnNewMachine = async (content: string): Promise<Machine> => {
  const machine = createMachine();
  await new ProgressService(machine.store).completeOnboarding(15);
  const inspection = await machine.backup.inspectImportFile(
    toBackupFileSource(content),
  );
  expect(inspection.status).toBe('valid');
  if (inspection.status === 'valid') {
    await machine.backup.importProgress(inspection.snapshot);
  }
  return machine;
};

describe('BackupService — thẻ và chữ đã viết không có trong nội dung app', () => {
  it(`${SCENARIO_UNKNOWN_WORD}: file có thẻ 你好 nghĩa và thẻ 龘龘 nghĩa → kiểm hợp lệ, nhập xong có đúng 2 thẻ như file`, async () => {
    const content = readFixture('the-tu-la.json');

    const machine = await importOnNewMachine(content);

    const expected = cardsInFile(machine, content);
    expect(cardKeysOf(expected)).toEqual(['你好:meaning', '龘龘:meaning']);
    expect(byCardKey(await machine.store.getAllCards())).toEqual(
      byCardKey(expected),
    );
  });

  it(`${SCENARIO_UNKNOWN_CHARACTER}: file có bài 你好 xong, thẻ 你好 nghĩa + nghe, chữ đã viết 你 và 龘 → nhập xong không có thẻ 你好 chiều viết`, async () => {
    const machine = await importOnNewMachine(readFixture('chu-la.json'));

    expect(cardKeysOf(await machine.store.getAllCards())).toEqual([
      '你好:listening',
      '你好:meaning',
    ]);
    expect((await machine.store.getWrittenCharacters()).toSorted()).toEqual(
      ['你', '龘'].toSorted(),
    );
  });

  it(`${SCENARIO_NO_STROKES}: file có bài 杯 xong, thẻ 杯 nghĩa + nghe, chữ đã viết 杯 (không có dữ liệu nét) → nhập xong đúng 2 thẻ; xong lại bài 杯 vẫn 2 thẻ, chữ 杯 còn, xuất lại vẫn có thẻ và chữ 杯`, async () => {
    const content = readFixture('chu-khong-net.json');

    const machine = await importOnNewMachine(content);

    const expected = cardsInFile(machine, content);
    expect(cardKeysOf(expected)).toEqual(['杯:listening', '杯:meaning']);
    expect(byCardKey(await machine.store.getAllCards())).toEqual(
      byCardKey(expected),
    );

    await new SrsService(
      machine.store,
      makeSource(),
    ).createCardsForFinishedLesson(
      CUP_LESSON,
      finishedSession(['k1', 'k2']),
      NOW + 60_000,
    );

    expect(byCardKey(await machine.store.getAllCards())).toEqual(
      byCardKey(expected),
    );
    expect(await machine.store.getWrittenCharacters()).toEqual(['杯']);

    await machine.backup.exportProgress(NOW + 120_000);
    const reexported = machine.backup.checkBackupText(
      machine.savedFiles[0]?.content ?? '',
    );
    expect(reexported.status).toBe('valid');
    if (reexported.status !== 'valid') {
      return;
    }
    expect(cardKeysOf(reexported.file.cards)).toEqual([
      '杯:listening',
      '杯:meaning',
    ]);
    expect(reexported.file.writtenCharacters).toEqual(['杯']);
  });

  it(`${SCENARIO_UNKNOWN_WORD}: máy đã nhập thẻ 你好 nghĩa và 龘龘 nghĩa, xuất lại → file mới vẫn có thẻ 龘龘 nghĩa`, async () => {
    const machine = await importOnNewMachine(readFixture('the-tu-la.json'));

    await machine.backup.exportProgress(NOW);

    expect(machine.savedFiles).toHaveLength(1);
    const check = machine.backup.checkBackupText(
      machine.savedFiles[0]?.content ?? '',
    );
    expect(check.status).toBe('valid');
    if (check.status !== 'valid') {
      return;
    }
    expect(cardKeysOf(check.file.cards)).toEqual([
      '你好:meaning',
      '龘龘:meaning',
    ]);
  });
});
