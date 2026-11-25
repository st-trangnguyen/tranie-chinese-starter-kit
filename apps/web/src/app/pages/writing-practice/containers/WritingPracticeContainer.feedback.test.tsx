import { describe, expect, it, vi } from 'vitest';

import { createDatabase } from '@core/helpers/db.helper';
import { progressStore } from '@core/services/progress-store.service';
import { FakeHanziWriter } from '@test/mocks/hanzi-writer';
import { act, screen, userEvent, waitFor } from '@test/render';
import { setupStrokeOrderRoute } from '@test/stroke-order-route';
import {
  LONG_STROKE_POINTS,
  SHI,
  openShiPadWithActiveQuiz,
} from '@test/writing-practice-route';

// Ranh giới ngoài: thư viện vẽ/chấm nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

const env = setupStrokeOrderRoute();

const CONTENT_PREFIX = '/content/';

/** Màn đã xong chữ: có nút "Viết lại", không có điểm, phần trăm hay chữ "đã lưu". */
const expectCompletedScreenWithoutScore = (): void => {
  expect(screen.getByRole('button', { name: 'Viết lại' })).toBeEnabled();
  expect(document.body).not.toHaveTextContent(/điểm|%|đã lưu/i);
};

/** Mọi dòng IndexedDB ngoài bảng chữ đã viết (tiến độ bài, thống kê ngày, cài đặt, thẻ). */
const rowsOutsideWrittenCharacters = async (
  db: ReturnType<typeof createDatabase>,
): Promise<unknown[]> => {
  const otherTables = db.tables.filter(
    (table) => table.name !== 'writtenCharacters',
  );
  expect(otherTables.length).toBeGreaterThan(0);
  const rowsByTable = await Promise.all(
    otherTables.map((table) => table.toArray()),
  );
  return rowsByTable.flat();
};

describe('WritingPracticeContainer: phản hồi khi viết', () => {
  it('S6.2-AC1 Viết đúng hết các nét thì hoàn thành chữ: should show status "Đã viết xong chữ 十." and a "Viết lại" button, stay on the screen with no score, percent or "đã lưu", and record 十 as written once (also after "Viết lại" and writing it again)', async () => {
    const user = userEvent.setup();
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
    expectCompletedScreenWithoutScore();

    // Người học ở lại màn luyện viết của 十.
    expect(router.state.location.pathname).toBe(
      `/characters/${encodeURIComponent(SHI)}/writing-practice`,
    );
    expect(screen.getByRole('figure', { name: `Khung viết chữ ${SHI}` })).toBe(
      pad,
    );

    // Lần viết xong được ghi nhận cho thẻ chiều viết (S9.1): chữ 十 là chữ đã viết.
    await waitFor(async () => {
      expect(await progressStore.getWrittenCharacters()).toEqual([SHI]);
    });

    // Không gửi điểm/tiến độ đi đâu: chỉ có request đọc nội dung tĩnh (dữ liệu nét, từ vựng).
    const nonContentRequests = env.strokeFetch.requests.filter(
      (url) => !url.startsWith(CONTENT_PREFIX),
    );
    expect(nonContentRequests).toEqual([]);

    // Không ghi điểm hay tiến độ: ngoài chữ đã viết, IndexedDB không có dòng nào.
    // 十 chưa học trong bài nào nên cũng không có thẻ.
    expect(await rowsOutsideWrittenCharacters(db)).toEqual([]);

    // Viết lại rồi viết xong lần nữa.
    await user.click(screen.getByRole('button', { name: 'Viết lại' }));
    await waitFor(() => {
      const candidate = FakeHanziWriter.last();
      expect(candidate).not.toBe(writer);
      expect(candidate.isQuizActive).toBe(true);
    });
    const newWriter = FakeHanziWriter.last();
    act(() => newWriter.emitCorrectStroke());
    act(() => newWriter.emitCorrectStroke());

    // Giao diện như lần đầu.
    expect(
      await screen.findByRole('status', {}, { timeout: 3000 }),
    ).toHaveTextContent(`Đã viết xong chữ ${SHI}.`);
    expect(
      screen.getByRole('figure', { name: `Khung viết chữ ${SHI}` }),
    ).toHaveAttribute('data-completed-stroke-count', '2');
    expectCompletedScreenWithoutScore();
    expect(router.state.location.pathname).toBe(
      `/characters/${encodeURIComponent(SHI)}/writing-practice`,
    );

    // Chữ 十 vẫn chỉ được ghi một lần.
    await waitFor(async () => {
      expect(await db.table('writtenCharacters').toArray()).toEqual([
        { character: SHI },
      ]);
    });
    expect(await progressStore.getWrittenCharacters()).toEqual([SHI]);
    expect(await rowsOutsideWrittenCharacters(db)).toEqual([]);
    db.close();
  });

  it('S6.2-AC1 Viết lại sau khi hoàn thành: should drop the completed status, reset the pad to 0 written strokes, cancel the old quiz and start a quiz on a new writer after clicking "Viết lại"', async () => {
    const user = userEvent.setup();
    const { writer: oldWriter } = await openShiPadWithActiveQuiz();

    act(() => oldWriter.emitCorrectStroke());
    act(() => oldWriter.emitCorrectStroke());
    expect(
      await screen.findByRole('status', {}, { timeout: 3000 }),
    ).toHaveTextContent(`Đã viết xong chữ ${SHI}.`);

    await user.click(screen.getByRole('button', { name: 'Viết lại' }));

    // Thông báo hoàn thành và nút "Viết lại" biến mất.
    await waitFor(() =>
      expect(
        screen.queryByText(`Đã viết xong chữ ${SHI}.`),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.queryByRole('button', { name: 'Viết lại' }),
    ).not.toBeInTheDocument();

    // Khung chỉ còn nét mờ: chưa có nét nào đã viết.
    const pad = screen.getByRole('figure', { name: `Khung viết chữ ${SHI}` });
    expect(pad).toHaveAttribute('data-completed-stroke-count', '0');

    // Writer cũ bị huỷ quiz, không còn chấm nét.
    expect(oldWriter.calls.map((call) => call.method)).toContain('cancelQuiz');
    expect(oldWriter.isQuizActive).toBe(false);

    // Một writer mới được tạo và quiz của nó chạy, chờ nét đầu tiên.
    await waitFor(() => {
      const newWriter = FakeHanziWriter.last();
      expect(newWriter).not.toBe(oldWriter);
      expect(newWriter.isQuizActive).toBe(true);
    });
  });

  it('S6.2-AC1 Viết lại sau khi hoàn thành: TC-S6.2-AC1-16 should show no hint after one wrong stroke on the new writer when 2 mistakes were made on the vertical stroke before completing and clicking "Viết lại"', async () => {
    const user = userEvent.setup();
    const { writer: oldWriter } = await openShiPadWithActiveQuiz();

    // Nét ngang đúng, sai 2 lần ở nét sổ, rồi viết đúng nét sổ (xong chữ).
    act(() => oldWriter.emitCorrectStroke());
    act(() => oldWriter.emitMistake({ points: LONG_STROKE_POINTS }));
    act(() => oldWriter.emitMistake({ points: LONG_STROKE_POINTS }));
    act(() => oldWriter.emitCorrectStroke());
    expect(
      await screen.findByRole('status', {}, { timeout: 3000 }),
    ).toHaveTextContent(`Đã viết xong chữ ${SHI}.`);

    await user.click(screen.getByRole('button', { name: 'Viết lại' }));

    // Chờ writer mới sẵn sàng chấm nét.
    await waitFor(() => {
      const candidate = FakeHanziWriter.last();
      expect(candidate).not.toBe(oldWriter);
      expect(candidate.isQuizActive).toBe(true);
    });
    const newWriter = FakeHanziWriter.last();

    // Sai nét ngang 1 lần trên lượt mới.
    act(() => newWriter.emitMistake({ points: LONG_STROKE_POINTS }));

    const pad = screen.getByRole('figure', { name: `Khung viết chữ ${SHI}` });
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(pad).toHaveAttribute('data-completed-stroke-count', '0');
    // Bộ đếm sai bắt đầu lại từ 0: một lần sai chưa đủ để hiện gợi ý.
    expect(pad.querySelector('.writing-pad-hint')).toBeNull();
    expect(pad).not.toHaveAttribute('data-hint-stroke-index');
  });

  it('S6.2-AC3 Viết đúng thì gợi ý ẩn: should hide the hint of the horizontal stroke of 十 and count 1 written stroke when the stroke is written correctly after 3 wrong strokes', async () => {
    const { pad, writer } = await openShiPadWithActiveQuiz();

    // Sai 3 lần liên tiếp ở nét ngang (nét 0): gợi ý hiện.
    act(() => writer.emitMistake({ points: LONG_STROKE_POINTS }));
    act(() => writer.emitMistake({ points: LONG_STROKE_POINTS }));
    act(() => writer.emitMistake({ points: LONG_STROKE_POINTS }));
    expect(pad.querySelector('.writing-pad-hint')).not.toBeNull();
    expect(pad).toHaveAttribute('data-hint-stroke-index', '0');

    // Viết đúng nét ngang.
    act(() => writer.emitCorrectStroke());

    // Nét được nhận, gợi ý ẩn và không chuyển sang gợi ý nét kế tiếp.
    expect(pad).toHaveAttribute('data-completed-stroke-count', '1');
    expect(pad.querySelector('.writing-pad-hint')).toBeNull();
    expect(pad).not.toHaveAttribute('data-hint-stroke-index');
  });
});
