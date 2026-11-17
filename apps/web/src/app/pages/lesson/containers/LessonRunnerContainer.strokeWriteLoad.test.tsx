import { describe, expect, it, vi } from 'vitest';

import {
  PERSON,
  answerToneChoiceAndContinue,
  renderLessonRunner,
  setupLessonStrokeWrite,
} from '@test/lesson-stroke-write.helpers';
import { screen, waitFor } from '@test/render';

// Ranh giới ngoài: thư viện vẽ/chấm nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

const env = setupLessonStrokeWrite();

/** Phản hồi không bao giờ tới: dữ liệu nét của câu viết mãi ở trạng thái đang tải. */
const neverResolves = (): Promise<Response> =>
  new Promise<Response>(() => undefined);

/** Hai kiểu tải dữ liệu nét thất bại: server lỗi và file nét không phải JSON hợp lệ. */
const STROKE_LOAD_FAILURES: readonly {
  name: string;
  respond: () => Response;
}[] = [
  { name: 'phản hồi 500', respond: () => new Response('', { status: 500 }) },
  {
    name: 'JSON hỏng',
    respond: () =>
      new Response('{ "strokes": [', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
  },
];

describe('LessonRunnerContainer — trạng thái tải câu viết', () => {
  it('S7.1-AC1 Câu viết đang tải dữ liệu nét: should show status "Đang tải…" without the writing pad, the "Xem thứ tự nét" link or a "Tiếp tục" button while 人.json is still loading', async () => {
    const strokeFetch = env.replaceFetch({
      strokeOverrides: { '人.json': neverResolves },
    });
    const { user } = renderLessonRunner();
    await answerToneChoiceAndContinue(user);

    expect(screen.getByRole('progressbar')).toHaveAccessibleName('Câu 2 / 3');
    // Đã thực sự gọi file nét của 人 (và phản hồi chưa về).
    await waitFor(() => {
      expect(
        strokeFetch.requests.some((url) =>
          decodeURIComponent(url).endsWith(`/${PERSON}.json`),
        ),
      ).toBe(true);
    });

    const statuses = await screen.findAllByRole('status');
    expect(statuses.map((status) => status.textContent)).toContain('Đang tải…');
    expect(
      screen.queryByRole('figure', { name: `Khung viết chữ ${PERSON}` }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Xem thứ tự nét' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Tiếp tục' }),
    ).not.toBeInTheDocument();
  });

  it.each(STROKE_LOAD_FAILURES)(
    'S7.1-AC1 Câu viết tải dữ liệu nét lỗi ($name): should show alert "Có lỗi xảy ra" with "Thử lại" and "Bỏ qua câu này" buttons, without the writing pad, the "Xem thứ tự nét" link or "Chưa có dữ liệu nét cho chữ này."',
    async ({ respond }) => {
      const strokeFetch = env.replaceFetch({
        strokeOverrides: { '人.json': respond },
      });
      const { user } = renderLessonRunner();
      await answerToneChoiceAndContinue(user);

      expect(screen.getByRole('progressbar')).toHaveAccessibleName('Câu 2 / 3');
      await waitFor(() => {
        expect(
          strokeFetch.requests.some((url) =>
            decodeURIComponent(url).endsWith(`/${PERSON}.json`),
          ),
        ).toBe(true);
      });

      const alerts = await screen.findAllByRole('alert');
      expect(alerts.map((alert) => alert.textContent).join(' ')).toContain(
        'Có lỗi xảy ra',
      );
      expect(
        screen.getByRole('button', { name: 'Thử lại' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Bỏ qua câu này' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('figure', { name: `Khung viết chữ ${PERSON}` }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: 'Xem thứ tự nét' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Chưa có dữ liệu nét cho chữ này.'),
      ).not.toBeInTheDocument();
    },
  );
});
