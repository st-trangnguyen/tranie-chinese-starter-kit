import { createDatabase } from '@core/helpers/db.helper';
import { fileSaver } from '@core/services/file-saver.service';
import { DexieProgressStore } from '@core/services/progress-store.service';
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

/** Ngày trên máy theo dạng `YYYY-MM-DD` (giờ địa phương), dùng cho tên file xuất. */
const todayKey = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

/** Số lần Tab tối đa để đi qua các điều khiển phía trên mục Sao lưu. */
const MAX_TABS = 30;

describe('SettingsContainer — mục Sao lưu tiến độ', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

  it('S8.5-AC1 Hai nút dùng được bằng bàn phím: Tab tới "Xuất tiến độ", Enter lưu file, Tab tiếp tới "Nhập tiến độ"', async () => {
    const save = vi
      .spyOn(fileSaver, 'save')
      .mockImplementation(() => undefined);
    const { user } = renderWithProviders(<SettingsContainer />, {
      route: '/settings',
    });

    const section = await screen.findByRole('region', {
      name: 'Sao lưu tiến độ',
    });
    const exportButton = within(section).getByRole('button', {
      name: 'Xuất tiến độ',
    });
    const importButton = within(section).getByRole('button', {
      name: 'Nhập tiến độ',
    });

    // Chỉ dùng Tab: đi qua các điều khiển phía trên cho tới nút "Xuất tiến độ".
    for (
      let i = 0;
      i < MAX_TABS && document.activeElement !== exportButton;
      i += 1
    ) {
      await user.tab();
    }
    expect(exportButton).toHaveFocus();

    await user.keyboard('{Enter}');

    await vi.waitFor(() => {
      expect(save).toHaveBeenCalledTimes(1);
    });
    expect(save.mock.calls[0]?.[0]).toBe(`tranie-tien-do-${todayKey()}.json`);

    await user.tab();
    expect(importButton).toHaveFocus();
  });
  it('S8.5-AC1 Thông báo xuất được đọc cho trình đọc màn hình: "Đã xuất tiến độ." nằm trong vùng status có sẵn', async () => {
    const save = vi
      .spyOn(fileSaver, 'save')
      .mockImplementation(() => undefined);
    const { user } = renderWithProviders(<SettingsContainer />, {
      route: '/settings',
    });

    const section = await screen.findByRole('region', {
      name: 'Sao lưu tiến độ',
    });
    // Vùng live phải có sẵn (rỗng) trước khi bấm để trình đọc màn hình đọc khi chữ xuất hiện.
    const status = within(section).getByRole('status');
    expect(status).toBeEmptyDOMElement();

    await user.click(
      within(section).getByRole('button', { name: 'Xuất tiến độ' }),
    );

    await vi.waitFor(() => {
      expect(save).toHaveBeenCalledTimes(1);
    });
    await vi.waitFor(() => {
      expect(within(section).getByRole('status')).toHaveTextContent(
        'Đã xuất tiến độ.',
      );
    });
    expect(within(section).getByRole('alert')).toBeEmptyDOMElement();
  });

  it('S8.5-AC1 Thông báo xuất được đọc cho trình đọc màn hình: không đọc được tiến độ thì vùng alert báo lỗi, không lưu file', async () => {
    const save = vi
      .spyOn(fileSaver, 'save')
      .mockImplementation(() => undefined);
    vi.spyOn(DexieProgressStore.prototype, 'exportAll').mockRejectedValueOnce(
      new Error('Không đọc được IndexedDB'),
    );
    const { user } = renderWithProviders(<SettingsContainer />, {
      route: '/settings',
    });

    const section = await screen.findByRole('region', {
      name: 'Sao lưu tiến độ',
    });
    const alert = within(section).getByRole('alert');
    expect(alert).toBeEmptyDOMElement();

    await user.click(
      within(section).getByRole('button', { name: 'Xuất tiến độ' }),
    );

    await vi.waitFor(() => {
      expect(within(section).getByRole('alert')).toHaveTextContent(
        'Không xuất được tiến độ. Hãy thử lại.',
      );
    });
    expect(save).not.toHaveBeenCalled();
    expect(within(section).getByRole('status')).toBeEmptyDOMElement();
  });
});
