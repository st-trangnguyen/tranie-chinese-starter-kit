import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  LESSON_ID,
  PERSON,
  TEN,
  answerToneChoiceAndContinue,
  emitCorrectStroke,
  findLessonPad,
  setupLessonStrokeWrite,
  waitForActiveQuiz,
  type TestLesson,
} from '@test/lesson-stroke-write.helpers';
import { act, screen, userEvent, waitFor } from '@test/render';
import { openRoute, type TestRouter } from '@test/stroke-order-route';

// Ranh giới ngoài: thư viện vẽ/chấm nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

const env = setupLessonStrokeWrite();

const LESSON_PATH = `/lessons/${LESSON_ID}`;
const STROKE_ORDER_PATH = `/characters/${encodeURIComponent(PERSON)}/stroke-order`;
/** Bài 5 câu: câu 1, 2 chọn thanh 八; câu 3 viết 人; câu 4 viết 十; câu 5 chọn thanh 八. */
const FIVE_EXERCISE_LESSON: TestLesson = {
  id: LESSON_ID,
  type: 'lesson',
  title: 'Bài 5 câu có câu viết',
  exercises: [
    { id: 'e1', kind: 'tone-choice', wordId: '八' },
    { id: 'e2', kind: 'tone-choice', wordId: '八' },
    { id: 'e3', kind: 'stroke-write', wordId: PERSON },
    { id: 'e4', kind: 'stroke-write', wordId: TEN },
    { id: 'e5', kind: 'tone-choice', wordId: '八' },
  ],
};
const START_TIME = new Date('2026-11-17T08:00:00Z');
const SECOND = 1000;
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

  describe('quay lại bài từ màn thứ tự nét rồi làm tiếp', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    /** Viết đủ 2 nét đúng của `character` rồi bấm "Tiếp tục". */
    const writeTwoStrokesAndContinue = async (
      user: User,
      character: string,
    ): Promise<void> => {
      await findLessonPad(character);
      const writer = await waitForActiveQuiz(character);
      emitCorrectStroke(writer);
      emitCorrectStroke(writer);
      await user.click(await screen.findByRole('button', { name: 'Tiếp tục' }));
    };

    it('S7.1-AC2 Quay lại bài thì tổng kết chỉ tính từ câu viết đó: should show "Đúng 3 / 3 câu", "Sai 0 câu" and time 1:00 (not 3:00) after answering questions 1-2, spending 120 s on the 人 writing question, opening "Xem thứ tự nét", going back and finishing questions 3-5 in 60 s', async () => {
      // Chỉ giả đồng hồ Date; setTimeout thật để user-event và waitFor chạy bình thường.
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(START_TIME);
      env.replaceFetch({ lesson: FIVE_EXERCISE_LESSON });
      const { router } = openRoute(LESSON_PATH);
      const user = userEvent.setup();

      await answerToneChoiceAndContinue(user);
      await answerToneChoiceAndContinue(user);
      await findLessonPad(PERSON);
      expect(screen.getByRole('progressbar')).toHaveAccessibleName('Câu 3 / 5');

      vi.setSystemTime(START_TIME.getTime() + 120 * SECOND);
      await user.click(getStrokeOrderLink());
      await expectPersonStrokeOrderScreen(router);
      await act(async () => {
        await router.navigate(-1);
      });

      await writeTwoStrokesAndContinue(user, PERSON);
      await writeTwoStrokesAndContinue(user, TEN);
      await user.click(await screen.findByRole('button', { name: 'Thanh 1' }));
      vi.setSystemTime(START_TIME.getTime() + 180 * SECOND);
      await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));

      expect(
        await screen.findByText('Bạn đã làm xong các câu của bài này.'),
      ).toBeInTheDocument();
      expect(screen.getByText('Đúng 3 / 3 câu')).toBeInTheDocument();
      expect(screen.getByText('Sai 0 câu')).toBeInTheDocument();
      // Mục "Thời gian" (m:ss): 60 s từ lúc mở lại bài, không phải 180 s từ lúc mở lần đầu.
      const timeItem = screen.getByText('Thời gian').closest('div');
      expect(timeItem).toHaveTextContent('1:00');
      expect(timeItem).not.toHaveTextContent('3:00');
    });
  });
});
