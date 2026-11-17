import { describe, expect, it, vi } from 'vitest';

import { FakeHanziWriter } from '@test/mocks/hanzi-writer';
import { screen, userEvent, waitFor } from '@test/render';
import { openRoute, setupStrokeOrderRoute } from '@test/stroke-order-route';

// Ranh giới ngoài: thư viện vẽ/chấm nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

const env = setupStrokeOrderRoute();

const PERSON = '人';
// Chữ hợp lệ nhưng không có trong danh sách dữ liệu nét.
const NO_STROKE_DATA = '龘';

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
});
