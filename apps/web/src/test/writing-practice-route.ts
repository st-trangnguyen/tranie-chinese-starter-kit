import { expect } from 'vitest';

import { FakeHanziWriter } from '@test/mocks/hanzi-writer';
import { screen, waitFor } from '@test/render';
import { openRoute, type TestRouter } from '@test/stroke-order-route';

/**
 * Helper dùng chung cho test màn luyện viết (S6.2) mở qua bảng route thật.
 * Test file vẫn phải tự gọi `setupStrokeOrderRoute()` và `vi.mock('hanzi-writer', …)`.
 */

export const SHI = '十';

/** Nét dài (600 đơn vị hộp 1024, ≥ 30): đủ dài để tính là một lần viết sai. */
export const LONG_STROKE_POINTS = [
  { x: 100, y: 100 },
  { x: 100, y: 700 },
];

export interface ActiveQuizPad {
  pad: HTMLElement;
  writer: FakeHanziWriter;
  router: TestRouter;
}

/** Mở màn luyện viết của 十, chờ khung viết hiện và quiz của writer kích hoạt. */
export const openShiPadWithActiveQuiz = async (): Promise<ActiveQuizPad> => {
  const { router } = openRoute(
    `/characters/${encodeURIComponent(SHI)}/writing-practice`,
  );
  const pad = await screen.findByRole(
    'figure',
    { name: `Khung viết chữ ${SHI}` },
    { timeout: 3000 },
  );
  await waitFor(() => expect(FakeHanziWriter.last().isQuizActive).toBe(true));
  return { pad, writer: FakeHanziWriter.last(), router };
};
