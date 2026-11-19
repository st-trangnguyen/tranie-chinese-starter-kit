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

describe('SettingsContainer — bàn phím', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it('S8.2-AC1 Đổi lựa chọn bằng bàn phím: chỉ Tab, mũi tên, Space chọn "60 phút", "Chậm (0.75x)", tắt "Hiện pinyin" và lưu lại', async () => {
    await new ProgressService().completeOnboarding(30);

    const { user, unmount } = renderWithProviders(<SettingsContainer />, {
      route: '/settings',
    });

    const goalGroup = await screen.findByRole('group', {
      name: 'Mục tiêu mỗi ngày',
    });
    const speedGroup = screen.getByRole('group', {
      name: 'Tốc độ audio mặc định',
    });
    const pinyinGroup = screen.getByRole('group', { name: 'Hiện pinyin' });

    // Tab đầu tiên vào liên kết quay về, Tab tiếp vào lựa chọn mục tiêu đang chọn.
    await user.tab();
    expect(screen.getByRole('link', { name: 'Về lộ trình' })).toHaveFocus();

    await user.tab();
    expect(
      within(goalGroup).getByRole('radio', { name: '30 phút' }),
    ).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    const goal60 = within(goalGroup).getByRole('radio', { name: '60 phút' });
    expect(goal60).toHaveFocus();
    expect(goal60).toBeChecked();

    await user.tab();
    expect(
      within(speedGroup).getByRole('radio', { name: 'Bình thường (1x)' }),
    ).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    const slow = within(speedGroup).getByRole('radio', {
      name: 'Chậm (0.75x)',
    });
    expect(slow).toHaveFocus();
    expect(slow).toBeChecked();

    await user.tab();
    const pinyinSwitch = within(pinyinGroup).getByRole('switch', {
      name: 'Hiện pinyin',
    });
    expect(pinyinSwitch).toHaveFocus();
    expect(pinyinSwitch).toBeChecked();

    await user.keyboard(' ');
    expect(pinyinSwitch).not.toBeChecked();
    expect(within(pinyinGroup).getByText('Tắt')).toBeVisible();

    unmount();
    renderWithProviders(<SettingsContainer />, { route: '/settings' });

    const reopenedGoal = await screen.findByRole('group', {
      name: 'Mục tiêu mỗi ngày',
    });
    expect(
      within(reopenedGoal).getByRole('radio', { name: '60 phút' }),
    ).toBeChecked();
    expect(
      within(
        screen.getByRole('group', { name: 'Tốc độ audio mặc định' }),
      ).getByRole('radio', { name: 'Chậm (0.75x)' }),
    ).toBeChecked();
    expect(
      within(screen.getByRole('group', { name: 'Hiện pinyin' })).getByRole(
        'switch',
        { name: 'Hiện pinyin' },
      ),
    ).not.toBeChecked();
  });
});
