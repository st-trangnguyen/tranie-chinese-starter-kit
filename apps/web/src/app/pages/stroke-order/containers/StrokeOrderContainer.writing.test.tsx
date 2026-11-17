import { describe, expect, it, vi } from 'vitest';

import { screen, userEvent, waitFor, within } from '@test/render';
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

const env = setupStrokeOrderRoute();

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

/** Màn không có link hay nút nào tên "Tập viết", cũng không có chữ "Tập viết". */
const expectNoWritingPracticeEntry = (): void => {
  expect(
    screen.queryByRole('link', { name: 'Tập viết' }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Tập viết' }),
  ).not.toBeInTheDocument();
  expect(screen.queryByText('Tập viết')).not.toBeInTheDocument();
};

describe('StrokeOrderContainer — không có Tập viết khi chưa có dữ liệu nét', () => {
  it('S6.2-AC1 Không có nút Tập viết khi chữ không có dữ liệu nét: should show "Chưa có dữ liệu nét cho chữ này." and no "Tập viết" link or button when opening 龘', async () => {
    openRoute(`/characters/${encodeURIComponent('龘')}/stroke-order`);

    await screen.findByRole(
      'heading',
      { name: 'Thứ tự nét' },
      { timeout: 3000 },
    );
    expect(
      await screen.findByText('Chưa có dữ liệu nét cho chữ này.'),
    ).toBeInTheDocument();

    expectNoWritingPracticeEntry();
  });

  it('S6.2-AC1 Không có nút Tập viết khi chữ không có dữ liệu nét: should show no "Tập viết" link or button while stroke data of 人 is still loading', async () => {
    // Ranh giới ngoài: file nét của 人 không bao giờ trả về (đang tải).
    env.replaceStrokeFetch({
      [`${PERSON}.json`]: () => new Promise<Response>(() => undefined),
    });

    openRoute(STROKE_ORDER_PATH);

    await waitFor(() =>
      expect(env.strokeFetch.requests).toContain(
        `/content/strokes/${encodeURIComponent(PERSON)}.json`,
      ),
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Đang tải…');

    expectNoWritingPracticeEntry();
  });

  it('S6.2-AC1 Không có nút Tập viết khi chữ không có dữ liệu nét: should show no "Tập viết" link or button when loading stroke data of 人 fails', async () => {
    env.replaceStrokeFetch({
      [`${PERSON}.json`]: () => new Response('', { status: 500 }),
    });

    openRoute(STROKE_ORDER_PATH);

    const alert = await screen.findByRole('alert', {}, { timeout: 3000 });
    expect(within(alert).getByText('Có lỗi xảy ra')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument();

    expectNoWritingPracticeEntry();
  });
});
