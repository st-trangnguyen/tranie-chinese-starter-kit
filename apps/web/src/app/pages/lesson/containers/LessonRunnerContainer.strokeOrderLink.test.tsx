import { describe, expect, it, vi } from 'vitest';

import {
  LESSON_ID,
  PERSON,
  answerToneChoiceAndContinue,
  findLessonPad,
  setupLessonStrokeWrite,
} from '@test/lesson-stroke-write.helpers';
import { screen, userEvent } from '@test/render';
import { openRoute, type TestRouter } from '@test/stroke-order-route';

// Ranh giới ngoài: thư viện vẽ/chấm nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

setupLessonStrokeWrite();

const LESSON_PATH = `/lessons/${LESSON_ID}`;
const STROKE_ORDER_PATH = `/characters/${encodeURIComponent(PERSON)}/stroke-order`;

type User = ReturnType<typeof userEvent.setup>;

interface LessonAtPersonWrite {
  router: TestRouter;
  user: User;
}

/**
 * Mở bài thử qua bảng route thật, trả lời đúng câu 1 (chọn thanh 八), dừng ở câu viết 人
 * khi khung viết đã hiện.
 */
const openLessonAtPersonWrite = async (): Promise<LessonAtPersonWrite> => {
  const { router } = openRoute(LESSON_PATH);
  const user = userEvent.setup();
  await answerToneChoiceAndContinue(user);
  await findLessonPad(PERSON);
  return { router, user };
};

/** Liên kết "Xem thứ tự nét" của câu viết đang hiện. */
const getStrokeOrderLink = (): HTMLElement =>
  screen.getByRole('link', { name: 'Xem thứ tự nét' });

/** Màn xem thứ tự nét (S6.1) của 人 đang hiện: đúng địa chỉ, có hình thứ tự nét và link "Tập viết". */
const expectPersonStrokeOrderScreen = async (
  router: TestRouter,
): Promise<void> => {
  await screen.findByRole(
    'img',
    { name: `Thứ tự nét chữ ${PERSON}` },
    { timeout: 3000 },
  );
  expect(router.state.location.pathname).toBe(STROKE_ORDER_PATH);
  expect(screen.getByRole('link', { name: 'Tập viết' })).toBeInTheDocument();
};

describe('LessonRunnerContainer — lối vào thứ tự nét từ câu viết', () => {
  it('S7.1-AC2 Từ câu viết mở màn xem thứ tự nét: should open the stroke order screen of 人 after clicking "Xem thứ tự nét" on the 人 writing exercise', async () => {
    const { router, user } = await openLessonAtPersonWrite();

    await user.click(getStrokeOrderLink());

    await expectPersonStrokeOrderScreen(router);
  });
});
