import { describe, expect, it, vi } from 'vitest';

import { FakeHanziWriter } from '@test/mocks/hanzi-writer';
import { act, screen, userEvent, waitFor, within } from '@test/render';
import { mockStrokeFetch } from '@test/mocks/stroke-fetch';
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

describe('StrokeOrderContainer — dữ liệu nét hỏng hoặc sai cấu trúc', () => {
  it('S6.1-AC1 Dữ liệu nét hỏng hoặc sai cấu trúc: should show "Có lỗi xảy ra" with "Thử lại" and no figure or "Phát lại" when 人.json is not JSON', async () => {
    env.replaceStrokeFetch({
      '人.json': () => new Response('<!doctype html>', { status: 200 }),
    });

    await expectLoadErrorScreen();
  });

  it('S6.1-AC1 Dữ liệu nét hỏng hoặc sai cấu trúc: should show "Có lỗi xảy ra" with "Thử lại" and no figure or "Phát lại" when 人.json is valid JSON without strokes', async () => {
    env.replaceStrokeFetch({
      '人.json': () =>
        new Response(
          JSON.stringify({
            medians: [
              [
                [0, 0],
                [10, 10],
              ],
            ],
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
    });

    await expectLoadErrorScreen();
  });
});

/** Phản hồi file nét của 人 theo lượt gọi: `responders[i]` cho lần gọi thứ i+1 (lần cuối lặp lại). */
const respondByAttempt = (
  ...responders: ReadonlyArray<() => Response | Promise<Response>>
): (() => Response | Promise<Response>) => {
  let calls = 0;
  return () => {
    const responder = responders[Math.min(calls, responders.length - 1)];
    calls += 1;
    if (!responder) {
      throw new Error('Thiếu phản hồi cho file nét');
    }
    return responder();
  };
};

const fail500 = (): Response => new Response('', { status: 500 });

/** Phản hồi thật (file nét build sẵn) bằng một mock fetch mặc định riêng. */
const realStrokeResponse = (): Promise<Response> =>
  mockStrokeFetch().fetch(`/content/strokes/${encodeURIComponent('人')}.json`);

const strokeFileRequestsOfRen = (): string[] =>
  env.strokeFetch.requests.filter(
    (url) => url === `/content/strokes/${encodeURIComponent('人')}.json`,
  );

describe('StrokeOrderContainer — thử lại sau khi tải lỗi', () => {
  it('S6.1-AC1 Thử lại sau khi tải lỗi: should hide the error and auto-play 2 strokes of 人 with "Phát lại" after clicking "Thử lại" when the second load succeeds', async () => {
    env.replaceStrokeFetch({
      '人.json': respondByAttempt(fail500, realStrokeResponse),
    });
    const user = userEvent.setup();

    await expectLoadErrorScreen();
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));

    // Lỗi biến mất, hiện khối animation của 人 và nút "Phát lại".
    const figure = await screen.findByRole(
      'img',
      { name: 'Thứ tự nét chữ 人' },
      { timeout: 3000 },
    );
    expect(screen.queryByText('Có lỗi xảy ra')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Thử lại' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Phát lại' }),
    ).toBeInTheDocument();
    expect(strokeFileRequestsOfRen()).toHaveLength(2);

    // Animation tự phát và vẽ đủ 2 nét.
    for (let drawn = 1; drawn <= 2; drawn += 1) {
      await waitFor(() => {
        expect(FakeHanziWriter.last().pendingStrokes).toHaveLength(1);
      });
      await act(async () => {
        FakeHanziWriter.last().finishStroke();
      });
      await waitFor(() => {
        expect(figure).toHaveAttribute(
          'data-drawn-stroke-count',
          String(drawn),
        );
      });
    }
    expect(figure).toHaveAttribute('data-drawn-stroke-count', '2');
  });

  it('S6.1-AC1 Thử lại sau khi tải lỗi: should still show "Có lỗi xảy ra" with "Thử lại" and no figure or "Phát lại" after clicking "Thử lại" when the second load also fails (TC-S6.1-AC1-28)', async () => {
    env.replaceStrokeFetch({
      '人.json': respondByAttempt(fail500, fail500),
    });
    const user = userEvent.setup();

    await expectLoadErrorScreen();
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));

    // Đã tải lại đúng một lần nữa, và lần này cũng lỗi.
    await waitFor(() => {
      expect(strokeFileRequestsOfRen()).toHaveLength(2);
    });
    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText('Có lỗi xảy ra')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument();
    expect(document.querySelectorAll('figure')).toHaveLength(0);
    expect(
      screen.queryByRole('button', { name: 'Phát lại' }),
    ).not.toBeInTheDocument();
  });
});
