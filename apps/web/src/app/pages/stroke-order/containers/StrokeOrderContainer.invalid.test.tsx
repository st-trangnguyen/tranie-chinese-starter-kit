import { describe, expect, it, vi } from 'vitest';

import { screen } from '@test/render';
import { openRoute, setupStrokeOrderRoute } from '@test/stroke-order-route';

// Ranh giới ngoài: thư viện vẽ nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

const env = setupStrokeOrderRoute();

describe('StrokeOrderContainer — chữ được yêu cầu không hợp lệ', () => {
  it('S6.1-AC1 Chữ được yêu cầu gồm nhiều chữ: should show "Chưa có dữ liệu nét cho chữ này." without figure, replay button, 你 or 好 when opening /characters/你好/stroke-order', async () => {
    openRoute(`/characters/${encodeURIComponent('你好')}/stroke-order`);

    // Màn thứ tự nét được mở.
    await screen.findByRole(
      'heading',
      { name: 'Thứ tự nét' },
      { timeout: 3000 },
    );

    expect(
      await screen.findByText('Chưa có dữ liệu nét cho chữ này.'),
    ).toBeInTheDocument();

    // Không hiện khối animation, không hiện nút "Phát lại".
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(document.querySelectorAll('figure')).toHaveLength(0);
    expect(
      screen.queryByRole('button', { name: 'Phát lại' }),
    ).not.toBeInTheDocument();

    // Không hiện riêng chữ 你 hay 好 (cả khối animation lẫn chữ trong nội dung màn).
    expect(
      screen.queryByRole('img', { name: 'Thứ tự nét chữ 你' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('img', { name: 'Thứ tự nét chữ 好' }),
    ).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent('你');
    expect(document.body).not.toHaveTextContent('好');

    // Chữ không hợp lệ bị loại trước khi đọc nguồn: không request nào tới dữ liệu nét.
    const strokeRequests = env.strokeFetch.requests.filter((url) =>
      url.startsWith('/content/strokes/'),
    );
    expect(strokeRequests).toEqual([]);
  });
});
