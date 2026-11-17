import { describe, expect, it, vi } from 'vitest';

import { FakeHanziWriter } from '@test/mocks/hanzi-writer';
import { act, screen, userEvent, waitFor } from '@test/render';
import { openRoute, setupStrokeOrderRoute } from '@test/stroke-order-route';

// Ranh giới ngoài: thư viện vẽ/chấm nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

const env = setupStrokeOrderRoute();

const PERSON = '人';
const SHI = '十';
// Chữ hợp lệ nhưng không có trong danh sách dữ liệu nét.
const NO_STROKE_DATA = '龘';

/** Nét dài (600 đơn vị hộp 1024, ≥ 30): đủ dài để tính là một lần viết sai. */
const LONG_STROKE_POINTS = [
  { x: 100, y: 100 },
  { x: 100, y: 700 },
];

/** Mở màn luyện viết của 十, chờ khung viết hiện và quiz của writer kích hoạt. */
const openShiPadWithActiveQuiz = async () => {
  openRoute(`/characters/${encodeURIComponent(SHI)}/writing-practice`);
  const pad = await screen.findByRole(
    'figure',
    { name: `Khung viết chữ ${SHI}` },
    { timeout: 3000 },
  );
  await waitFor(() => expect(FakeHanziWriter.last().isQuizActive).toBe(true));
  return { pad, writer: FakeHanziWriter.last() };
};

describe('WritingPracticeContainer', () => {
  it('S6.2-AC1 Màn luyện viết có liên kết về thứ tự nét: should open the stroke-order screen of 人 when clicking "Xem thứ tự nét" on /characters/人/writing-practice', async () => {
    const user = userEvent.setup();
    const { router } = openRoute(
      `/characters/${encodeURIComponent(PERSON)}/writing-practice`,
    );

    const link = await screen.findByRole(
      'link',
      { name: 'Xem thứ tự nét' },
      { timeout: 3000 },
    );

    // Màn luyện viết đúng một chữ: chỉ một khung viết, của chữ 人.
    const pad = await screen.findByRole(
      'figure',
      { name: `Khung viết chữ ${PERSON}` },
      { timeout: 3000 },
    );
    expect(screen.getAllByRole('figure')).toEqual([pad]);

    await user.click(link);

    await waitFor(() =>
      expect(router.state.location.pathname).toBe(
        `/characters/${encodeURIComponent(PERSON)}/stroke-order`,
      ),
    );

    // Màn xem thứ tự nét (S6.1) của đúng chữ 人 hiện, khung viết không còn.
    expect(
      await screen.findByRole(
        'img',
        { name: `Thứ tự nét chữ ${PERSON}` },
        { timeout: 3000 },
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('figure', { name: `Khung viết chữ ${PERSON}` }),
    ).not.toBeInTheDocument();
  });

  it('S6.2-AC1 Chữ không có dữ liệu nét: should show "Chưa có dữ liệu nét cho chữ này." without writing pad or hanzi-writer, keeping "Xem thứ tự nét" link, when opening /characters/龘/writing-practice', async () => {
    openRoute(
      `/characters/${encodeURIComponent(NO_STROKE_DATA)}/writing-practice`,
    );

    // Màn đã mở và đã đọc danh sách chữ có dữ liệu nét.
    await screen.findByRole('heading', { name: 'Tập viết' }, { timeout: 3000 });
    await waitFor(() =>
      expect(env.strokeFetch.requests).toContain('/content/strokes/index.json'),
    );

    expect(
      await screen.findByText('Chưa có dữ liệu nét cho chữ này.'),
    ).toBeInTheDocument();

    // Không có khung viết, không tạo hanzi-writer.
    expect(screen.queryByRole('figure')).not.toBeInTheDocument();
    expect(document.querySelectorAll('figure')).toHaveLength(0);
    expect(FakeHanziWriter.instances).toHaveLength(0);

    // Liên kết về màn xem thứ tự nét của đúng chữ vẫn có.
    expect(
      screen.getByRole('link', { name: 'Xem thứ tự nét' }),
    ).toHaveAttribute(
      'href',
      `/characters/${encodeURIComponent(NO_STROKE_DATA)}/stroke-order`,
    );
  });

  it('S6.2-AC2 Báo ngay khi viết sai nét: should show alert "Sai nét. Viết lại nét này." right after a long wrong stroke on 十, keeping no stroke', async () => {
    const { pad, writer } = await openShiPadWithActiveQuiz();

    // Trước khi viết sai: chưa có thông báo nào.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    act(() => writer.emitMistake({ points: LONG_STROKE_POINTS }));

    // Ngay sau khi thả tay (không chờ thêm): thông báo viết sai hiện.
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Sai nét. Viết lại nét này.',
    );
    // Nét sai không được giữ: chưa có nét nào hoàn thành.
    expect(pad).toHaveAttribute('data-completed-stroke-count', '0');
  });
});
