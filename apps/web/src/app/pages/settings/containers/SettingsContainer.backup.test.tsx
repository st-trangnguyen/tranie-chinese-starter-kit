import { createDatabase } from '@core/helpers/db.helper';
import { renderWithProviders, screen, within } from '@test/render';

import SettingsContainer from './SettingsContainer';

/** Xoá dữ liệu cũ trong IndexedDB thật (fake-indexeddb) của app: cả ba bảng. */
const clearDatabase = async (): Promise<void> => {
  const db = createDatabase();
  await db.settings.clear();
  await db.lessonProgress.clear();
  await db.dailyStats.clear();
  db.close();
};

describe('SettingsContainer — mục Sao lưu tiến độ', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it('S8.5-AC1 Màn Cài đặt có mục Sao lưu tiến độ: tiêu đề, nút "Xuất tiến độ" và "Nhập tiến độ"', async () => {
    renderWithProviders(<SettingsContainer />, { route: '/settings' });

    const section = await screen.findByRole('region', {
      name: 'Sao lưu tiến độ',
    });
    expect(
      within(section).getByRole('heading', { name: 'Sao lưu tiến độ' }),
    ).toBeInTheDocument();
    expect(
      within(section).getByRole('button', { name: 'Xuất tiến độ' }),
    ).toBeEnabled();
    expect(
      within(section).getByRole('button', { name: 'Nhập tiến độ' }),
    ).toBeEnabled();
  });
});
