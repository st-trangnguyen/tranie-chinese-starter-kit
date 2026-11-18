import { createDatabase } from '@core/helpers/db.helper';
import { renderWithProviders, screen, within } from '@test/render';

import SettingsContainer from './SettingsContainer';

/** Xoá dữ liệu cũ trong IndexedDB thật (fake-indexeddb) của app. */
const clearDatabase = async (): Promise<void> => {
  const db = createDatabase();
  await db.settings.clear();
  await db.lessonProgress.clear();
  db.close();
};

/** Ghi thô vào bảng `settings`, bỏ qua validate, như dữ liệu cũ hoặc bị sửa tay. */
const writeRawSettings = async (
  rows: ReadonlyArray<{ key: string; value: unknown }>,
): Promise<void> => {
  const db = createDatabase();
  await db.settings.bulkPut([...rows]);
  db.close();
};

describe('SettingsContainer — dữ liệu lưu bị hỏng', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it('S8.2-AC2 Một tùy chọn đã lưu bị hỏng thì chỉ tùy chọn đó về mặc định: tốc độ "fast" → "Bình thường (1x)", "60 phút" và pinyin tắt giữ nguyên', async () => {
    await writeRawSettings([
      { key: 'dailyGoalMinutes', value: 60 },
      { key: 'isPinyinVisible', value: false },
      { key: 'defaultAudioSpeed', value: 'fast' },
    ]);

    renderWithProviders(<SettingsContainer />, { route: '/settings' });

    const speedGroup = await screen.findByRole('group', {
      name: 'Tốc độ audio mặc định',
    });
    expect(
      within(speedGroup).getByRole('radio', { name: 'Bình thường (1x)' }),
    ).toBeChecked();
    expect(
      within(speedGroup).getByRole('radio', { name: 'Chậm (0.75x)' }),
    ).not.toBeChecked();

    const goalGroup = screen.getByRole('group', { name: 'Mục tiêu mỗi ngày' });
    expect(
      within(goalGroup).getByRole('radio', { name: '60 phút' }),
    ).toBeChecked();
    expect(
      within(goalGroup).getByRole('radio', { name: '15 phút' }),
    ).not.toBeChecked();

    const pinyinGroup = screen.getByRole('group', { name: 'Hiện pinyin' });
    expect(
      within(pinyinGroup).getByRole('switch', { name: 'Hiện pinyin' }),
    ).not.toBeChecked();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
