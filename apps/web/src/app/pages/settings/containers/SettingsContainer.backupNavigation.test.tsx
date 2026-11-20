import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createDatabase } from '@core/helpers/db.helper';
import { ROOT } from '@test/backup-machine.helpers';
import { mockContentFetch } from '@test/mocks/content-fetch';
import { screen, userEvent, waitFor, within } from '@test/render';
import { openRoute } from '@test/stroke-order-route';

/** File mẫu e2e của S8.5 (design D10), dùng lại ở tầng component. */
const FIXTURE_DIR = join(
  __dirname,
  '../../../../../e2e/E8/fixtures/progress-backup',
);

/** Tạo `File` từ file mẫu, như khi người học chọn file trong hộp chọn file. */
const fixtureFile = (name: string): File =>
  new File([readFileSync(join(FIXTURE_DIR, name))], name, {
    type: 'application/json',
  });

/**
 * Nội dung app qua `fetch` thật của `contentSource`: lộ trình 4 chủ đề intro-01…intro-08 (design D10),
 * mỗi bài một bài tập tối thiểu, tiêu đề là "Bài <số>".
 */
const respondToContent = (input: RequestInfo | URL): Response => {
  const url = String(input);
  if (/\/content\/content\.json$/.test(url)) {
    return Response.json(ROOT);
  }
  const lessonId = /\/content\/lessons\/(.+)\.json$/.exec(url)?.[1];
  if (lessonId === undefined) {
    return new Response('', { status: 404 });
  }
  return Response.json({
    id: lessonId,
    type: 'lesson',
    title: `Bài ${lessonId.replace('intro-', '')}`,
    exercises: [{ id: 'e1', kind: 'tone-choice', wordId: '八' }],
  });
};

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

/** Input chọn file của mục Sao lưu (ẩn, nút "Nhập tiến độ" mở nó). */
const getFileInput = (section: HTMLElement): HTMLInputElement => {
  const input = section.querySelector('input[type="file"]');
  expect(input).toBeInstanceOf(HTMLInputElement);
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('Mục Sao lưu tiến độ chưa có input chọn file');
  }
  return input;
};

describe('SettingsContainer — sau khi nhập tiến độ, sang màn khác', () => {
  beforeEach(async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      mockContentFetch(async (input) => respondToContent(input)),
    );
    await clearDatabase();
    await seedFirstLessonCompleted();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('S8.5-AC3 Màn khác hiện tiến độ mới không cần tải lại: ghi đè bằng file 5 bài rồi bấm "Về lộ trình" thì bài 1–5 "Đã xong", bài 6 "Đang mở"', async () => {
    const user = userEvent.setup();
    const { router } = openRoute('/settings');
    const section = await screen.findByRole('region', {
      name: 'Sao lưu tiến độ',
    });

    await user.upload(getFileInput(section), fixtureFile('hop-le-5-bai.json'));
    const dialog = await screen.findByRole('dialog', {
      name: 'Nhập tiến độ từ file?',
    });
    await user.click(within(dialog).getByRole('button', { name: 'Ghi đè' }));
    await waitFor(() => {
      expect(within(section).getByRole('status')).toHaveTextContent(
        'Đã nhập tiến độ.',
      );
    });

    // Không tải lại app: đi bằng liên kết trong cùng router.
    await user.click(screen.getByRole('link', { name: 'Về lộ trình' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Lộ trình học' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/learning-paths');
    const lessons = await screen.findAllByRole('listitem');
    expect(lessons).toHaveLength(8);
    ['01', '02', '03', '04', '05'].forEach((number, index) => {
      expect(lessons[index]).toHaveTextContent(`Bài ${number}`);
      expect(lessons[index]).toHaveTextContent('Đã xong');
    });
    expect(lessons[5]).toHaveTextContent('Bài 06');
    expect(lessons[5]).toHaveTextContent('Đang mở');
    expect(lessons[6]).toHaveTextContent('Đã khóa');
    expect(lessons[7]).toHaveTextContent('Đã khóa');
  });
});
