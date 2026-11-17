import { describe, expect, it, vi } from 'vitest';

import {
  LESSON_ID,
  PERSON,
  answerToneChoiceAndContinue,
  emitCorrectStroke,
  findLessonPad,
  setupLessonStrokeWrite,
  waitForActiveQuiz,
} from '@test/lesson-stroke-write.helpers';
import { act, screen, userEvent, waitFor } from '@test/render';
import { openRoute, type TestRouter } from '@test/stroke-order-route';

// Ranh giới ngoài: thư viện vẽ/chấm nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

setupLessonStrokeWrite();

const LESSON_PATH = `/lessons/${LESSON_ID}`;
const STROKE_ORDER_PATH = `/characters/${encodeURIComponent(PERSON)}/stroke-order`;
/** Số lần Tab tối đa từ đầu trang tới link, đủ rộng cho header + câu viết. */
const MAX_TAB_PRESSES = 30;

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

/**
 * Nhấn Tab từ vị trí focus hiện tại cho tới khi `target` có focus (tối đa MAX_TAB_PRESSES lần).
 * Trả về các phần tử đã lần lượt nhận focus trên đường đi.
 */
const tabUntilFocused = async (
  user: User,
  target: HTMLElement,
): Promise<Element[]> => {
  const visited: Element[] = [];
  for (
    let i = 0;
    i < MAX_TAB_PRESSES && document.activeElement !== target;
    i += 1
  ) {
    await user.tab();
    if (document.activeElement) {
      visited.push(document.activeElement);
    }
  }
  return visited;
};

describe('LessonRunnerContainer — lối vào thứ tự nét từ câu viết', () => {
  it('S7.1-AC2 Từ câu viết mở màn xem thứ tự nét: should open the stroke order screen of 人 after clicking "Xem thứ tự nét" on the 人 writing exercise', async () => {
    const { router, user } = await openLessonAtPersonWrite();

    await user.click(getStrokeOrderLink());

    await expectPersonStrokeOrderScreen(router);
  });

  it('S7.1-AC2 Liên kết Xem thứ tự nét dùng được bằng bàn phím: should open the stroke order screen of 人 when tabbing past the writing pad to "Xem thứ tự nét" and pressing Enter', async () => {
    const { router, user } = await openLessonAtPersonWrite();
    const pad = await findLessonPad(PERSON);
    const link = getStrokeOrderLink();

    const visited = await tabUntilFocused(user, link);

    expect(visited).toContain(pad);
    expect(link).toHaveFocus();

    await user.keyboard('{Enter}');

    await expectPersonStrokeOrderScreen(router);
  });

  it('S7.1-AC2 Quay lại bài từ màn thứ tự nét: should show "Câu 2 / 3" with an empty 人 writing pad after opening the stroke order screen from question 2 and going back', async () => {
    const { router, user } = await openLessonAtPersonWrite();
    const writer = await waitForActiveQuiz(PERSON);
    emitCorrectStroke(writer);
    await waitFor(() => {
      expect(
        screen.getByRole('figure', { name: `Khung viết chữ ${PERSON}` }),
      ).toHaveAttribute('data-completed-stroke-count', '1');
    });

    await user.click(getStrokeOrderLink());
    await expectPersonStrokeOrderScreen(router);

    await act(async () => {
      await router.navigate(-1);
    });

    const pad = await findLessonPad(PERSON);
    expect(router.state.location.pathname).toBe(LESSON_PATH);
    expect(screen.getByRole('progressbar')).toHaveAccessibleName('Câu 2 / 3');
    expect(pad).toHaveAttribute('data-completed-stroke-count', '0');
  });
});
