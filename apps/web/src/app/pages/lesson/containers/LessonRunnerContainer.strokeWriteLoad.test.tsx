import { describe, expect, it, vi } from 'vitest';

import { createDatabase } from '@core/helpers/db.helper';
import { DexieProgressStore } from '@core/services/progress-store.service';
import {
  LESSON_ID,
  NO_STROKE_DATA,
  PERSON,
  STROKE_WRITE_LESSON,
  TEN,
  answerToneChoiceAndContinue,
  emitCorrectStroke,
  findLessonPad,
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
  it('S7.1-AC1 Câu viết thử lại sau khi tải lỗi: should hide the alert and show the writing pad with the "Xem thứ tự nét" link after "Thử lại" once 人.json loads', async () => {
    env.replaceFetch({
      strokeOverrides: { '人.json': () => new Response('', { status: 500 }) },
    });
    const { user } = renderLessonRunner();
    await answerToneChoiceAndContinue(user);

    const alerts = await screen.findAllByRole('alert');
    expect(alerts.map((alert) => alert.textContent).join(' ')).toContain(
      'Có lỗi xảy ra',
    );

    // Mạng đã ổn: file nét của 人 tải được bình thường.
    const strokeFetch = env.replaceFetch({});
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));

    expect(await findLessonPad(PERSON)).toBeInTheDocument();
    expect(
      strokeFetch.requests.some((url) =>
        decodeURIComponent(url).endsWith(`/${PERSON}.json`),
      ),
    ).toBe(true);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Xem thứ tự nét' }),
    ).toBeInTheDocument();
  });

  it('S7.1-AC1 Câu viết tải lỗi rồi bỏ qua: should show "Câu 3 / 3" after "Bỏ qua câu này" on the failed 人 exercise, then end with exactly "Bạn đã bỏ qua 1 câu, bài chưa hoàn thành." (no "dạng bài chưa có") and not save lessonProgress as "completed" after writing 十', async () => {
    env.replaceFetch({
      strokeOverrides: { '人.json': () => new Response('', { status: 500 }) },
    });
    const { user } = renderLessonRunner();
    await answerToneChoiceAndContinue(user);

    const alerts = await screen.findAllByRole('alert');
    expect(alerts.map((alert) => alert.textContent).join(' ')).toContain(
      'Có lỗi xảy ra',
    );
    await user.click(screen.getByRole('button', { name: 'Bỏ qua câu này' }));

    expect(screen.getByRole('progressbar')).toHaveAccessibleName('Câu 3 / 3');
    await findLessonPad(TEN);
    const tenWriter = await waitForActiveQuiz(TEN);
    emitCorrectStroke(tenWriter);
    emitCorrectStroke(tenWriter);
    await user.click(await screen.findByRole('button', { name: 'Tiếp tục' }));

    const heading = await screen.findByRole('heading', {
      level: 2,
      name: /bỏ qua/,
    });
    expect(heading.textContent).toBe(
      'Bạn đã bỏ qua 1 câu, bài chưa hoàn thành.',
    );
    expect(heading.textContent).not.toContain('dạng bài chưa có');
    expect(
      screen.queryByText('Bạn đã làm xong các câu của bài này.'),
    ).not.toBeInTheDocument();
    const progress = await readSavedProgress();
    expect(progress?.status).not.toBe('completed');
  });

  it('S7.1-AC1 Câu viết gặp chữ không có dữ liệu nét khi chạy app: should show "Chưa có dữ liệu nét cho chữ này." with "Bỏ qua câu này" and no writing pad or "Xem thứ tự nét" link for 龘, then "Câu 3 / 3" after skipping and end with "Bạn đã bỏ qua 1 câu, bài chưa hoàn thành." after writing 十', async () => {
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
    await answerToneChoiceAndContinue(user);

    expect(screen.getByRole('progressbar')).toHaveAccessibleName('Câu 2 / 3');
    expect(
      await screen.findByText('Chưa có dữ liệu nét cho chữ này.', undefined, {
        timeout: 3000,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('figure', {
        name: `Khung viết chữ ${NO_STROKE_DATA}`,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Xem thứ tự nét' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Bỏ qua câu này' }));

    expect(screen.getByRole('progressbar')).toHaveAccessibleName('Câu 3 / 3');
    await findLessonPad(TEN);
    const tenWriter = await waitForActiveQuiz(TEN);
    emitCorrectStroke(tenWriter);
    emitCorrectStroke(tenWriter);
    await user.click(await screen.findByRole('button', { name: 'Tiếp tục' }));

    const heading = await screen.findByRole('heading', {
      level: 2,
      name: /bỏ qua/,
    });
    expect(heading.textContent).toBe(
      'Bạn đã bỏ qua 1 câu, bài chưa hoàn thành.',
    );
    const progress = await readSavedProgress();
    expect(progress?.status).not.toBe('completed');
  });
});
