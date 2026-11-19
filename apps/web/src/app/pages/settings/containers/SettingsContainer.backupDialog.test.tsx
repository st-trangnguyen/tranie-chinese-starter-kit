import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createDatabase } from '@core/helpers/db.helper';
import { renderWithProviders, screen, within } from '@test/render';

import SettingsContainer from './SettingsContainer';

/** File mẫu e2e của S8.5 (design D10), dùng lại ở tầng component. */
const FIXTURE_DIR = join(
  __dirname,
  '../../../../../e2e/E8/fixtures/progress-backup',
);

/** Câu cảnh báo nguyên văn spec (Requirement "Hỏi xác nhận rồi ghi đè toàn bộ tiến độ"). */
const OVERWRITE_WARNING =
  'Toàn bộ tiến độ hiện có trên máy này sẽ bị thay bằng tiến độ trong file. Không hoàn tác được.';

/** Tạo `File` từ file mẫu, như khi người học chọn file trong hộp chọn file. */
const fixtureFile = (name: string): File =>
  new File([readFileSync(join(FIXTURE_DIR, name))], name, {
    type: 'application/json',
  });

/** Xoá dữ liệu cũ trong IndexedDB thật (fake-indexeddb) của app: cả ba bảng. */
const clearDatabase = async (): Promise<void> => {
  const db = createDatabase();
  await db.settings.clear();
  await db.lessonProgress.clear();
  await db.dailyStats.clear();
  db.close();
};

/** Máy đang có bài 1 "Đã xong". */
const seedFirstLessonCompleted = async (): Promise<void> => {
  const db = createDatabase();
  await db.lessonProgress.put({ lessonId: 'intro-01', status: 'completed' });
  db.close();
};

/** Mã các bài đã có tiến độ trong IndexedDB. */
const readLessonIds = async (): Promise<string[]> => {
  const db = createDatabase();
  const rows = await db.lessonProgress.toArray();
  db.close();
  return rows.map((row) => row.lessonId).sort();
};

/** Input chọn file của mục Sao lưu (ẩn, nút "Nhập tiến độ" mở nó). */
const getFileInput = (section: HTMLElement): HTMLInputElement => {
  const input = section.querySelector('input[type="file"]');
  expect(input).toBeInstanceOf(HTMLInputElement);
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('Mục Sao lưu tiến độ chưa có input chọn file');
  }
  return input;
};

const renderBackupSection = async () => {
  const { user } = renderWithProviders(<SettingsContainer />, {
    route: '/settings',
  });
  const section = await screen.findByRole('region', {
    name: 'Sao lưu tiến độ',
  });
  return { user, section };
};

describe('SettingsContainer — hộp xác nhận nhập tiến độ', () => {
  beforeEach(async () => {
    await clearDatabase();
    await seedFirstLessonCompleted();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('S8.5-AC3 File hợp lệ thì hiện hộp xác nhận: nêu ngày xuất, số bài đã xong, câu cảnh báo, nút "Ghi đè" và "Hủy"; tiến độ trên máy chưa đổi', async () => {
    const { user, section } = await renderBackupSection();

    await user.upload(getFileInput(section), fixtureFile('hop-le-5-bai.json'));

    const dialog = await screen.findByRole('dialog', {
      name: 'Nhập tiến độ từ file?',
    });
    expect(dialog).toHaveTextContent('17/11/2026');
    expect(dialog).toHaveTextContent('5 bài đã xong');
    expect(dialog).toHaveTextContent(OVERWRITE_WARNING);
    expect(
      within(dialog).getByRole('button', { name: 'Ghi đè' }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: 'Hủy' }),
    ).toBeInTheDocument();

    // Hộp đang mở: chưa ghi gì.
    expect(await readLessonIds()).toEqual(['intro-01']);
    expect(within(section).getByRole('alert')).toBeEmptyDOMElement();
  });
});
