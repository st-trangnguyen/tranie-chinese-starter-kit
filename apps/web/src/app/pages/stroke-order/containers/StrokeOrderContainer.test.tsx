import { waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ROUTE_PATHS } from '@core/constants/app.constants';
import { screen } from '@test/render';
import { openRoute, setupStrokeOrderRoute } from '@test/stroke-order-route';
import strokeIndex from '@assets/content/strokes/index.json';

// Ranh giới ngoài: thư viện vẽ nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

const env = setupStrokeOrderRoute();

describe('StrokeOrderContainer', () => {
  it('S6.1-AC1 Màn chỉ hiện một chữ: should show only the stroke-order figure of 好 when opening /characters/好/stroke-order', async () => {
    openRoute(`/characters/${encodeURIComponent('好')}/stroke-order`);

    const figure = await screen.findByRole(
      'img',
      { name: 'Thứ tự nét chữ 好' },
      { timeout: 3000 },
    );

    // Đúng một khối chữ trên màn.
    expect(screen.getAllByRole('img')).toEqual([figure]);
    expect(document.querySelectorAll('figure')).toHaveLength(1);

    // Không có cách chuyển sang chữ khác: link duy nhất là "Tập viết" dẫn tới màn luyện viết
    // của chính chữ 好 (S6.2), nút duy nhất là "Phát lại".
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName('Tập viết');
    expect(links[0]).toHaveAttribute('href', ROUTE_PATHS.writingPractice('好'));
    expect(
      screen.getAllByRole('button').map((button) => button.textContent),
    ).toEqual(['Phát lại']);

    // Không hiện và không tải chữ nào khác.
    const otherCharacters = strokeIndex.filter(
      (character) => character !== '好',
    );
    otherCharacters.forEach((character) =>
      expect(document.body).not.toHaveTextContent(character),
    );
    const strokeFileRequests = env.strokeFetch.requests.filter(
      (url) =>
        url.startsWith('/content/strokes/') && !url.endsWith('/index.json'),
    );
    expect(strokeFileRequests).toEqual([
      `/content/strokes/${encodeURIComponent('好')}.json`,
    ]);
  });

  it('S6.1-AC1 Đang tải dữ liệu nét: should show "Đang tải…" without figure or replay button while stroke data of 人 is still loading', async () => {
    // Ranh giới ngoài: file nét của 人 không bao giờ trả về (đang tải).
    env.replaceStrokeFetch({
      '人.json': () => new Promise<Response>(() => undefined),
    });

    openRoute(`/characters/${encodeURIComponent('人')}/stroke-order`);

    // Màn đã mở và đã bắt đầu tải file nét của 人.
    await screen.findByRole(
      'heading',
      { name: 'Thứ tự nét' },
      { timeout: 3000 },
    );
    await waitFor(() =>
      expect(env.strokeFetch.requests).toContain(
        `/content/strokes/${encodeURIComponent('人')}.json`,
      ),
    );

    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent('Đang tải…');

    // Không hiện khối animation, không hiện nút "Phát lại".
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(document.querySelectorAll('figure')).toHaveLength(0);
    expect(
      screen.queryByRole('button', { name: 'Phát lại' }),
    ).not.toBeInTheDocument();
  });

  it('S6.1-AC1 Chữ không có dữ liệu nét: should show "Chưa có dữ liệu nét cho chữ này." without figure, replay button or error when opening /characters/龘/stroke-order', async () => {
    openRoute(`/characters/${encodeURIComponent('龘')}/stroke-order`);

    // Màn đã mở và đã đọc danh sách chữ có dữ liệu nét.
    await screen.findByRole(
      'heading',
      { name: 'Thứ tự nét' },
      { timeout: 3000 },
    );
    await waitFor(() =>
      expect(env.strokeFetch.requests).toContain('/content/strokes/index.json'),
    );

    expect(
      await screen.findByText('Chưa có dữ liệu nét cho chữ này.'),
    ).toBeInTheDocument();

    // Không hiện khối animation, không hiện nút "Phát lại", không phải trạng thái lỗi.
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(document.querySelectorAll('figure')).toHaveLength(0);
    expect(
      screen.queryByRole('button', { name: 'Phát lại' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Có lỗi xảy ra')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Không tải file nét nào, chỉ đọc danh sách.
    const strokeFileRequests = env.strokeFetch.requests.filter(
      (url) =>
        url.startsWith('/content/strokes/') && !url.endsWith('/index.json'),
    );
    expect(strokeFileRequests).toEqual([]);
  });

  it('S6.1-AC1 Chữ được yêu cầu rỗng: should show "Chưa có dữ liệu nét cho chữ này." without figure, replay button or any stroke request when opening /characters/stroke-order', async () => {
    openRoute('/characters/stroke-order');

    // Màn thứ tự nét được mở, không rơi vào trang NotFound.
    await screen.findByRole(
      'heading',
      { name: 'Thứ tự nét' },
      { timeout: 3000 },
    );
    expect(
      screen.queryByRole('heading', { name: 'Không tìm thấy trang' }),
    ).not.toBeInTheDocument();

    expect(
      await screen.findByText('Chưa có dữ liệu nét cho chữ này.'),
    ).toBeInTheDocument();

    // Không hiện khối animation, không hiện nút "Phát lại".
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(document.querySelectorAll('figure')).toHaveLength(0);
    expect(
      screen.queryByRole('button', { name: 'Phát lại' }),
    ).not.toBeInTheDocument();

    // Chữ rỗng bị loại trước khi đọc nguồn: không request nào tới dữ liệu nét.
    const strokeRequests = env.strokeFetch.requests.filter((url) =>
      url.startsWith('/content/strokes/'),
    );
    expect(strokeRequests).toEqual([]);
  });

  it('S6.1-AC1 Chữ được yêu cầu không phải chữ Hán: should show "Chưa có dữ liệu nét cho chữ này." without figure, replay button or stroke file request when opening /characters/abc/stroke-order', async () => {
    openRoute('/characters/abc/stroke-order');

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

    // Chữ không hợp lệ bị loại trước khi đọc nguồn: không request nào tới dữ liệu nét.
    const strokeRequests = env.strokeFetch.requests.filter((url) =>
      url.startsWith('/content/strokes/'),
    );
    expect(strokeRequests).toEqual([]);
  });
});
