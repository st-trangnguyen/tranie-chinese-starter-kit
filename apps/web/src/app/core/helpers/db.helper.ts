import Dexie, { type EntityTable } from 'dexie';

import { DB_NAME } from '@core/constants/db.constants';

/** Một dòng của bảng `settings`: giá trị chưa tin cậy, validate khi đọc. */
export interface SettingRow {
  key: string;
  value: unknown;
}

export type AppDatabase = Dexie & {
  settings: EntityTable<SettingRow, 'key'>;
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

  return db;
};
