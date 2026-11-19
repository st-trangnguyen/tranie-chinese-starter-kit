import { createDatabase } from '@core/helpers/db.helper';
import { progressStore } from '@core/services/progress-store.service';
import { renderWithProviders, screen, within } from '@test/render';
import {
  findSettingsAlert,
  querySettingsAlert,
} from '@test/settings-alert.helpers';

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

    expect(querySettingsAlert()).not.toBeInTheDocument();
  });

  it('S8.2-AC1 Mục tiêu đã lưu bị hỏng thì về 15 phút: mục tiêu "abc" → "15 phút", tốc độ "slow" giữ "Chậm (0.75x)"', async () => {
    await writeRawSettings([
      { key: 'defaultAudioSpeed', value: 'slow' },
      { key: 'dailyGoalMinutes', value: 'abc' },
    ]);

    renderWithProviders(<SettingsContainer />, { route: '/settings' });

    const goalGroup = await screen.findByRole('group', {
      name: 'Mục tiêu mỗi ngày',
    });
    expect(
      within(goalGroup).getByRole('radio', { name: '15 phút' }),
    ).toBeChecked();

    const speedGroup = screen.getByRole('group', {
      name: 'Tốc độ audio mặc định',
    });
    expect(
      within(speedGroup).getByRole('radio', { name: 'Chậm (0.75x)' }),
    ).toBeChecked();
    expect(
      within(speedGroup).getByRole('radio', { name: 'Bình thường (1x)' }),
    ).not.toBeChecked();

    expect(querySettingsAlert()).not.toBeInTheDocument();
  });
  it('S8.2-AC3 Tùy chọn pinyin đã lưu bị hỏng thì về bật: pinyin "yes" → công tắc bật, mục tiêu 30 giữ "30 phút"', async () => {
    await writeRawSettings([
      { key: 'dailyGoalMinutes', value: 30 },
      { key: 'isPinyinVisible', value: 'yes' },
    ]);

    renderWithProviders(<SettingsContainer />, { route: '/settings' });

    const pinyinGroup = await screen.findByRole('group', {
      name: 'Hiện pinyin',
    });
    expect(
      within(pinyinGroup).getByRole('switch', { name: 'Hiện pinyin' }),
    ).toBeChecked();

    const goalGroup = screen.getByRole('group', { name: 'Mục tiêu mỗi ngày' });
    expect(
      within(goalGroup).getByRole('radio', { name: '30 phút' }),
    ).toBeChecked();
    expect(
      within(goalGroup).getByRole('radio', { name: '15 phút' }),
    ).not.toBeChecked();

    expect(querySettingsAlert()).not.toBeInTheDocument();
  });
});

describe('SettingsContainer — không đọc được cài đặt', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('S8.2-AC1 Không đọc được cài đặt thì màn Cài đặt hiện mặc định: DB có 60/"slow"/tắt nhưng đọc lỗi → "15 phút", "Bình thường (1x)", pinyin bật; lưu lỗi khi chọn "30 phút" → thông báo, "15 phút" vẫn chọn', async () => {
    await writeRawSettings([
      { key: 'dailyGoalMinutes', value: 60 },
      { key: 'defaultAudioSpeed', value: 'slow' },
      { key: 'isPinyinVisible', value: false },
    ]);
    vi.spyOn(progressStore, 'getSettings').mockRejectedValue(
      new Error('read failed'),
    );

    const { user } = renderWithProviders(<SettingsContainer />, {
      route: '/settings',
    });

    const goalGroup = await screen.findByRole('group', {
      name: 'Mục tiêu mỗi ngày',
    });
    expect(
      within(goalGroup).getByRole('radio', { name: '15 phút' }),
    ).toBeChecked();
    expect(
      within(goalGroup).getByRole('radio', { name: '60 phút' }),
    ).not.toBeChecked();

    const speedGroup = screen.getByRole('group', {
      name: 'Tốc độ audio mặc định',
    });
    expect(
      within(speedGroup).getByRole('radio', { name: 'Bình thường (1x)' }),
    ).toBeChecked();
    expect(
      within(speedGroup).getByRole('radio', { name: 'Chậm (0.75x)' }),
    ).not.toBeChecked();

    const pinyinGroup = screen.getByRole('group', { name: 'Hiện pinyin' });
    expect(
      within(pinyinGroup).getByRole('switch', { name: 'Hiện pinyin' }),
    ).toBeChecked();

    expect(querySettingsAlert()).not.toBeInTheDocument();

    vi.spyOn(progressStore, 'saveSettings').mockRejectedValue(
      new Error('write failed'),
    );

    await user.click(within(goalGroup).getByRole('radio', { name: '30 phút' }));

    expect(await findSettingsAlert()).toHaveTextContent(
      'Không lưu được cài đặt. Hãy thử lại.',
    );
    expect(
      within(goalGroup).getByRole('radio', { name: '15 phút' }),
    ).toBeChecked();
    expect(
      within(goalGroup).getByRole('radio', { name: '30 phút' }),
    ).not.toBeChecked();
  });
});
