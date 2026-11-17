import { describe, expect, it, vi } from 'vitest';

import { FakeHanziWriter } from '@test/mocks/hanzi-writer';
import { mockStrokeFetch } from '@test/mocks/stroke-fetch';
import { screen, userEvent, waitFor, within } from '@test/render';
import { openRoute, setupStrokeOrderRoute } from '@test/stroke-order-route';

// Ranh giới ngoài: thư viện vẽ/chấm nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

const env = setupStrokeOrderRoute();

const PERSON = '人';
const STROKE_FILE_OF_PERSON = `/content/strokes/${encodeURIComponent(PERSON)}.json`;

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
  mockStrokeFetch().fetch(STROKE_FILE_OF_PERSON);

const strokeFileRequestsOfPerson = (): string[] =>
  env.strokeFetch.requests.filter((url) => url === STROKE_FILE_OF_PERSON);

/** Mở màn luyện viết của 人 và kiểm tra trạng thái lỗi tải dữ liệu nét. */
const expectLoadErrorScreen = async (): Promise<void> => {
  openRoute(`/characters/${encodeURIComponent(PERSON)}/writing-practice`);

  await screen.findByRole('heading', { name: 'Tập viết' }, { timeout: 3000 });

  // Thông báo "Có lỗi xảy ra" trong vùng alert, kèm nút "Thử lại".
  const alert = await screen.findByRole('alert', {}, { timeout: 3000 });
  expect(within(alert).getByText('Có lỗi xảy ra')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument();

  // Không có khung viết, không tạo hanzi-writer.
  expect(screen.queryByRole('figure')).not.toBeInTheDocument();
  expect(document.querySelectorAll('figure')).toHaveLength(0);
  expect(FakeHanziWriter.instances).toHaveLength(0);

  // Liên kết "Xem thứ tự nét" vẫn còn.
  expect(
    screen.getByRole('link', { name: 'Xem thứ tự nét' }),
  ).toBeInTheDocument();
};

describe('WritingPracticeContainer lỗi tải dữ liệu nét', () => {
  it('should show "Có lỗi xảy ra" alert with "Thử lại", no writing pad and keep "Xem thứ tự nét" when 人.json responds HTTP 500', async () => {
    env.replaceStrokeFetch({ '人.json': fail500 });

    await expectLoadErrorScreen();
  });

  it('should show "Có lỗi xảy ra" alert with "Thử lại", no writing pad and keep "Xem thứ tự nét" when fetching 人.json fails with a network error', async () => {
    env.replaceStrokeFetch({
      '人.json': () => Promise.reject(new TypeError('Failed to fetch')),
    });

    await expectLoadErrorScreen();
  });

  it('should hide the error and show the writing pad of 人 after clicking "Thử lại" when the second load succeeds', async () => {
    env.replaceStrokeFetch({
      '人.json': respondByAttempt(fail500, realStrokeResponse),
    });
    const user = userEvent.setup();

    await expectLoadErrorScreen();
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));

    expect(
      await screen.findByRole(
        'figure',
        { name: `Khung viết chữ ${PERSON}` },
        { timeout: 3000 },
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText('Có lỗi xảy ra')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Thử lại' }),
    ).not.toBeInTheDocument();
    expect(strokeFileRequestsOfPerson()).toHaveLength(2);
  });

  it('should still show "Có lỗi xảy ra" with "Thử lại" and no writing pad after clicking "Thử lại" when the second load also fails', async () => {
    env.replaceStrokeFetch({
      '人.json': respondByAttempt(fail500, fail500),
    });
    const user = userEvent.setup();

    await expectLoadErrorScreen();
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));

    await waitFor(() => {
      expect(strokeFileRequestsOfPerson()).toHaveLength(2);
    });
    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText('Có lỗi xảy ra')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument();
    expect(document.querySelectorAll('figure')).toHaveLength(0);
  });
});
