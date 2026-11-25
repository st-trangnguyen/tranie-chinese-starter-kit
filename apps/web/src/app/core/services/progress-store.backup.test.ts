import type { LessonProgress, ProgressSnapshot, ReviewCard } from '@csk/shared';

import { createDatabase } from '@core/helpers/db.helper';
import {
  DexieProgressStore,
  type ProgressStore,
} from './progress-store.service';

const TODAY = '2026-11-18';

const openStore = () => {
  const db = createDatabase(`test-${crypto.randomUUID()}`);
  const store: ProgressStore = new DexieProgressStore(db);
  return { db, store };
};

const completed = (lessonId: string): LessonProgress => ({
  lessonId,
  status: 'completed',
});

const SCENARIO_OVERWRITE_STUDY_TIME =
  'S8.5-AC3 Ghi đè xóa số phút học mà file không có';
const SCENARIO_WRITE_FAILS =
  'S8.5-AC3 Ghi lỗi giữa chừng thì giữ nguyên tiến độ cũ';
const SCENARIO_EXPORT_KEEPS_PROGRESS = 'S8.5-AC1 Xuất không làm đổi tiến độ';
const YESTERDAY = '2026-11-17';

describe('DexieProgressStore — sao lưu tiến độ (S8.5)', () => {
  it(`${SCENARIO_OVERWRITE_STUDY_TIME}: ghi đè thay toàn bộ ba bảng, ngày không có trong file bị xóa`, async () => {
    const { db, store } = openStore();
    await store.saveSettings({
      dailyGoalMinutes: 60,
      hasCompletedOnboarding: true,
      defaultAudioSpeed: 'normal',
      isPinyinVisible: true,
    });
    await store.saveLessonProgressBatch(
      [
        'intro-01',
        'intro-02',
        'intro-03',
        'intro-04',
        'intro-05',
        'intro-06',
      ].map(completed),
    );
    await db.dailyStats.put({
      date: TODAY,
      studySeconds: 1200,
      goalMinutes: 60,
    });

    const snapshot: ProgressSnapshot = {
      settings: {
        dailyGoalMinutes: 15,
        hasCompletedOnboarding: true,
        defaultAudioSpeed: 'slow',
        isPinyinVisible: false,
      },
      lessonProgress: ['intro-01', 'intro-02', 'intro-03'].map(completed),
      dailyStats: [],
      cards: [],
      writtenCharacters: [],
    };

    await store.importAll(snapshot);

    await expect(store.getDailyStat(TODAY)).resolves.toBeUndefined();
    await expect(store.getAllDailyStats()).resolves.toEqual([]);
    const lessonProgress = await store.getAllLessonProgress();
    expect(lessonProgress).toHaveLength(3);
    expect(lessonProgress).toEqual(
      expect.arrayContaining(
        ['intro-01', 'intro-02', 'intro-03'].map(completed),
      ),
    );
    await expect(store.getSettings()).resolves.toEqual(snapshot.settings);
  });
  it(`${SCENARIO_WRITE_FAILS}: một bước ghi lỗi thì cả ba bảng giữ nguyên dữ liệu cũ`, async () => {
    const { db, store } = openStore();
    const oldSettings = {
      dailyGoalMinutes: 30,
      hasCompletedOnboarding: true,
      defaultAudioSpeed: 'normal',
      isPinyinVisible: true,
    } as const;
    await store.saveSettings(oldSettings);
    await store.saveLessonProgressBatch([completed('intro-01')]);
    const oldDailyStat = { date: TODAY, studySeconds: 600, goalMinutes: 30 };
    await db.dailyStats.put(oldDailyStat);

    vi.spyOn(db.lessonProgress, 'bulkPut').mockRejectedValueOnce(
      new Error('ghi lỗi'),
    );

    const snapshot: ProgressSnapshot = {
      settings: {
        dailyGoalMinutes: 15,
        hasCompletedOnboarding: true,
        defaultAudioSpeed: 'slow',
        isPinyinVisible: false,
      },
      lessonProgress: [
        'intro-01',
        'intro-02',
        'intro-03',
        'intro-04',
        'intro-05',
      ].map(completed),
      dailyStats: [],
      cards: [],
      writtenCharacters: [],
    };

    await expect(store.importAll(snapshot)).rejects.toThrow();

    await expect(store.getSettings()).resolves.toEqual(oldSettings);
    await expect(store.getAllLessonProgress()).resolves.toEqual([
      completed('intro-01'),
    ]);
    await expect(store.getAllDailyStats()).resolves.toEqual([oldDailyStat]);
  });

  it(`${SCENARIO_EXPORT_KEEPS_PROGRESS}: trả đúng tiến độ hợp lệ và không đổi dữ liệu trong DB`, async () => {
    const { db, store } = openStore();
    const settings = {
      dailyGoalMinutes: 15,
      hasCompletedOnboarding: true,
      defaultAudioSpeed: 'slow',
      isPinyinVisible: false,
    } as const;
    await store.saveSettings(settings);
    const lesson1: LessonProgress = completed('intro-01');
    const lesson2: LessonProgress = {
      lessonId: 'intro-02',
      status: 'in-progress',
      cursor: 2,
    };
    await store.saveLessonProgressBatch([lesson1, lesson2]);
    await db.lessonProgress.put({ lessonId: 'intro-03', status: 'done' });
    const todayStat = { date: TODAY, studySeconds: 600, goalMinutes: 15 };
    const yesterdayStat = { date: YESTERDAY, studySeconds: 300 };
    await db.dailyStats.bulkPut([todayStat, yesterdayStat]);

    const readRaw = async () => ({
      settings: await db.settings.toArray(),
      lessonProgress: await db.lessonProgress.toArray(),
      dailyStats: await db.dailyStats.toArray(),
    });
    const rawBefore = await readRaw();

    const snapshot = await store.exportAll();

    expect(snapshot.settings).toEqual(settings);
    expect(snapshot.lessonProgress).toHaveLength(2);
    expect(snapshot.lessonProgress).toEqual(
      expect.arrayContaining([lesson1, lesson2]),
    );
    expect(snapshot.dailyStats).toHaveLength(2);
    expect(snapshot.dailyStats).toEqual(
      expect.arrayContaining([todayStat, yesterdayStat]),
    );
    const exportedYesterday = snapshot.dailyStats.find(
      (stat) => stat.date === YESTERDAY,
    );
    expect(exportedYesterday).toBeDefined();
    expect(exportedYesterday?.goalMinutes).toBeUndefined();

    const rawAfter = await readRaw();
    expect(rawAfter).toEqual(rawBefore);
    expect(rawAfter.lessonProgress).toHaveLength(3);
  });
});

const SCENARIO_OVERWRITE_CARDS = 'S9.1-AC1 (bổ sung) Nhập ghi đè thẻ trên máy';

const newCard = (wordId: string, facet: ReviewCard['facet']): ReviewCard => ({
  wordId,
  facet,
  state: 'new',
  due: Date.UTC(2026, 10, 18, 3),
  stability: 0,
  difficulty: 0,
  elapsedDays: 0,
  scheduledDays: 0,
  learningSteps: 0,
  reps: 0,
  lapses: 0,
});

describe('DexieProgressStore — ghi đè thẻ ôn tập (S9.1)', () => {
  it(`${SCENARIO_OVERWRITE_CARDS}: máy có thẻ 谢谢, nhập snapshot chỉ có 你好 → chỉ còn 2 thẻ 你好`, async () => {
    const { store } = openStore();
    await store.addNewCards([
      newCard('谢谢', 'meaning'),
      newCard('谢谢', 'listening'),
    ]);
    const helloCards = [
      newCard('你好', 'meaning'),
      newCard('你好', 'listening'),
    ];
    const snapshot: ProgressSnapshot = {
      settings: {
        dailyGoalMinutes: 15,
        hasCompletedOnboarding: true,
        defaultAudioSpeed: 'normal',
        isPinyinVisible: true,
      },
      lessonProgress: [],
      dailyStats: [],
      cards: helloCards,
      writtenCharacters: [],
    };

    await store.importAll(snapshot);

    const cards = await store.getAllCards();
    expect(cards).toHaveLength(2);
    expect(cards).toEqual(expect.arrayContaining(helloCards));
    expect(cards.some((card) => card.wordId === '谢谢')).toBe(false);
  });
});

const SCENARIO_WRITE_FAILS_KEEPS_CARDS =
  'S9.1-AC1 (bổ sung) Ghi lỗi giữa chừng thì giữ nguyên thẻ';

describe('DexieProgressStore — ghi lỗi giữ nguyên thẻ (S9.1)', () => {
  const OLD_SETTINGS = {
    dailyGoalMinutes: 30,
    hasCompletedOnboarding: true,
    defaultAudioSpeed: 'normal',
    isPinyinVisible: true,
  } as const;
  const thanksCards = [
    newCard('谢谢', 'meaning'),
    newCard('谢谢', 'listening'),
  ];
  const incoming: ProgressSnapshot = {
    settings: { ...OLD_SETTINGS, dailyGoalMinutes: 15 },
    lessonProgress: ['intro-01', 'intro-02'].map(completed),
    dailyStats: [],
    cards: [newCard('你好', 'meaning'), newCard('你好', 'listening')],
    writtenCharacters: ['你'],
  };

  const seedMachineB = async () => {
    const opened = openStore();
    await opened.store.saveSettings(OLD_SETTINGS);
    await opened.store.saveLessonProgressBatch([completed('intro-09')]);
    await opened.store.addNewCards(thanksCards);
    await opened.store.addWrittenCharacter('人');
    return opened;
  };

  const expectUnchanged = async (store: ProgressStore) => {
    const cards = await store.getAllCards();
    expect(cards).toHaveLength(2);
    expect(cards).toEqual(expect.arrayContaining(thanksCards));
    await expect(store.getWrittenCharacters()).resolves.toEqual(['人']);
    await expect(store.getAllLessonProgress()).resolves.toEqual([
      completed('intro-09'),
    ]);
    await expect(store.getSettings()).resolves.toEqual(OLD_SETTINGS);
  };

  it(`${SCENARIO_WRITE_FAILS_KEEPS_CARDS}: ghi bảng thẻ lỗi thì thẻ 谢谢, chữ 人, tiến độ, cài đặt còn nguyên`, async () => {
    const { db, store } = await seedMachineB();
    const putSpy = vi
      .spyOn(db.cards, 'bulkPut')
      .mockRejectedValueOnce(new Error('ghi lỗi'));
    const addSpy = vi
      .spyOn(db.cards, 'bulkAdd')
      .mockRejectedValueOnce(new Error('ghi lỗi'));

    await expect(store.importAll(incoming)).rejects.toThrow();
    expect(putSpy.mock.calls.length + addSpy.mock.calls.length).toBe(1);

    await expectUnchanged(store);
  });

  it(`${SCENARIO_WRITE_FAILS_KEEPS_CARDS}: ghi tiến độ bài lỗi thì thẻ và chữ đã viết cũng còn nguyên`, async () => {
    const { db, store } = await seedMachineB();
    vi.spyOn(db.lessonProgress, 'bulkPut').mockRejectedValueOnce(
      new Error('ghi lỗi'),
    );

    await expect(store.importAll(incoming)).rejects.toThrow();

    await expectUnchanged(store);
  });
});
