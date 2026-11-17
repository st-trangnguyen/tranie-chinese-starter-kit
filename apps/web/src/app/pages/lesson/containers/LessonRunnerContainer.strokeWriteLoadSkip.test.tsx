import { describe, expect, it, vi } from 'vitest';

import { createDatabase } from '@core/helpers/db.helper';
import { DexieProgressStore } from '@core/services/progress-store.service';
import {
  LESSON_ID,
  NO_STROKE_DATA,
  STROKE_WRITE_LESSON,
  TEN,
  answerToneChoiceAndContinue,
  emitCorrectStroke,
  findLessonPad,
  renderLessonRunner,
  setupLessonStrokeWrite,
  waitForActiveQuiz,
} from '@test/lesson-stroke-write.helpers';
import { screen } from '@test/render';

// Ranh giới ngoài: thư viện vẽ/chấm nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

const env = setupLessonStrokeWrite();

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

describe('LessonRunnerContainer — bỏ qua câu viết thiếu dữ liệu nét (delta lesson-runner)', () => {
  it('S7.1-AC1 Bỏ qua câu viết thiếu dữ liệu nét thì bài chưa hoàn thành (lesson-runner): should end with a heading saying 1 exercise was skipped and the lesson is not completed, without "dạng bài chưa có", after doing 八, skipping 龘 and writing 十', async () => {
    // Câu 2 viết chữ 龘: không có trong `strokes/index.json` thật.
    env.replaceFetch({
      lesson: {
        ...STROKE_WRITE_LESSON,
        exercises: [
          { id: 'e1', kind: 'tone-choice', wordId: '八' },
          { id: 'e2', kind: 'stroke-write', wordId: NO_STROKE_DATA },
          { id: 'e3', kind: 'stroke-write', wordId: TEN },
        ],
      },
    });
    const { user } = renderLessonRunner();

    // Câu 1: làm.
    await answerToneChoiceAndContinue(user);

    // Câu 2: câu viết báo thiếu dữ liệu nét, người học bỏ qua.
    expect(
      await screen.findByText('Chưa có dữ liệu nét cho chữ này.', undefined, {
        timeout: 3000,
      }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Bỏ qua câu này' }));

    // Câu 3: làm.
    await findLessonPad(TEN);
    const tenWriter = await waitForActiveQuiz(TEN);
    emitCorrectStroke(tenWriter);
    emitCorrectStroke(tenWriter);
    await user.click(await screen.findByRole('button', { name: 'Tiếp tục' }));

    const heading = await screen.findByRole('heading', {
      level: 2,
      name: /bỏ qua/,
    });
    expect(heading.textContent).toContain('bỏ qua 1 câu');
    expect(heading.textContent).toContain('bài chưa hoàn thành');
    expect(heading.textContent).not.toContain('dạng bài chưa có');
    expect(
      screen.queryByText('Bạn đã làm xong các câu của bài này.'),
    ).not.toBeInTheDocument();
    const progress = await readSavedProgress();
    expect(progress?.status).not.toBe('completed');
  });
});
