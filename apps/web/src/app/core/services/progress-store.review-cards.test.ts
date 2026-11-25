import Dexie from 'dexie';

import type { CardFacet, ReviewCard } from '@csk/shared';

import { createDatabase } from '@core/helpers/db.helper';
import {
  DexieProgressStore,
  type ProgressStore,
} from './progress-store.service';

const SCENARIO = 'S9.1-AC1 Xong bài học thì tạo thẻ nghĩa và nghe';
const DUE = Date.UTC(2026, 10, 25, 8, 0, 0);

const newCard = (wordId: string, facet: CardFacet): ReviewCard => ({
  wordId,
  facet,
  state: 'new',
  due: DUE,
  stability: 0,
  difficulty: 0,
  elapsedDays: 0,
  scheduledDays: 0,
  learningSteps: 0,
  reps: 0,
  lapses: 0,
});

const LESSON_CARDS: ReviewCard[] = [
  newCard('你好', 'meaning'),
  newCard('你好', 'listening'),
  newCard('谢谢', 'meaning'),
  newCard('谢谢', 'listening'),
];

const byId = (a: ReviewCard, b: ReviewCard) =>
  `${a.wordId}:${a.facet}`.localeCompare(`${b.wordId}:${b.facet}`);

const openStore = () => {
  const db = createDatabase(`test-${crypto.randomUUID()}`);
  const store: ProgressStore = new DexieProgressStore(db);
  return { db, store };
};

const tableNames = (db: Dexie) => db.tables.map((table) => table.name);

describe('DexieProgressStore — thẻ ôn tập và chữ đã viết (S9.1)', () => {
  it(`${SCENARIO}: thêm 4 thẻ mới thì đọc lại đúng 4 thẻ như đầu vào`, async () => {
    const { store } = openStore();

    await store.addNewCards(LESSON_CARDS);

    const cards = await store.getAllCards();
    expect(cards).toHaveLength(4);
    // `toStrictEqual`: thẻ đọc ra không mang field `id` của dòng DB.
    expect([...cards].sort(byId)).toStrictEqual([...LESSON_CARDS].sort(byId));
  });

  it(`${SCENARIO}: dòng thẻ hỏng trong DB bị bỏ khi đọc, thẻ hợp lệ vẫn đọc được`, async () => {
    const { db, store } = openStore();
    expect(tableNames(db)).toContain('cards');
    await db.table('cards').bulkPut([
      { id: '你好:meaning', ...newCard('你好', 'meaning') },
      { id: '谢谢:speaking', ...newCard('谢谢', 'meaning'), facet: 'speaking' },
      {
        id: '好:meaning',
        wordId: '好',
        facet: 'meaning',
        state: 'new',
        due: DUE,
      },
    ]);

    await expect(store.getAllCards()).resolves.toStrictEqual([
      newCard('你好', 'meaning'),
    ]);
  });

  it(`${SCENARIO}: ghi nhận cùng một chữ hai lần thì chỉ có một chữ`, async () => {
    const { store } = openStore();

    await store.addWrittenCharacter('人');
    await store.addWrittenCharacter('人');

    await expect(store.getWrittenCharacters()).resolves.toEqual(['人']);
  });

  it(`${SCENARIO}: dòng chữ đã viết hỏng bị bỏ khi đọc`, async () => {
    const { db, store } = openStore();
    expect(tableNames(db)).toContain('writtenCharacters');
    await db
      .table('writtenCharacters')
      .bulkPut([{ character: '人' }, { character: 'ab' }]);

    await expect(store.getWrittenCharacters()).resolves.toEqual(['人']);
  });

  it(`${SCENARIO}: nâng DB version 3 lên version 4 giữ nguyên dữ liệu cũ, hai bảng mới rỗng`, async () => {
    const name = `test-${crypto.randomUUID()}`;
    const legacy = new Dexie(name);
    legacy.version(3).stores({
      settings: 'key',
      lessonProgress: 'lessonId',
      dailyStats: 'date',
    });
    const settingRow = { key: 'dailyGoalMinutes', value: 30 };
    const lessonRow = { lessonId: 'intro-01', status: 'completed' };
    const dailyRow = { date: '2026-11-24', studySeconds: 600, goalMinutes: 30 };
    await legacy.table('settings').put(settingRow);
    await legacy.table('lessonProgress').put(lessonRow);
    await legacy.table('dailyStats').put(dailyRow);
    legacy.close();

    const db = createDatabase(name);
    await db.open();

    expect(db.verno).toBe(4);
    expect(tableNames(db)).toEqual(
      expect.arrayContaining(['cards', 'writtenCharacters']),
    );
    await expect(db.table('cards').count()).resolves.toBe(0);
    await expect(db.table('writtenCharacters').count()).resolves.toBe(0);
    await expect(db.settings.toArray()).resolves.toEqual([settingRow]);
    await expect(db.lessonProgress.toArray()).resolves.toEqual([lessonRow]);
    await expect(db.dailyStats.toArray()).resolves.toEqual([dailyRow]);
  });
});

const RETAKE = 'S9.1-AC1 Làm lại bài đã xong không tạo trùng thẻ';
const REVIEW_DUE = Date.UTC(2026, 11, 2, 8, 0, 0);

const reviewedMeaning: ReviewCard = {
  ...newCard('你好', 'meaning'),
  state: 'review',
  due: REVIEW_DUE,
  stability: 3.2,
  difficulty: 5.1,
  scheduledDays: 7,
  learningSteps: 0,
  reps: 2,
  lastReview: Date.UTC(2026, 10, 25, 8, 0, 0),
};

describe('DexieProgressStore — không tạo trùng thẻ (S9.1)', () => {
  it(`${RETAKE}: thẻ đã có giữ nguyên trạng thái và lịch ôn, thẻ chưa có được thêm`, async () => {
    const { store } = openStore();
    await store.addNewCards([reviewedMeaning]);

    await store.addNewCards([
      newCard('你好', 'meaning'),
      newCard('你好', 'listening'),
    ]);

    const cards = await store.getAllCards();
    expect([...cards].sort(byId)).toStrictEqual(
      [newCard('你好', 'listening'), reviewedMeaning].sort(byId),
    );
  });

  it(`${RETAKE}: ghi thẻ lỗi thì reject và không thẻ nào được ghi`, async () => {
    const { db, store } = openStore();
    await store.addNewCards([reviewedMeaning]);
    const writeFailure = new Error('ghi thẻ lỗi');
    vi.spyOn(db.cards, 'bulkAdd').mockRejectedValueOnce(writeFailure);

    await expect(
      store.addNewCards([
        newCard('你好', 'meaning'),
        newCard('你好', 'listening'),
        newCard('谢谢', 'meaning'),
      ]),
    ).rejects.toThrow(writeFailure);

    await expect(store.getAllCards()).resolves.toStrictEqual([reviewedMeaning]);
  });
});
