import { createDatabase } from '@core/helpers/db.helper';
import { ProgressService } from '@shared/services/progress.service';
import { renderWithProviders, screen, within } from '@test/render';

import SettingsContainer from './SettingsContainer';

/** Xoá dữ liệu cũ trong IndexedDB thật (fake-indexeddb) của app. */
const clearDatabase = async (): Promise<void> => {
  const db = createDatabase();
  await db.settings.clear();
  await db.lessonProgress.clear();
  db.close();
};

describe('SettingsContainer — giá trị hiện tại', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it('S8.2-AC1 Hiện mục tiêu đã chọn ở onboarding: ba lựa chọn, "30 phút" đang chọn', async () => {
    await new ProgressService().completeOnboarding(30);

    renderWithProviders(<SettingsContainer />, { route: '/settings' });

    const group = await screen.findByRole('group', {
      name: 'Mục tiêu mỗi ngày',
    });
    const radios = within(group).getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(
      within(group).getByRole('radio', { name: '15 phút' }),
    ).not.toBeChecked();
    expect(within(group).getByRole('radio', { name: '30 phút' })).toBeChecked();
    expect(
      within(group).getByRole('radio', { name: '60 phút' }),
    ).not.toBeChecked();
  });
});
