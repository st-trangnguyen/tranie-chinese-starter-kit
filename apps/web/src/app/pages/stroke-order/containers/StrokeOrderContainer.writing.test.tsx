import { describe, expect, it, vi } from 'vitest';

import { screen, userEvent } from '@test/render';
import {
  openRoute,
  setupStrokeOrderRoute,
  stubReducedMotion,
  type TestRouter,
} from '@test/stroke-order-route';

// Ranh giới ngoài: thư viện vẽ nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

setupStrokeOrderRoute();

const PERSON = '人';
const STROKE_ORDER_PATH = `/characters/${encodeURIComponent(PERSON)}/stroke-order`;
const WRITING_PRACTICE_PATH = `/characters/${encodeURIComponent(PERSON)}/writing-practice`;

/** Bấm "Tập viết" trên màn thứ tự nét của 人 đã hiện, rồi kiểm tra màn luyện viết của 人. */
const clickWritingPracticeAndExpectPad = async (
  router: TestRouter,
): Promise<void> => {
  await screen.findByRole(
    'img',
    { name: `Thứ tự nét chữ ${PERSON}` },
    { timeout: 3000 },
  );

  const user = userEvent.setup();
  await user.click(screen.getByRole('link', { name: 'Tập viết' }));

  // Màn luyện viết của 人 mở, đúng một khung viết và là khung của 人.
  await screen.findByRole(
    'figure',
    { name: `Khung viết chữ ${PERSON}` },
    { timeout: 3000 },
  );
  expect(screen.getAllByRole('figure')).toHaveLength(1);
  expect(decodeURIComponent(router.state.location.pathname)).toBe(
    decodeURIComponent(WRITING_PRACTICE_PATH),
  );
};

/** Số lần Tab tối đa trước khi coi là link "Tập viết" không tới được bằng bàn phím. */
const MAX_TABS = 30;

describe('StrokeOrderContainer — vào luyện viết', () => {
  it('S6.2-AC1 Vào luyện viết từ màn xem thứ tự nét: should open the writing practice screen of 人 with exactly one "Khung viết chữ 人" after clicking "Tập viết"', async () => {
    const { router } = openRoute(STROKE_ORDER_PATH);

    await clickWritingPracticeAndExpectPad(router);
  });

  it('S6.2-AC1 Vào luyện viết từ màn xem thứ tự nét: should open the writing practice screen of 人 from the static stroke order view when reduced motion is on', async () => {
    // Người học bật giảm chuyển động: màn S6.1 hiện khối tĩnh thay vì animation.
    stubReducedMotion(true);
    const { router } = openRoute(STROKE_ORDER_PATH);

    await clickWritingPracticeAndExpectPad(router);
  });

  it('S6.2-AC1 Nút Tập viết bấm được bằng bàn phím: should open the writing practice screen of 人 after tabbing to "Tập viết" and pressing Enter', async () => {
    const { router } = openRoute(STROKE_ORDER_PATH);
    await screen.findByRole(
      'img',
      { name: `Thứ tự nét chữ ${PERSON}` },
      { timeout: 3000 },
    );

    const user = userEvent.setup();
    const writingLink = screen.getByRole('link', { name: 'Tập viết' });
    for (
      let i = 0;
      i < MAX_TABS && document.activeElement !== writingLink;
      i += 1
    ) {
      await user.tab();
    }
    expect(writingLink).toHaveFocus();

    await user.keyboard('{Enter}');

    await screen.findByRole(
      'figure',
      { name: `Khung viết chữ ${PERSON}` },
      { timeout: 3000 },
    );
    expect(decodeURIComponent(router.state.location.pathname)).toBe(
      decodeURIComponent(WRITING_PRACTICE_PATH),
    );
  });
});
