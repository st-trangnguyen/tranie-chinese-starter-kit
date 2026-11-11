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

export type AppDatabase = Dexie & {
  settings: EntityTable<SettingRow, 'key'>;
  lessonProgress: EntityTable<LessonProgressRow, 'lessonId'>;
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

  return db;
};
