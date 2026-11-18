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

  it('S8.2-AC2 Mặc định ban đầu là tốc độ thường: hai lựa chọn, "Bình thường (1x)" đang chọn', async () => {
    renderWithProviders(<SettingsContainer />, { route: '/settings' });

    const group = await screen.findByRole('group', {
      name: 'Tốc độ audio mặc định',
    });
    const radios = within(group).getAllByRole('radio');
    expect(radios).toHaveLength(2);
    expect(
      within(group).getByRole('radio', { name: 'Bình thường (1x)' }),
    ).toBeChecked();
    expect(
      within(group).getByRole('radio', { name: 'Chậm (0.75x)' }),
    ).not.toBeChecked();
  });

  it('S8.2-AC3 Mặc định hiện pinyin: công tắc "Hiện pinyin" bật, có chữ "Bật"; tắt thì chữ "Tắt"', async () => {
    const { user } = renderWithProviders(<SettingsContainer />, {
      route: '/settings',
    });

    const group = await screen.findByRole('group', { name: 'Hiện pinyin' });
    const pinyinSwitch = within(group).getByRole('switch', {
      name: 'Hiện pinyin',
    });
    expect(pinyinSwitch).toBeChecked();
    expect(within(group).getByText('Bật')).toBeVisible();
    expect(within(group).queryByText('Tắt')).not.toBeInTheDocument();

    await user.click(pinyinSwitch);

    expect(
      within(group).getByRole('switch', { name: 'Hiện pinyin' }),
    ).not.toBeChecked();
    expect(within(group).getByText('Tắt')).toBeVisible();
    expect(within(group).queryByText('Bật')).not.toBeInTheDocument();
  });
});

describe('SettingsContainer — lưu khi đổi', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it('S8.2-AC1 Đổi mục tiêu thì giữ sau khi mở lại app: chọn "60 phút" → checked ngay, không có nút "Lưu", mở lại vẫn "60 phút"', async () => {
    await new ProgressService().completeOnboarding(30);

    const { user, unmount } = renderWithProviders(<SettingsContainer />, {
      route: '/settings',
    });

    const group = await screen.findByRole('group', {
      name: 'Mục tiêu mỗi ngày',
    });
    await user.click(within(group).getByRole('radio', { name: '60 phút' }));

    expect(within(group).getByRole('radio', { name: '60 phút' })).toBeChecked();
    expect(
      within(group).getByRole('radio', { name: '30 phút' }),
    ).not.toBeChecked();
    expect(
      screen.queryByRole('button', { name: /lưu/i }),
    ).not.toBeInTheDocument();

    unmount();
    renderWithProviders(<SettingsContainer />, { route: '/settings' });

    const reopenedGroup = await screen.findByRole('group', {
      name: 'Mục tiêu mỗi ngày',
    });
    expect(
      within(reopenedGroup).getByRole('radio', { name: '60 phút' }),
    ).toBeChecked();
    expect(
      within(reopenedGroup).getByRole('radio', { name: '30 phút' }),
    ).not.toBeChecked();
  });

  it('S8.2-AC2 Tốc độ mặc định giữ sau khi mở lại app: chọn "Chậm (0.75x)" → checked, mở lại vẫn "Chậm (0.75x)"', async () => {
    const { user, unmount } = renderWithProviders(<SettingsContainer />, {
      route: '/settings',
    });

    const group = await screen.findByRole('group', {
      name: 'Tốc độ audio mặc định',
    });
    await user.click(
      within(group).getByRole('radio', { name: 'Chậm (0.75x)' }),
    );

    expect(
      within(group).getByRole('radio', { name: 'Chậm (0.75x)' }),
    ).toBeChecked();

    unmount();
    renderWithProviders(<SettingsContainer />, { route: '/settings' });

    const reopenedGroup = await screen.findByRole('group', {
      name: 'Tốc độ audio mặc định',
    });
    expect(
      within(reopenedGroup).getByRole('radio', { name: 'Chậm (0.75x)' }),
    ).toBeChecked();
    expect(
      within(reopenedGroup).getByRole('radio', { name: 'Bình thường (1x)' }),
    ).not.toBeChecked();
  });
});
