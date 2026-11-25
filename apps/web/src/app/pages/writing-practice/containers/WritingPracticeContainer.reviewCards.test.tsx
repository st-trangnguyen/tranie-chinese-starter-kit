import { describe, expect, it, vi } from 'vitest';

import { createDatabase } from '@core/helpers/db.helper';
import { progressStore } from '@core/services/progress-store.service';
import { SrsService } from '@shared/services/srs.service';
import {
  PERSON,
  installLessonStrokeWriteFetch,
} from '@test/lesson-stroke-write.helpers';
import { FakeHanziWriter } from '@test/mocks/hanzi-writer';
import { act, screen, waitFor } from '@test/render';
import { openRoute, setupStrokeOrderRoute } from '@test/stroke-order-route';

// Ranh giới ngoài: thư viện vẽ/chấm nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

setupStrokeOrderRoute();

const NOW = Date.UTC(2026, 10, 25, 8, 30);

/** Xoá mọi bảng của IndexedDB thật (fake-indexeddb) của app. */
const clearDatabase = async (): Promise<void> => {
  const db = createDatabase();
  await Promise.all(db.tables.map((table) => table.clear()));
  db.close();
};

/** Người học đã làm xong bài có từ 人: đã có thẻ 人 chiều nghĩa và chiều nghe. */
const seedLearnedPerson = async (): Promise<void> => {
  const srs = new SrsService();
  await progressStore.addNewCards([
    srs.createNewCard(PERSON, 'meaning', NOW),
    srs.createNewCard(PERSON, 'listening', NOW),
  ]);
};

/** Mở màn luyện viết của 人, chờ khung viết hiện và quiz của writer kích hoạt. */
const openPersonPadWithActiveQuiz = async (): Promise<FakeHanziWriter> => {
  openRoute(`/characters/${encodeURIComponent(PERSON)}/writing-practice`);
  await screen.findByRole(
    'figure',
    { name: `Khung viết chữ ${PERSON}` },
    { timeout: 3000 },
  );
  await waitFor(() => expect(FakeHanziWriter.last().isQuizActive).toBe(true));
  return FakeHanziWriter.last();
};

describe('WritingPracticeContainer — thẻ chiều viết (S9.1)', () => {
  it('S9.1-AC2 Viết xong chữ của từ đã học thì tạo thẻ chiều viết: should record 人 as written and create a new 人 writing card after writing every stroke of 人 on /characters/人/writing-practice', async () => {
    await clearDatabase();
    // Nội dung thật cho từ 人 (words.json) + file nét thật (人 có 2 nét).
    installLessonStrokeWriteFetch();
    await seedLearnedPerson();
    expect(await progressStore.getWrittenCharacters()).toEqual([]);

    const writer = await openPersonPadWithActiveQuiz();

    act(() => writer.emitCorrectStroke());
    act(() => writer.emitCorrectStroke());

    // Màn báo đã viết xong chữ.
    expect(
      await screen.findByRole('status', {}, { timeout: 3000 }),
    ).toHaveTextContent(`Đã viết xong chữ ${PERSON}.`);

    // Chữ 人 được ghi là đã viết, và có thẻ 人 chiều viết ở trạng thái "mới".
    await waitFor(async () => {
      expect(await progressStore.getWrittenCharacters()).toEqual([PERSON]);
    });
    await waitFor(async () => {
      const writingCards = (await progressStore.getAllCards()).filter(
        (card) => card.wordId === PERSON && card.facet === 'writing',
      );
      expect(writingCards).toHaveLength(1);
      expect(writingCards[0]?.state).toBe('new');
    });
  });
});
