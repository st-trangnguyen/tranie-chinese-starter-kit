import { describe, expect, it } from 'vitest';

import type { Lesson, ReviewCard } from '@csk/shared';

import {
  createMachine,
  NOW,
  toBackupFileSource,
} from '@test/backup-machine.helpers';
import { makeSource } from '@test/content-service.fixtures';
import { finishedSession } from '@test/srs-lesson.helpers';

import { ProgressService } from './progress.service';
import { SrsService } from './srs.service';

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

const SCENARIO_WRITING_ROUNDTRIP =
  'S9.1-AC2 (bổ sung) Xuất rồi nhập vẫn còn thẻ chiều viết và chữ đã viết';

/** Thẻ chiều viết của 人 ở máy A. */
const PERSON_WRITING_CARD: ReviewCard = {
  wordId: '人',
  facet: 'writing',
  state: 'new',
  due: Date.UTC(2026, 10, 16, 3),
  stability: 0,
  difficulty: 0,
  elapsedDays: 0,
  scheduledDays: 0,
  learningSteps: 0,
  reps: 0,
  lapses: 0,
};

/** Bài học chỉ có từ 你好. */
const HELLO_LESSON: Lesson = {
  id: 'xin-chao',
  type: 'lesson',
  title: 'Xin chào',
  exercises: [{ id: 'h1', kind: 'tone-choice', wordId: '你好' }],
};

const cardKeysOf = (cards: readonly ReviewCard[]): string[] =>
  cards.map((card) => `${card.wordId}:${card.facet}`).sort();

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

  it(`${SCENARIO_WRITING_ROUNDTRIP}: máy B nhập file của máy A (thẻ 人 chiều viết, chữ 人 và 你) → có thẻ 人 chiều viết; xong bài 你好 rồi viết 好 → có thẻ 你好 chiều viết`, async () => {
    const machineA = createMachine();
    await new ProgressService(machineA.store).completeOnboarding(15);
    await machineA.store.addNewCards([PERSON_WRITING_CARD]);
    await machineA.store.addWrittenCharacter('人');
    await machineA.store.addWrittenCharacter('你');
    await machineA.backup.exportProgress(NOW);
    const content = machineA.savedFiles[0]?.content ?? '';

    const machineB = createMachine();
    await new ProgressService(machineB.store).completeOnboarding(15);
    const inspection = await machineB.backup.inspectImportFile(
      toBackupFileSource(content),
    );
    expect(inspection.status).toBe('valid');
    if (inspection.status !== 'valid') {
      return;
    }
    await machineB.backup.importProgress(inspection.snapshot);

    expect(cardKeysOf(await machineB.store.getAllCards())).toEqual([
      '人:writing',
    ]);
    expect((await machineB.store.getWrittenCharacters()).toSorted()).toEqual(
      ['人', '你'].toSorted(),
    );

    const srsOnB = new SrsService(machineB.store, makeSource());
    await srsOnB.createCardsForFinishedLesson(
      HELLO_LESSON,
      finishedSession(['h1']),
      NOW + 60_000,
    );
    await srsOnB.recordCharacterWriting(
      { character: '好', isGuided: true },
      NOW + 120_000,
    );

    expect(cardKeysOf(await machineB.store.getAllCards())).toEqual(
      [
        '人:writing',
        '你好:listening',
        '你好:meaning',
        '你好:writing',
      ].toSorted(),
    );
  });
});
