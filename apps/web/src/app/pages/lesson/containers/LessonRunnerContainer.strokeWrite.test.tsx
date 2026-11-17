import { describe, expect, it, vi } from 'vitest';

import { createDatabase } from '@core/helpers/db.helper';
import { DexieProgressStore } from '@core/services/progress-store.service';
import {
  LESSON_ID,
  PERSON,
  STROKE_WRITE_LESSON,
  TEN,
  answerToneChoiceAndContinue,
  emitCorrectStroke,
  emitMistake,
  findLessonPad,
  outlinePathsOf,
  renderLessonRunner,
  setupLessonStrokeWrite,
  waitForActiveQuiz,
} from '@test/lesson-stroke-write.helpers';
import { screen, waitFor } from '@test/render';

// Ranh giới ngoài: thư viện vẽ/chấm nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

const env = setupLessonStrokeWrite();

const MAX_TABS = 20;

/** Đọc tiến độ đã ghi của bài thử trong IndexedDB. */
const readSavedProgress = async (): Promise<
  Awaited<ReturnType<DexieProgressStore['getLessonProgress']>>
> => {
  const db = createDatabase();
  try {
    return await new DexieProgressStore(db).getLessonProgress(LESSON_ID);
  } finally {
    db.close();
  }
};

/** Bài thử đưa câu viết 十 lên ngay sau câu chọn thanh. */
const TEN_FIRST_LESSON = {
  ...STROKE_WRITE_LESSON,
  exercises: [
    { id: 'e1', kind: 'tone-choice', wordId: '八' },
    { id: 'e3', kind: 'stroke-write', wordId: TEN },
  ],
};

/** Bài thử có câu viết 十 ở giữa, theo sau là câu chọn thanh khác. */
const TEN_THEN_TONE_LESSON = {
  ...STROKE_WRITE_LESSON,
  exercises: [
    { id: 'e1', kind: 'tone-choice', wordId: '八' },
    { id: 'e3', kind: 'stroke-write', wordId: TEN },
    { id: 'e4', kind: 'tone-choice', wordId: '八' },
  ],
};

describe('LessonRunnerContainer — câu viết', () => {
  it('S7.1-AC1 Câu viết hiện khung viết của đúng chữ: should show the empty writing pad of 人 with its 2-stroke outline, without the unsupported-kind fallback, when reaching the stroke-write exercise', async () => {
    const { user } = renderLessonRunner();
    await answerToneChoiceAndContinue(user);

    expect(screen.getByRole('progressbar')).toHaveAccessibleName('Câu 2 / 3');
    expect(screen.queryByText('Dạng bài này chưa có.')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Bỏ qua câu này' }),
    ).not.toBeInTheDocument();

    const pad = await findLessonPad(PERSON);
    expect(outlinePathsOf(pad)).toHaveLength(2);
    expect(pad).toHaveAttribute('data-completed-stroke-count', '0');
  });

  it('S7.1-AC1 Khung viết trong bài nhận focus bàn phím: should move keyboard focus onto the writing pad figure of 人, whose accessible name contains 人, when tabbing on the stroke-write exercise', async () => {
    const { user } = renderLessonRunner();
    await answerToneChoiceAndContinue(user);
    const pad = await findLessonPad(PERSON);

    // Tab tới khung viết (giới hạn số lần để không lặp vô hạn).
    for (
      let press = 0;
      press < MAX_TABS && document.activeElement !== pad;
      press += 1
    ) {
      await user.tab();
    }

    expect(document.activeElement).toBe(pad);
    expect(pad).toHaveAccessibleName(expect.stringContaining(PERSON));
  });

  it('S7.1-AC1 Viết sai nét trong câu viết chưa kết thúc câu: should show alert "Sai nét. Viết lại nét này." without "Đúng", "Sai" or a "Tiếp tục" button after a long wrong stroke on 十', async () => {
    env.replaceFetch({ lesson: TEN_FIRST_LESSON });
    const { user } = renderLessonRunner();
    await answerToneChoiceAndContinue(user);
    await findLessonPad(TEN);
    const writer = await waitForActiveQuiz(TEN);

    emitMistake(writer);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Sai nét. Viết lại nét này.',
    );
    expect(screen.queryByText('Đúng')).not.toBeInTheDocument();
    expect(screen.queryByText('Sai')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Tiếp tục' }),
    ).not.toBeInTheDocument();
  });

  it('S7.1-AC1 Viết xong chữ thì câu được tính đúng: should show "Đúng" and a "Tiếp tục" button after 1 mistake then 2 correct strokes on 十, and go to "Câu 3 / 3" when clicking "Tiếp tục"', async () => {
    env.replaceFetch({ lesson: TEN_THEN_TONE_LESSON });
    const { user } = renderLessonRunner();
    await answerToneChoiceAndContinue(user);
    await findLessonPad(TEN);
    const writer = await waitForActiveQuiz(TEN);

    emitMistake(writer);
    emitCorrectStroke(writer);
    emitCorrectStroke(writer);

    expect(await screen.findByText('Đúng')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));

    expect(screen.getByRole('progressbar')).toHaveAccessibleName('Câu 3 / 3');
    expect(
      await screen.findByRole('button', { name: 'Thanh 1' }),
    ).toBeInTheDocument();
  });
  it('S7.1-AC1 Câu viết chỉ có kết quả Đúng: should show only "Đúng" with a "Tiếp tục" button, without "Sai" or any explanation, after 4 mistakes then 2 correct strokes on 十', async () => {
    env.replaceFetch({ lesson: TEN_FIRST_LESSON });
    const { user } = renderLessonRunner();
    await answerToneChoiceAndContinue(user);
    await findLessonPad(TEN);
    const writer = await waitForActiveQuiz(TEN);

    for (let mistake = 0; mistake < 4; mistake += 1) {
      emitMistake(writer);
    }
    emitCorrectStroke(writer);
    emitCorrectStroke(writer);

    expect(
      await screen.findByRole('button', { name: 'Tiếp tục' }),
    ).toBeInTheDocument();
    const verdict = screen.getByText('Đúng');
    expect(verdict).toBeInTheDocument();
    expect(screen.queryByText('Sai')).not.toBeInTheDocument();
    // Vùng kết quả chỉ có lời "Đúng" (ngoài biểu tượng), không có câu giải thích nào.
    const feedbackStatus = verdict.closest('[role="status"]');
    expect(feedbackStatus).not.toBeNull();
    expect(feedbackStatus).toHaveTextContent(/^[^\p{L}]*Đúng$/u);
  });

  it('S7.1-AC1 Câu viết đã Đúng thì khung bị khóa: should keep "Đúng", the "Tiếp tục" button and 2 completed strokes, without a wrong-stroke alert or a "Viết lại" button, when drawing more strokes after finishing 十', async () => {
    env.replaceFetch({ lesson: TEN_FIRST_LESSON });
    const { user } = renderLessonRunner();
    await answerToneChoiceAndContinue(user);
    const pad = await findLessonPad(TEN);
    const writer = await waitForActiveQuiz(TEN);
    emitCorrectStroke(writer);
    emitCorrectStroke(writer);
    expect(await screen.findByText('Đúng')).toBeInTheDocument();

    emitMistake(writer);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    emitCorrectStroke(writer);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(pad).toHaveAttribute('data-completed-stroke-count', '2');
    expect(screen.getByText('Đúng')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Tiếp tục' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Viết lại' }),
    ).not.toBeInTheDocument();
  });

  it('S7.1-AC2 Câu viết đã Đúng thì không còn liên kết Xem thứ tự nét: should show a "Xem thứ tự nét" link before writing 人, then no such link but a "Tiếp tục" button after writing both strokes of 人', async () => {
    const { user } = renderLessonRunner();
    await answerToneChoiceAndContinue(user);
    await findLessonPad(PERSON);
    const writer = await waitForActiveQuiz(PERSON);

    expect(
      screen.getByRole('link', { name: 'Xem thứ tự nét' }),
    ).toBeInTheDocument();

    emitCorrectStroke(writer);
    emitCorrectStroke(writer);

    expect(
      await screen.findByRole('button', { name: 'Tiếp tục' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Xem thứ tự nét' }),
    ).not.toBeInTheDocument();
  });

  it('S7.1-AC1 Làm hết bài có câu viết thì bài Đã xong: should show the summary with "Đúng 3 / 3 câu", counting both stroke-write exercises as correct, and save lessonProgress status "completed" after finishing tone-choice 八, writing 人 and writing 十', async () => {
    const { user } = renderLessonRunner();
    await answerToneChoiceAndContinue(user);

    await findLessonPad(PERSON);
    const personWriter = await waitForActiveQuiz(PERSON);
    emitCorrectStroke(personWriter);
    emitCorrectStroke(personWriter);
    await user.click(await screen.findByRole('button', { name: 'Tiếp tục' }));

    await findLessonPad(TEN);
    const tenWriter = await waitForActiveQuiz(TEN);
    emitCorrectStroke(tenWriter);
    emitCorrectStroke(tenWriter);
    await user.click(await screen.findByRole('button', { name: 'Tiếp tục' }));

    expect(
      await screen.findByText('Bạn đã làm xong các câu của bài này.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Đúng 3 / 3 câu')).toBeInTheDocument();
    expect(screen.getByText('Sai 0 câu')).toBeInTheDocument();
    await waitFor(async () => {
      const progress = await readSavedProgress();
      expect(progress?.status).toBe('completed');
    });
  });
});
