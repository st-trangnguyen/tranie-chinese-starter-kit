import { describe, expect, it, vi } from 'vitest';

import { createDatabase } from '@core/helpers/db.helper';
import { act, screen } from '@test/render';
import { setupStrokeOrderRoute } from '@test/stroke-order-route';
import { SHI, openShiPadWithActiveQuiz } from '@test/writing-practice-route';

// Ranh giới ngoài: thư viện vẽ/chấm nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

const env = setupStrokeOrderRoute();

const STROKE_INDEX_URL = '/content/strokes/index.json';
const STROKE_FILE_OF_SHI = `/content/strokes/${encodeURIComponent(SHI)}.json`;

describe('WritingPracticeContainer: phản hồi khi viết', () => {
  it('S6.2-AC1 Viết đúng hết các nét thì hoàn thành chữ: should show status "Đã viết xong chữ 十." and a "Viết lại" button, stay on the screen, and write no score or progress after both strokes of 十 are correct', async () => {
    const db = createDatabase();
    await Promise.all(db.tables.map((table) => table.clear()));

    const { pad, writer, router } = await openShiPadWithActiveQuiz();

    // 十 có 2 nét: viết đúng nét ngang rồi nét sổ (nét cuối).
    act(() => writer.emitCorrectStroke());
    act(() => writer.emitCorrectStroke());

    // Màn báo đã viết xong chữ, qua vùng status.
    expect(
      await screen.findByRole('status', {}, { timeout: 3000 }),
    ).toHaveTextContent(`Đã viết xong chữ ${SHI}.`);
    expect(pad).toHaveAttribute('data-completed-stroke-count', '2');

    // Có nút "Viết lại".
    expect(screen.getByRole('button', { name: 'Viết lại' })).toBeEnabled();

    // Người học ở lại màn luyện viết của 十.
    expect(router.state.location.pathname).toBe(
      `/characters/${encodeURIComponent(SHI)}/writing-practice`,
    );
    expect(screen.getByRole('figure', { name: `Khung viết chữ ${SHI}` })).toBe(
      pad,
    );

    // Không gửi điểm/tiến độ đi đâu: chỉ có request đọc dữ liệu nét.
    const otherRequests = env.strokeFetch.requests.filter(
      (url) => url !== STROKE_INDEX_URL && url !== STROKE_FILE_OF_SHI,
    );
    expect(otherRequests).toEqual([]);

    // Không ghi bản ghi tiến độ nào vào IndexedDB.
    const rowsByTable = await Promise.all(
      db.tables.map((table) => table.toArray()),
    );
    db.close();
    expect(db.tables.length).toBeGreaterThan(0);
    expect(rowsByTable.flat()).toEqual([]);
  });
});
