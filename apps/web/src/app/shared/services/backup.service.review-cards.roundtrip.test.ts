import { describe, expect, it } from 'vitest';

import type { ReviewCard } from '@csk/shared';

import {
  createMachine,
  NOW,
  toBackupFileSource,
} from '@test/backup-machine.helpers';

import { ProgressService } from './progress.service';

const SCENARIO_ROUNDTRIP =
  'S9.1-AC1 (bổ sung) Xuất rồi nhập ở máy khác vẫn còn thẻ';

/** Thẻ chiều nghĩa đã ôn: trạng thái, lịch ôn và độ khó khác hẳn thẻ mới. */
const REVIEWED_MEANING_CARD: ReviewCard = {
  wordId: '你好',
  facet: 'meaning',
  state: 'review',
  due: Date.UTC(2026, 10, 27, 3),
  stability: 4.93,
  difficulty: 5.12,
  elapsedDays: 3,
  scheduledDays: 5,
  learningSteps: 0,
  reps: 3,
  lapses: 1,
  lastReview: Date.UTC(2026, 10, 22, 3),
};

/** Thẻ chiều nghe vừa tạo. */
const NEW_LISTENING_CARD: ReviewCard = {
  wordId: '你好',
  facet: 'listening',
  state: 'new',
  due: Date.UTC(2026, 10, 17, 3),
  stability: 0,
  difficulty: 0,
  elapsedDays: 0,
  scheduledDays: 0,
  learningSteps: 0,
  reps: 0,
  lapses: 0,
};

const byCardKey = (cards: readonly ReviewCard[]): ReviewCard[] =>
  cards.toSorted((a, b) =>
    `${a.wordId}:${a.facet}`.localeCompare(`${b.wordId}:${b.facet}`),
  );

describe('BackupService — xuất rồi nhập thẻ ôn tập giữa hai máy', () => {
  it(`${SCENARIO_ROUNDTRIP}: file xuất ở máy A có đúng 2 thẻ 你好 với đủ field`, async () => {
    const machineA = createMachine();
    await new ProgressService(machineA.store).completeOnboarding(15);
    await machineA.store.addNewCards([
      REVIEWED_MEANING_CARD,
      NEW_LISTENING_CARD,
    ]);

    await machineA.backup.exportProgress(NOW);

    expect(machineA.savedFiles).toHaveLength(1);
    const check = machineA.backup.checkBackupText(
      machineA.savedFiles[0]?.content ?? '',
    );
    expect(check.status).toBe('valid');
    if (check.status !== 'valid') {
      return;
    }
    expect(byCardKey(check.file.cards)).toEqual(
      byCardKey([REVIEWED_MEANING_CARD, NEW_LISTENING_CARD]),
    );
  });

  it(`${SCENARIO_ROUNDTRIP}: máy B chưa có thẻ nhập file của máy A → có đúng các thẻ của máy A`, async () => {
    const machineA = createMachine();
    await new ProgressService(machineA.store).completeOnboarding(15);
    await machineA.store.addNewCards([
      REVIEWED_MEANING_CARD,
      NEW_LISTENING_CARD,
    ]);
    await machineA.backup.exportProgress(NOW);
    const content = machineA.savedFiles[0]?.content ?? '';

    const machineB = createMachine();
    await new ProgressService(machineB.store).completeOnboarding(15);
    expect(await machineB.store.getAllCards()).toEqual([]);

    const inspection = await machineB.backup.inspectImportFile(
      toBackupFileSource(content),
    );
    expect(inspection.status).toBe('valid');
    if (inspection.status !== 'valid') {
      return;
    }
    await machineB.backup.importProgress(inspection.snapshot);

    const cardsOnA = await machineA.store.getAllCards();
    expect(byCardKey(cardsOnA)).toEqual(
      byCardKey([REVIEWED_MEANING_CARD, NEW_LISTENING_CARD]),
    );
    expect(byCardKey(await machineB.store.getAllCards())).toEqual(
      byCardKey(cardsOnA),
    );
  });
});
