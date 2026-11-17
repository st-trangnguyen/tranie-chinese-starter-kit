import { describe, expect, it, vi } from 'vitest';

import { screen, userEvent, waitFor } from '@test/render';
import { openRoute, setupStrokeOrderRoute } from '@test/stroke-order-route';

// Ranh giới ngoài: thư viện vẽ/chấm nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

setupStrokeOrderRoute();

const PERSON = '人';

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
});
