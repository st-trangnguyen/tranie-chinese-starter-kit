import { describe, expect, it, vi } from 'vitest';

import { screen, within } from '@test/render';
import { openRoute, setupStrokeOrderRoute } from '@test/stroke-order-route';

// Ranh giới ngoài: thư viện vẽ nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

const env = setupStrokeOrderRoute();

/** Mở màn của 人 và kiểm tra trạng thái lỗi tải dữ liệu nét. */
const expectLoadErrorScreen = async (): Promise<void> => {
  openRoute(`/characters/${encodeURIComponent('人')}/stroke-order`);

  // Màn thứ tự nét được mở.
  await screen.findByRole('heading', { name: 'Thứ tự nét' }, { timeout: 3000 });

  // Thông báo "Có lỗi xảy ra" trong vùng alert, kèm nút "Thử lại".
  const alert = await screen.findByRole('alert');
  expect(within(alert).getByText('Có lỗi xảy ra')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument();

  // Không hiện khối animation, không hiện nút "Phát lại", không hiện "chưa có dữ liệu".
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(document.querySelectorAll('figure')).toHaveLength(0);
  expect(
    screen.queryByRole('button', { name: 'Phát lại' }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText('Chưa có dữ liệu nét cho chữ này.'),
  ).not.toBeInTheDocument();
};

describe('StrokeOrderContainer — tải dữ liệu nét lỗi', () => {
  it('S6.1-AC1 Tải dữ liệu nét lỗi: should show "Có lỗi xảy ra" with "Thử lại" and no figure or "Phát lại" when 人.json responds HTTP 500', async () => {
    env.replaceStrokeFetch({
      '人.json': () => new Response('', { status: 500 }),
    });

    await expectLoadErrorScreen();
  });

  it('S6.1-AC1 Tải dữ liệu nét lỗi: should show "Có lỗi xảy ra" with "Thử lại" and no figure or "Phát lại" when fetching 人.json fails with a network error', async () => {
    env.replaceStrokeFetch({
      '人.json': () => Promise.reject(new TypeError('Failed to fetch')),
    });

    await expectLoadErrorScreen();
  });
});
