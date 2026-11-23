import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createDatabase } from '@core/helpers/db.helper';
import { contentSource } from '@core/services/content-source.service';
import { DexieProgressStore } from '@core/services/progress-store.service';
import { ProgressService } from '@shared/services/progress.service';
import { ROOT } from '@test/backup-machine.helpers';
import {
  act,
  renderWithProviders,
  screen,
  waitFor,
  within,
} from '@test/render';

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

/** Máy đang đặt mục tiêu 60 phút, "Hiện pinyin" bật (mặc định); file `hop-le-5-bai` có mục tiêu 15. */
const seedGoalSixtyMinutes = async (): Promise<void> => {
  await new ProgressService().completeOnboarding(60);
};

/** Mở màn Cài đặt (mục tiêu 60 đã hiện) rồi chọn `hop-le-5-bai` để mở hộp xác nhận. */
const openConfirmDialogWithGoalSixty = async () => {
  await seedGoalSixtyMinutes();
  const { user, section } = await renderBackupSection();
  const goalGroup = await screen.findByRole('group', {
    name: 'Mục tiêu mỗi ngày',
  });
  expect(
    within(goalGroup).getByRole('radio', { name: '60 phút' }),
  ).toBeChecked();
  const pinyinGroup = screen.getByRole('group', { name: 'Hiện pinyin' });
  expect(
    within(pinyinGroup).getByRole('switch', { name: 'Hiện pinyin' }),
  ).toBeChecked();

  await user.upload(getFileInput(section), fixtureFile('hop-le-5-bai.json'));
  const dialog = await screen.findByRole('dialog', {
    name: 'Nhập tiến độ từ file?',
  });
  return { user, section, goalGroup, dialog };
};

describe('SettingsContainer — hộp xác nhận nhập tiến độ', () => {
  beforeEach(async () => {
    // Nội dung app (D4: đếm bài đã xong theo lộ trình): 4 chủ đề intro-01…intro-08.
    vi.spyOn(contentSource, 'getContentRoot').mockResolvedValue(ROOT);
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
  it('S8.5-AC3 Hủy thì không đổi gì: hộp đóng, không có thông báo, tiến độ trên máy vẫn chỉ bài 1', async () => {
    const { user, section } = await renderBackupSection();

    await user.upload(getFileInput(section), fixtureFile('hop-le-5-bai.json'));
    const dialog = await screen.findByRole('dialog', {
      name: 'Nhập tiến độ từ file?',
    });

    await user.click(within(dialog).getByRole('button', { name: 'Hủy' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(within(section).getByRole('status')).toBeEmptyDOMElement();
    expect(within(section).getByRole('alert')).toBeEmptyDOMElement();
    expect(await readLessonIds()).toEqual(['intro-01']);
  });
  it('S8.5-AC3 Esc thì như Hủy: hộp đóng, không có thông báo, tiến độ trên máy vẫn chỉ bài 1', async () => {
    const { user, section } = await renderBackupSection();

    await user.upload(getFileInput(section), fixtureFile('hop-le-5-bai.json'));
    const dialog = await screen.findByRole('dialog', {
      name: 'Nhập tiến độ từ file?',
    });

    // Focus đang ở trong hộp (ở nút "Ghi đè" để chắc Esc không phải bấm "Hủy").
    const overwriteButton = within(dialog).getByRole('button', {
      name: 'Ghi đè',
    });
    act(() => {
      overwriteButton.focus();
    });
    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(within(section).getByRole('status')).toBeEmptyDOMElement();
    expect(within(section).getByRole('alert')).toBeEmptyDOMElement();
    expect(await readLessonIds()).toEqual(['intro-01']);
  });
  it('S8.5-AC3 Hộp xác nhận dùng được bằng bàn phím: mở thì focus ở "Hủy", Tab chỉ đi giữa hai nút trong hộp, đóng thì focus về "Nhập tiến độ"', async () => {
    const { user, section } = await renderBackupSection();

    await user.upload(getFileInput(section), fixtureFile('hop-le-5-bai.json'));
    const dialog = await screen.findByRole('dialog', {
      name: 'Nhập tiến độ từ file?',
    });
    const cancelButton = within(dialog).getByRole('button', { name: 'Hủy' });
    const overwriteButton = within(dialog).getByRole('button', {
      name: 'Ghi đè',
    });

    // Vừa mở: focus ở "Hủy" (tránh ghi đè nhầm).
    await waitFor(() => {
      expect(cancelButton).toHaveFocus();
    });

    // Tab chỉ vòng giữa hai nút trong hộp, không ra nền.
    await user.tab();
    expect(overwriteButton).toHaveFocus();
    await user.tab();
    expect(cancelButton).toHaveFocus();
    await user.tab({ shift: true });
    expect(overwriteButton).toHaveFocus();
    await user.tab({ shift: true });
    expect(cancelButton).toHaveFocus();

    // Enter ở "Hủy": hộp đóng, focus về nút "Nhập tiến độ".
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(
      within(section).getByRole('button', { name: 'Nhập tiến độ' }),
    ).toHaveFocus();
    expect(await readLessonIds()).toEqual(['intro-01']);
  });
  it('S8.5-AC3 Thông báo thành công được đọc cho trình đọc màn hình: bấm "Ghi đè" → vùng status có "Đã nhập tiến độ.", focus về "Nhập tiến độ", mục tiêu hiện "15 phút" mà không mở lại màn', async () => {
    const { user, section, goalGroup, dialog } =
      await openConfirmDialogWithGoalSixty();

    await user.click(within(dialog).getByRole('button', { name: 'Ghi đè' }));

    await waitFor(() => {
      expect(within(section).getByRole('status')).toHaveTextContent(
        'Đã nhập tiến độ.',
      );
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(within(section).getByRole('alert')).toBeEmptyDOMElement();
    expect(
      within(section).getByRole('button', { name: 'Nhập tiến độ' }),
    ).toHaveFocus();

    // Tùy chọn nạp lại tại chỗ (useSettings.reloadPreferences): cùng nhóm radio, không remount.
    await waitFor(() => {
      expect(
        within(goalGroup).getByRole('radio', { name: '15 phút' }),
      ).toBeChecked();
    });
    expect(goalGroup).toBeInTheDocument();
    expect(
      within(goalGroup).getByRole('radio', { name: '60 phút' }),
    ).not.toBeChecked();
    expect(
      within(screen.getByRole('group', { name: 'Hiện pinyin' })).getByRole(
        'switch',
        { name: 'Hiện pinyin' },
      ),
    ).toBeChecked();
    expect(await readLessonIds()).toEqual([
      'intro-01',
      'intro-02',
      'intro-03',
      'intro-04',
      'intro-05',
    ]);
  });
  it('S8.5-AC3 Thông báo thành công được đọc cho trình đọc màn hình: ghi lỗi → vùng alert báo không nhập được, mục tiêu vẫn "60 phút"', async () => {
    vi.spyOn(DexieProgressStore.prototype, 'importAll').mockRejectedValue(
      new Error('Ghi IndexedDB lỗi (giả lập)'),
    );
    const { user, section, goalGroup, dialog } =
      await openConfirmDialogWithGoalSixty();

    await user.click(within(dialog).getByRole('button', { name: 'Ghi đè' }));

    await waitFor(() => {
      expect(within(section).getByRole('alert')).toHaveTextContent(
        'Không nhập được tiến độ. Tiến độ trên máy vẫn giữ nguyên.',
      );
    });
    expect(within(section).getByRole('status')).toBeEmptyDOMElement();
    expect(
      within(goalGroup).getByRole('radio', { name: '60 phút' }),
    ).toBeChecked();
    expect(
      within(goalGroup).getByRole('radio', { name: '15 phút' }),
    ).not.toBeChecked();
    expect(await readLessonIds()).toEqual(['intro-01']);
  });
});
