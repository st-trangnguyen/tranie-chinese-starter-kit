import { act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FakeHanziWriter } from '@test/mocks/hanzi-writer';
import { screen } from '@test/render';
import {
  openRoute,
  setupStrokeOrderRoute,
  stubReducedMotion,
} from '@test/stroke-order-route';

const PATH_REN = `/characters/${encodeURIComponent('人')}/stroke-order`;
const PATH_LONG = `/characters/${encodeURIComponent('龘')}/stroke-order`;

/** Chờ khối thứ tự nét của 人 xuất hiện. */
const findRenFigure = (): Promise<HTMLElement> =>
  screen.findByRole('img', { name: 'Thứ tự nét chữ 人' }, { timeout: 3000 });

/** Khối animation: có nút "Phát lại", không có số thứ tự nét tĩnh. */
const expectAnimation = (figure: HTMLElement): void => {
  expect(figure.querySelectorAll('text')).toHaveLength(0);
  expect(screen.getByRole('button', { name: 'Phát lại' })).toBeInTheDocument();
};

/** Khối tĩnh: đánh số 1…2 cho 人, không có nút "Phát lại". */
const expectStatic = (figure: HTMLElement): void => {
  const labels = Array.from(figure.querySelectorAll('text')).map(
    (label) => label.textContent,
  );
  expect(labels).toEqual(['1', '2']);
  expect(
    screen.queryByRole('button', { name: 'Phát lại' }),
  ).not.toBeInTheDocument();
};

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

  it('S6.1-AC1 Đổi giảm chuyển động khi đang ở màn: should keep the 人 animation and "Phát lại" after reduced motion turns on, and show 人 statically 1…2 when the screen is opened again', async () => {
    // Người học mở màn 人 khi giảm chuyển động đang tắt.
    const motion = stubReducedMotion(false);
    const firstVisit = openRoute(PATH_REN);
    expectAnimation(await findRenFigure());
    const writerCount = FakeHanziWriter.instances.length;

    // Bật giảm chuyển động mà không rời màn: hệ điều hành phát sự kiện `change`.
    act(() => {
      motion.setReducedMotion(true);
    });

    // Màn vẫn giữ khối animation và nút "Phát lại" như lúc mở, không dựng lại animation.
    expectAnimation(await findRenFigure());
    expect(FakeHanziWriter.instances).toHaveLength(writerCount);

    // Rời màn rồi mở lại màn của 人: lúc mở lại giảm chuyển động đang bật.
    firstVisit.unmount();
    openRoute(PATH_REN);
    expectStatic(await findRenFigure());
  });

  it('S6.1-AC1 Đổi giảm chuyển động khi đang ở màn: should show 人 statically after navigating 人 → 龘 → 人 in the same app once reduced motion is on', async () => {
    const motion = stubReducedMotion(false);
    const { router } = openRoute(PATH_REN);
    expectAnimation(await findRenFigure());

    // Bật giảm chuyển động khi đang ở màn 人: màn hiện tại không đổi.
    act(() => {
      motion.setReducedMotion(true);
    });
    expectAnimation(await findRenFigure());

    // Đổi sang chữ khác trong cùng app (mở màn mới của 龘).
    await act(async () => {
      await router.navigate(PATH_LONG);
    });
    expect(
      await screen.findByText('Chưa có dữ liệu nét cho chữ này.'),
    ).toBeInTheDocument();

    // Quay lại 人: đây là một lần mở màn mới nên xét giảm chuyển động đang bật.
    await act(async () => {
      await router.navigate(PATH_REN);
    });
    expectStatic(await findRenFigure());
  });
});
