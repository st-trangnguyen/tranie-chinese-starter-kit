import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createDatabase } from '@core/helpers/db.helper';
import { contentSource } from '@core/services/content-source.service';
import { renderWithProviders, screen, within } from '@test/render';

import SettingsContainer from './SettingsContainer';

/** File mẫu e2e của S8.5 (design D10), dùng lại ở tầng component. */
const FIXTURE_DIR = join(
  __dirname,
  '../../../../../e2e/E8/fixtures/progress-backup',
);

/** Tạo `File` từ file mẫu, như khi người học chọn file trong hộp chọn file. */
const fixtureFile = (name: string, type: string): File =>
  new File([readFileSync(join(FIXTURE_DIR, name))], name, { type });

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

describe('SettingsContainer — nhập file sao lưu bị từ chối', () => {
  beforeEach(async () => {
    await clearDatabase();
    await seedFirstLessonCompleted();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('S8.5-AC2 Thông báo lỗi được đọc cho trình đọc màn hình: chọn file ảnh thì lỗi nằm trong vùng alert có sẵn, không hiện hộp xác nhận', async () => {
    const { user, section } = await renderBackupSection();

    // Vùng live phải có sẵn (rỗng) trước khi chọn file để trình đọc màn hình đọc khi chữ xuất hiện.
    expect(within(section).getByRole('alert')).toBeEmptyDOMElement();

    await user.upload(
      getFileInput(section),
      fixtureFile('anh.png', 'image/png'),
    );

    await vi.waitFor(() => {
      expect(within(section).getByRole('alert')).toHaveTextContent(
        'File này không phải file tiến độ của Tranie Chinese.',
      );
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(within(section).getByRole('status')).toBeEmptyDOMElement();
    expect(await readLessonIds()).toEqual(['intro-01']);
  });

  it.each([
    ['trang-thai-sai.json', 'File tiến độ bị hỏng, không nhập được.'],
    [
      'ban-moi-hon.json',
      'File này được tạo từ phiên bản app mới hơn. Hãy cập nhật app rồi thử lại.',
    ],
  ])(
    'S8.5-AC2 Thông báo lỗi được đọc cho trình đọc màn hình: chọn %s thì vùng alert báo "%s"',
    async (name, expectedMessage) => {
      const { user, section } = await renderBackupSection();

      await user.upload(
        getFileInput(section),
        fixtureFile(name, 'application/json'),
      );

      await vi.waitFor(() => {
        expect(within(section).getByRole('alert')).toHaveTextContent(
          expectedMessage,
        );
      });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(await readLessonIds()).toEqual(['intro-01']);
    },
  );

  it('S8.5-AC2 Thông báo lỗi được đọc cho trình đọc màn hình: không nạp được nội dung app khi đếm bài thì vùng alert báo không nhập được, không hiện hộp', async () => {
    vi.spyOn(contentSource, 'getContentRoot').mockRejectedValueOnce(
      new Error('Không tải được content.json'),
    );
    const { user, section } = await renderBackupSection();

    await user.upload(
      getFileInput(section),
      fixtureFile('hop-le-5-bai.json', 'application/json'),
    );

    await vi.waitFor(() => {
      expect(within(section).getByRole('alert')).toHaveTextContent(
        'Không nhập được tiến độ. Tiến độ trên máy vẫn giữ nguyên.',
      );
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(await readLessonIds()).toEqual(['intro-01']);
  });
});
