import { createDatabase } from '@core/helpers/db.helper';
import { progressStore } from '@core/services/progress-store.service';
import { ProgressService } from '@shared/services/progress.service';
import { renderWithProviders, screen, waitFor, within } from '@test/render';

import SettingsContainer from './SettingsContainer';

const SAVE_ERROR_MESSAGE = 'Không lưu được cài đặt. Hãy thử lại.';

/** Xoá dữ liệu cũ trong IndexedDB thật (fake-indexeddb) của app. */
const clearDatabase = async (): Promise<void> => {
  const db = createDatabase();
  await db.settings.clear();
  await db.lessonProgress.clear();
  db.close();
};

describe('SettingsContainer — lỗi lưu', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('S8.2-AC1 Không lưu được thì báo lỗi và giữ giá trị cũ: mục tiêu 15, chọn "30 phút" lưu lỗi → thông báo, "15 phút" vẫn chọn', async () => {
    await new ProgressService().completeOnboarding(15);

    const { user } = renderWithProviders(<SettingsContainer />, {
      route: '/settings',
    });

    const group = await screen.findByRole('group', {
      name: 'Mục tiêu mỗi ngày',
    });
    expect(within(group).getByRole('radio', { name: '15 phút' })).toBeChecked();

    vi.spyOn(progressStore, 'saveSettings').mockRejectedValueOnce(
      new Error('quota'),
    );

    await user.click(within(group).getByRole('radio', { name: '30 phút' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(SAVE_ERROR_MESSAGE);
    expect(within(group).getByRole('radio', { name: '15 phút' })).toBeChecked();
    expect(
      within(group).getByRole('radio', { name: '30 phút' }),
    ).not.toBeChecked();
  });

  it('S8.2-AC2 Không lưu được tốc độ thì giữ tốc độ cũ: tốc độ 1x, chọn "Chậm (0.75x)" lưu lỗi → thông báo, "Bình thường (1x)" vẫn chọn', async () => {
    await new ProgressService().completeOnboarding(15);

    const { user } = renderWithProviders(<SettingsContainer />, {
      route: '/settings',
    });

    const group = await screen.findByRole('group', {
      name: 'Tốc độ audio mặc định',
    });
    expect(
      within(group).getByRole('radio', { name: 'Bình thường (1x)' }),
    ).toBeChecked();

    vi.spyOn(progressStore, 'saveSettings').mockRejectedValueOnce(
      new Error('quota'),
    );

    await user.click(
      within(group).getByRole('radio', { name: 'Chậm (0.75x)' }),
    );

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(SAVE_ERROR_MESSAGE);
    expect(
      within(group).getByRole('radio', { name: 'Bình thường (1x)' }),
    ).toBeChecked();
    expect(
      within(group).getByRole('radio', { name: 'Chậm (0.75x)' }),
    ).not.toBeChecked();
  });

  it('S8.2-AC3 Không lưu được pinyin thì công tắc về trạng thái cũ: pinyin bật, tắt lưu lỗi → thông báo, công tắc vẫn bật', async () => {
    await new ProgressService().completeOnboarding(15);

    const { user } = renderWithProviders(<SettingsContainer />, {
      route: '/settings',
    });

    const group = await screen.findByRole('group', { name: 'Hiện pinyin' });
    const pinyinSwitch = within(group).getByRole('switch', {
      name: 'Hiện pinyin',
    });
    expect(pinyinSwitch).toBeChecked();

    vi.spyOn(progressStore, 'saveSettings').mockRejectedValueOnce(
      new Error('quota'),
    );

    await user.click(pinyinSwitch);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(SAVE_ERROR_MESSAGE);
    expect(
      within(group).getByRole('switch', { name: 'Hiện pinyin' }),
    ).toBeChecked();
    expect(within(group).getByText('Bật')).toBeVisible();
  });

  it('S8.2-AC1 Lưu được lại thì thông báo lỗi biến mất: sau lỗi, chọn lại "30 phút" lưu được → hết thông báo, "30 phút" chọn', async () => {
    await new ProgressService().completeOnboarding(15);

    const { user } = renderWithProviders(<SettingsContainer />, {
      route: '/settings',
    });

    const group = await screen.findByRole('group', {
      name: 'Mục tiêu mỗi ngày',
    });

    vi.spyOn(progressStore, 'saveSettings').mockRejectedValueOnce(
      new Error('quota'),
    );

    await user.click(within(group).getByRole('radio', { name: '30 phút' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      SAVE_ERROR_MESSAGE,
    );

    await user.click(within(group).getByRole('radio', { name: '30 phút' }));

    await waitFor(() => {
      expect(screen.queryByRole('alert')).toBeNull();
    });
    expect(within(group).getByRole('radio', { name: '30 phút' })).toBeChecked();
    expect(
      within(group).getByRole('radio', { name: '15 phút' }),
    ).not.toBeChecked();
  });

  it('S8.2-AC1 Lưu được lại thì thông báo lỗi biến mất (TC-S8.2-AC1-17): lỗi ở mục tiêu, đổi tốc độ lưu được → hết thông báo, "15 phút" và "Chậm (0.75x)" chọn', async () => {
    await new ProgressService().completeOnboarding(15);

    const { user } = renderWithProviders(<SettingsContainer />, {
      route: '/settings',
    });

    const goalGroup = await screen.findByRole('group', {
      name: 'Mục tiêu mỗi ngày',
    });
    const speedGroup = screen.getByRole('group', {
      name: 'Tốc độ audio mặc định',
    });

    vi.spyOn(progressStore, 'saveSettings').mockRejectedValueOnce(
      new Error('quota'),
    );

    await user.click(within(goalGroup).getByRole('radio', { name: '30 phút' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      SAVE_ERROR_MESSAGE,
    );

    await user.click(
      within(speedGroup).getByRole('radio', { name: 'Chậm (0.75x)' }),
    );

    await waitFor(() => {
      expect(screen.queryByRole('alert')).toBeNull();
    });
    expect(
      within(goalGroup).getByRole('radio', { name: '15 phút' }),
    ).toBeChecked();
    expect(
      within(speedGroup).getByRole('radio', { name: 'Chậm (0.75x)' }),
    ).toBeChecked();
  });
});
