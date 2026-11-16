import { describe, expect, it, vi } from 'vitest';

import { FakeHanziWriter } from '@test/mocks/hanzi-writer';
import { screen } from '@test/render';
import {
  openRoute,
  setupStrokeOrderRoute,
  stubReducedMotion,
} from '@test/stroke-order-route';

// Ranh giới ngoài: thư viện vẽ nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

setupStrokeOrderRoute();

describe('StrokeOrderContainer — giảm chuyển động', () => {
  it('S6.1-AC1 Giảm chuyển động hiện thứ tự nét tĩnh: should show 白 statically with numbers 1…5, no "Phát lại" and no hanzi-writer when reduced motion is on', async () => {
    // Người học bật giảm chuyển động trước khi mở màn.
    stubReducedMotion(true);

    openRoute(`/characters/${encodeURIComponent('白')}/stroke-order`);

    // Màn hiện đủ 5 nét ngay, mỗi nét có số thứ tự 1…5 đúng thứ tự viết.
    const figure = await screen.findByRole(
      'img',
      { name: 'Thứ tự nét chữ 白' },
      { timeout: 3000 },
    );
    const labels = Array.from(figure.querySelectorAll('text')).map(
      (label) => label.textContent,
    );
    expect(labels).toEqual(['1', '2', '3', '4', '5']);

    // Không có animation chạy và không có nút "Phát lại".
    expect(
      screen.queryByRole('button', { name: 'Phát lại' }),
    ).not.toBeInTheDocument();
    expect(FakeHanziWriter.instances).toHaveLength(0);
  });
});
