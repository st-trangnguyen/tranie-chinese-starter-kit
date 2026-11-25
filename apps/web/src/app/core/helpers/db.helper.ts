import Dexie, { type EntityTable } from 'dexie';

import { DB_NAME } from '@core/constants/db.constants';

/** Một dòng của bảng `settings`: giá trị chưa tin cậy, validate khi đọc. */
export interface SettingRow {
  key: string;
  value: unknown;
}

/** Một dòng của bảng `lessonProgress`: chưa tin cậy, validate khi đọc. */
export interface LessonProgressRow {
  lessonId: string;
  [field: string]: unknown;
}

/**
 * Một dòng của bảng `dailyStats`: chưa tin cậy, validate khi đọc.
 * Field dự kiến: `studySeconds` (S8.1) và `goalMinutes` (S8.3, mục tiêu của ngày đó;
 * không phải index nên không cần `db.version` mới, dòng cũ thiếu field này).
 */
export interface DailyStatRow {
  date: string;
  [field: string]: unknown;
}

/**
 * Một dòng của bảng `cards`: `id` = `reviewCardId(wordId, facet)`.
 * Chưa tin cậy, validate khi đọc.
 */
export interface CardRow {
  id: string;
  [field: string]: unknown;
}

/**
 * Một dòng của bảng `writtenCharacters`: một chữ Hán đã viết xong.
 * Chưa tin cậy, validate khi đọc.
 */
export interface WrittenCharacterRow {
  character: string;
  [field: string]: unknown;
}

export type AppDatabase = Dexie & {
  settings: EntityTable<SettingRow, 'key'>;
  lessonProgress: EntityTable<LessonProgressRow, 'lessonId'>;
  dailyStats: EntityTable<DailyStatRow, 'date'>;
  cards: EntityTable<CardRow, 'id'>;
  writtenCharacters: EntityTable<WrittenCharacterRow, 'character'>;
};

/**
 * Schema IndexedDB. Thêm bảng hoặc đổi index = thêm `db.version(n)` mới,
 * không sửa version cũ (Dexie dựa vào đó để migrate).
 */
export const createDatabase = (name: string = DB_NAME): AppDatabase => {
  const db = new Dexie(name) as AppDatabase;

  db.version(1).stores({
    settings: 'key',
  });
  db.version(2).stores({
    settings: 'key',
    lessonProgress: 'lessonId',
  });
  db.version(3).stores({
    settings: 'key',
    lessonProgress: 'lessonId',
    dailyStats: 'date',
  });
  // S9.1: hai bảng mới, không đụng dữ liệu cũ nên không cần `upgrade`. Index `due` cho S9.2.
  db.version(4).stores({
    settings: 'key',
    lessonProgress: 'lessonId',
    dailyStats: 'date',
    cards: 'id, due',
    writtenCharacters: 'character',
  });

  return db;
};
