import { I18nextProvider } from 'react-i18next';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { render } from '@testing-library/react';

import { createDatabase } from '@core/helpers/db.helper';
import { DexieProgressStore } from '@core/services/progress-store.service';
import type { ExerciseRegistry } from '@shared/components/exercises/exercise.registry';
import { ListenButton } from '@shared/components/ListenButton';
import { AudioSpeedProvider } from '@shared/contexts/AudioSpeedContext';
import { SlowToggle } from '@shared/components/SlowToggle';
import { mockContentFetch } from '@test/mocks/content-fetch';
import {
  grantMicrophone,
  installRecordingEnvironment,
  rejectGetUserMedia,
  restoreRecordingEnvironment,
} from '@test/record-compare.helpers';
import testI18n from '@test/i18n';
import { renderWithProviders, screen, userEvent, waitFor } from '@test/render';
import LessonRunnerContainer from './LessonRunnerContainer';

const LESSON = {
  id: 'l1',
  type: 'lesson',
  title: 'Bốn thanh điệu',
  exercises: [
    { id: 'e1', kind: 'tone-choice', wordId: '八' },
    { id: 'e2', kind: 'tone-choice', wordId: '白' },
    { id: 'e3', kind: 'tone-choice', wordId: '百' },
  ],
};

/** Dạng bài giả: hai nút để người học trả lời đúng hoặc sai. */
const registry: ExerciseRegistry = {
  'tone-choice': ({ exercise, onResult, isLocked }) => (
    <div>
      <p>Câu về {exercise.wordId}</p>
      <button
        type="button"
        disabled={isLocked}
        onClick={() => onResult({ isCorrect: true })}
      >
        Chọn đúng
      </button>
      <button
        type="button"
        disabled={isLocked}
        onClick={() =>
          onResult({ isCorrect: false, explanation: 'Chữ này là thanh 1' })
        }
      >
        Chọn sai
      </button>
    </div>
  ),
};

const renderRunner = () =>
  renderWithProviders(<LessonRunnerContainer registry={registry} />, {
    route: '/lessons/:lessonId',
  });

/** Cô lập test: IndexedDB dùng chung giữa các test, xoá vị trí đã lưu của bài. */
const resetSavedProgress = async (): Promise<void> => {
  const db = createDatabase();
  await db.lessonProgress.clear();
  db.close();
};

beforeEach(async () => {
  await resetSavedProgress();
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    mockContentFetch(async (input) =>
      /\/content\/lessons\/.+\.json$/.test(String(input))
        ? Response.json(LESSON)
        : new Response('', { status: 404 }),
    ),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('LessonRunnerContainer', () => {
  it('S3.2-AC1: should open the lesson at the first exercise with progress "Câu 1 / 3"', async () => {
    renderRunner();

    expect(await screen.findByText('Câu về 八')).toBeInTheDocument();
    expect(screen.queryByText('Câu về 白')).not.toBeInTheDocument();
    expect(screen.queryByText('Câu về 百')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAccessibleName('Câu 1 / 3');
  });

  it('S3.2-AC1: should move to the next exercise and update progress', async () => {
    const { user } = renderRunner();
    await user.click(await screen.findByRole('button', { name: 'Chọn đúng' }));

    await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));

    expect(screen.getByText('Câu về 白')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAccessibleName('Câu 2 / 3');
  });

  it('S3.2-AC1: should report the lesson finished after the last exercise', async () => {
    const { user } = renderRunner();
    for (let step = 0; step < 3; step += 1) {
      await user.click(
        await screen.findByRole('button', { name: 'Chọn đúng' }),
      );
      await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    }

    expect(
      screen.getByText('Bạn đã làm xong các câu của bài này.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/^Câu về/)).not.toBeInTheDocument();
  });

  it('S3.2-AC1: should show an error when the lesson cannot be opened', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('', { status: 404 }),
    );
    renderRunner();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Không mở được bài học.',
    );
    expect(screen.queryByText(/^Câu về/)).not.toBeInTheDocument();
  });

  it('S3.2-AC2: should show no result before the learner answers', async () => {
    renderRunner();
    await screen.findByText('Câu về 八');

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Tiếp tục' }),
    ).not.toBeInTheDocument();
  });

  it('S3.2-AC2: should show "Đúng" and "Tiếp tục" right after a correct answer', async () => {
    const { user } = renderRunner();

    await user.click(await screen.findByRole('button', { name: 'Chọn đúng' }));

    expect(screen.getByRole('status')).toHaveTextContent('Đúng');
    expect(screen.getByRole('button', { name: 'Tiếp tục' })).toBeVisible();
    expect(screen.getByText('Câu về 八')).toBeInTheDocument();
  });

  it('S3.2-AC2: should show "Sai" and "Tiếp tục" right after a wrong answer', async () => {
    const { user } = renderRunner();

    await user.click(await screen.findByRole('button', { name: 'Chọn sai' }));

    expect(screen.getByRole('status')).toHaveTextContent('Sai');
    expect(screen.getByRole('button', { name: 'Tiếp tục' })).toBeVisible();
    expect(screen.getByText('Câu về 八')).toBeInTheDocument();
  });

  it('S3.2-AC3: should show the explanation with a wrong answer and stay on the exercise until "Tiếp tục"', async () => {
    const { user } = renderRunner();

    await user.click(await screen.findByRole('button', { name: 'Chọn sai' }));

    expect(screen.getByRole('status')).toHaveTextContent('Chữ này là thanh 1');
    expect(screen.getByText('Câu về 八')).toBeInTheDocument();
    expect(screen.queryByText('Câu về 白')).not.toBeInTheDocument();
  });

  it('S3.2-AC3: should show no explanation after a correct answer', async () => {
    const { user } = renderRunner();

    await user.click(await screen.findByRole('button', { name: 'Chọn đúng' }));

    expect(screen.getByRole('status')).not.toHaveTextContent('thanh 1');
  });

  it('S3.2-X1: should not report the lesson as done when every exercise was skipped', async () => {
    const { user } = renderWithProviders(
      <LessonRunnerContainer registry={{}} />,
      { route: '/lessons/:lessonId' },
    );
    for (let step = 0; step < 3; step += 1) {
      await user.click(
        await screen.findByRole('button', { name: 'Bỏ qua câu này' }),
      );
    }

    expect(
      screen.getByText(/Bạn đã bỏ qua 3 câu.*chưa hoàn thành/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Bạn đã làm xong các câu của bài này.'),
    ).not.toBeInTheDocument();
  });

  it('S3.2-X1: should count a skipped exercise in the middle of a lesson that was otherwise answered', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      mockContentFetch(async (input) =>
        /\/content\/lessons\/.+\.json$/.test(String(input))
          ? Response.json({
              ...LESSON,
              exercises: [
                LESSON.exercises[0],
                { id: 'e2', kind: 'pinyin-type', wordId: '爸爸' },
                LESSON.exercises[2],
              ],
            })
          : new Response('', { status: 404 }),
      ),
    );
    const { user } = renderRunner();
    await user.click(await screen.findByRole('button', { name: 'Chọn đúng' }));
    await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));

    await user.click(screen.getByRole('button', { name: 'Bỏ qua câu này' }));

    expect(screen.getByText('Câu về 百')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAccessibleName('Câu 3 / 3');
    await user.click(screen.getByRole('button', { name: 'Chọn đúng' }));
    await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    expect(
      screen.getByText(/Bạn đã bỏ qua 1 câu.*chưa hoàn thành/),
    ).toBeInTheDocument();
  });

  it('S3.2-AC1: should move focus to the new exercise heading after "Tiếp tục"', async () => {
    const { user } = renderRunner();
    await user.click(await screen.findByRole('button', { name: 'Chọn đúng' }));

    await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));

    expect(screen.getByText('Câu 2 / 3')).toHaveFocus();
  });

  it('S3.2-AC1: should move focus to the finished message after the last exercise', async () => {
    const { user } = renderRunner();
    for (let step = 0; step < 3; step += 1) {
      await user.click(
        await screen.findByRole('button', { name: 'Chọn đúng' }),
      );
      await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    }

    expect(
      screen.getByText('Bạn đã làm xong các câu của bài này.'),
    ).toHaveFocus();
  });

  it('S3.2-AC2: should keep the "Tiếp tục" button outside the result announcement', async () => {
    const { user } = renderRunner();

    await user.click(await screen.findByRole('button', { name: 'Chọn sai' }));

    expect(screen.getByRole('status')).not.toContainElement(
      screen.getByRole('button', { name: 'Tiếp tục' }),
    );
  });

  it('S3.2-AC2: should lock the answer buttons once the exercise is graded', async () => {
    const { user } = renderRunner();
    await user.click(await screen.findByRole('button', { name: 'Chọn sai' }));

    expect(screen.getByRole('button', { name: 'Chọn đúng' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Chọn đúng' }));
    expect(screen.getByRole('status')).toHaveTextContent('Sai');
  });

  it('S3.2-AC2: should unlock the answer buttons on the next exercise', async () => {
    const { user } = renderRunner();
    await user.click(await screen.findByRole('button', { name: 'Chọn sai' }));

    await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));

    expect(screen.getByRole('button', { name: 'Chọn đúng' })).toBeEnabled();
  });

  describe('resume', () => {
    const FIVE_EXERCISES = {
      ...LESSON,
      exercises: ['八', '白', '百', '爸', '吧'].map((wordId, index) => ({
        id: `e${index + 1}`,
        kind: 'tone-choice',
        wordId,
      })),
    };

    /** Ghi vị trí đã nhớ cho bài đang mở (route dùng nguyên văn ':lessonId'). */
    const seedCursor = async (cursor: number): Promise<void> => {
      const db = createDatabase();
      await db.lessonProgress.put({
        lessonId: ':lessonId',
        status: 'in-progress',
        cursor,
      });
      db.close();
    };

    beforeEach(() => {
      vi.spyOn(globalThis, 'fetch').mockImplementation(
        mockContentFetch(async (input) =>
          /\/content\/lessons\/.+\.json$/.test(String(input))
            ? Response.json(FIVE_EXERCISES)
            : new Response('', { status: 404 }),
        ),
      );
    });

    it('S3.3-AC2: should reopen a 5-exercise lesson at the saved third exercise with progress "Câu 3 / 5"', async () => {
      await seedCursor(2);

      renderRunner();

      expect(await screen.findByText('Câu về 百')).toBeInTheDocument();
      expect(screen.queryByText('Câu về 八')).not.toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toHaveAccessibleName('Câu 3 / 5');
    });

    it('S3.3-AC2: should reopen the interrupted exercise unanswered, without "Đúng" or "Sai"', async () => {
      await seedCursor(2);
      const first = renderRunner();
      await first.user.click(
        await screen.findByRole('button', { name: 'Chọn sai' }),
      );
      expect(screen.getByRole('status')).toHaveTextContent('Sai');
      first.unmount();

      renderRunner();

      expect(await screen.findByText('Câu về 百')).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Tiếp tục' }),
      ).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Chọn đúng' })).toBeEnabled();
    });
  });
});

describe('LessonRunnerContainer — tổng kết bài (S3.4)', () => {
  type Answer = 'Chọn đúng' | 'Chọn sai';

  /** Trả lời lần lượt các câu rồi bấm "Tiếp tục" sau mỗi câu. */
  const answerAll = async (
    user: ReturnType<typeof renderRunner>['user'],
    answers: readonly Answer[],
  ): Promise<void> => {
    for (const answer of answers) {
      await user.click(await screen.findByRole('button', { name: answer }));
      await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    }
  };

  it('S3.4-AC1: should show the score, correct count and wrong count with the finished message after the last exercise', async () => {
    const { user } = renderRunner();

    await answerAll(user, ['Chọn đúng', 'Chọn đúng', 'Chọn sai']);

    expect(
      screen.getByText('Bạn đã làm xong các câu của bài này.'),
    ).toBeInTheDocument();
    expect(screen.getByText('67%')).toBeInTheDocument();
    expect(screen.getByText('Đúng 2 / 3 câu')).toBeInTheDocument();
    expect(screen.getByText('Sai 1 câu')).toBeInTheDocument();
  });

  it('S3.4-AC1: should show 100% and "Sai 0 câu" when every answer is correct', async () => {
    const { user } = renderRunner();

    await answerAll(user, ['Chọn đúng', 'Chọn đúng', 'Chọn đúng']);

    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Sai 0 câu')).toBeInTheDocument();
  });

  it('S3.4-AC1: should show 0% and "Sai 3 câu" when every answer is wrong', async () => {
    const { user } = renderRunner();

    await answerAll(user, ['Chọn sai', 'Chọn sai', 'Chọn sai']);

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('Sai 3 câu')).toBeInTheDocument();
  });

  it('S3.4-AC1: should list score, time and wrong count in a description list, with time as m:ss', async () => {
    const { user } = renderRunner();

    await answerAll(user, ['Chọn đúng', 'Chọn đúng', 'Chọn sai']);

    const list = screen.getByText('67%').closest('dl');
    expect(list).not.toBeNull();
    expect(list).toHaveTextContent(/\b\d+:\d{2}\b/);
    expect(list).toHaveTextContent('Sai 1 câu');
  });

  it('S3.4-AC1: should show the summary under the skipped-exercises message when exercises were skipped', async () => {
    const { user } = renderWithProviders(
      <LessonRunnerContainer registry={{}} />,
      { route: '/lessons/:lessonId' },
    );
    for (let step = 0; step < 3; step += 1) {
      await user.click(
        await screen.findByRole('button', { name: 'Bỏ qua câu này' }),
      );
    }

    expect(
      screen.getByText(/Bạn đã bỏ qua 3 câu.*chưa hoàn thành/),
    ).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('Sai 0 câu')).toBeInTheDocument();
  });

  it('S3.4-AC1: should show no score, time or wrong count while the lesson is in progress', async () => {
    const { user } = renderRunner();
    await user.click(await screen.findByRole('button', { name: 'Chọn sai' }));
    await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));

    expect(screen.getByText('Câu về 白')).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Sai \d+ câu$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^\d+:\d{2}$/)).not.toBeInTheDocument();
    expect(document.querySelector('dl')).toBeNull();
  });

  it('S3.4-AC1: should show no save warning when the result was saved', async () => {
    const { user } = renderRunner();

    await answerAll(user, ['Chọn đúng', 'Chọn đúng', 'Chọn đúng']);

    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('S3.4-AC1: should still show the summary and warn "Chưa lưu được kết quả bài này" when saving fails', async () => {
    const save = DexieProgressStore.prototype.saveLessonProgress;
    vi.spyOn(
      DexieProgressStore.prototype,
      'saveLessonProgress',
    ).mockImplementation(async function (this: DexieProgressStore, progress) {
      if (progress.status === 'completed') {
        throw new Error('IndexedDB write failed');
      }
      return save.call(this, progress);
    });
    const { user } = renderRunner();

    await answerAll(user, ['Chọn đúng', 'Chọn đúng', 'Chọn sai']);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Chưa lưu được kết quả bài này',
    );
    expect(screen.getByText('67%')).toBeInTheDocument();
    expect(screen.getByText('Đúng 2 / 3 câu')).toBeInTheDocument();
    expect(screen.getByText('Sai 1 câu')).toBeInTheDocument();
  });

  /** Đọc tiến độ đã ghi của bài đang mở (route dùng nguyên văn ':lessonId'). */
  const readSavedProgress = async (): Promise<
    Awaited<ReturnType<DexieProgressStore['getLessonProgress']>>
  > => {
    const db = createDatabase();
    try {
      return await new DexieProgressStore(db).getLessonProgress(':lessonId');
    } finally {
      db.close();
    }
  };

  /** Dựng thứ tự ghi xấu: lần lưu vị trí khi hết câu đến sau lần ghi "completed". */
  const delayFinishedPositionWrite = (): void => {
    const save = DexieProgressStore.prototype.saveLessonProgress;
    vi.spyOn(
      DexieProgressStore.prototype,
      'saveLessonProgress',
    ).mockImplementation(async function (this: DexieProgressStore, progress) {
      // Lần lưu vị trí đã đọc trạng thái cũ ("in-progress") trước khi "completed" được ghi,
      // rồi ghi muộn hơn: thứ tự đến cuối cùng là completed -> in-progress.
      if (progress.status === 'completed') {
        await new Promise((resolve) => setTimeout(resolve, 50));
      } else if (progress.cursor === undefined) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      return save.call(this, progress);
    });
  };

  it('S3.4-AC2: should end with status "completed" and no cursor after finishing, even when the position save lands late', async () => {
    delayFinishedPositionWrite();
    const { user } = renderRunner();

    await answerAll(user, ['Chọn đúng', 'Chọn đúng', 'Chọn sai']);

    await new Promise((resolve) => setTimeout(resolve, 400));
    await waitFor(async () => {
      const progress = await readSavedProgress();
      expect(progress?.status).toBe('completed');
    });
    const progress = await readSavedProgress();
    expect(progress?.cursor).toBeUndefined();
  });

  it('S3.4-AC2: should not mark the lesson "completed" when an exercise was skipped', async () => {
    delayFinishedPositionWrite();
    const { user } = renderWithProviders(
      <LessonRunnerContainer registry={{}} />,
      { route: '/lessons/:lessonId' },
    );
    for (let step = 0; step < 3; step += 1) {
      await user.click(
        await screen.findByRole('button', { name: 'Bỏ qua câu này' }),
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
    const progress = await readSavedProgress();
    expect(progress?.status).not.toBe('completed');
  });

  it('S3.4-AC1: should score only the exercises answered after reopening a 5-exercise lesson at the third (67%, "Đúng 2 / 3 câu", "Sai 1 câu")', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      mockContentFetch(async (input) =>
        /\/content\/lessons\/.+\.json$/.test(String(input))
          ? Response.json({
              ...LESSON,
              exercises: ['八', '白', '百', '爸', '吧'].map(
                (wordId, index) => ({
                  id: `e${index + 1}`,
                  kind: 'tone-choice',
                  wordId,
                }),
              ),
            })
          : new Response('', { status: 404 }),
      ),
    );
    const db = createDatabase();
    await db.lessonProgress.put({
      lessonId: ':lessonId',
      status: 'in-progress',
      cursor: 2,
    });
    db.close();
    const { user } = renderRunner();
    expect(await screen.findByText('Câu về 百')).toBeInTheDocument();

    await answerAll(user, ['Chọn đúng', 'Chọn đúng', 'Chọn sai']);

    expect(screen.getByText('67%')).toBeInTheDocument();
    expect(screen.getByText('Đúng 2 / 3 câu')).toBeInTheDocument();
    expect(screen.getByText('Sai 1 câu')).toBeInTheDocument();
  });
});

describe('LessonRunnerContainer — nghe lại (S4.4)', () => {
  /** Audio giả ở ranh giới: ghi lại số lần phát và dừng. */
  class FakeAudio extends EventTarget {
    src = '';
    currentTime = 0;
    playbackRate = 1;
    playCount = 0;
    pauseCount = 0;

    play(): Promise<void> {
      this.playCount += 1;
      return Promise.resolve();
    }

    pause(): void {
      this.pauseCount += 1;
    }
  }

  // AudioService giữ một element cho cả vòng đời module, nên dùng đúng một FakeAudio.
  const fakeAudio = new FakeAudio();

  const listenRegistry: ExerciseRegistry = {
    'tone-choice': ({ content, onResult, isLocked }) => (
      <div>
        <ListenButton audioPath={content.words[0]?.audio ?? ''} />
        <SlowToggle />
        <button
          type="button"
          disabled={isLocked}
          onClick={() => onResult({ isCorrect: true })}
        >
          Chọn đúng
        </button>
      </div>
    ),
  };

  beforeEach(() => {
    fakeAudio.src = '';
    fakeAudio.currentTime = 0;
    fakeAudio.playbackRate = 1;
    fakeAudio.playCount = 0;
    fakeAudio.pauseCount = 0;
    vi.stubGlobal('Audio', function FakeAudioConstructor() {
      return fakeAudio;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const renderListenRunner = () =>
    renderWithProviders(<LessonRunnerContainer registry={listenRegistry} />, {
      route: '/lessons/:lessonId',
    });

  it('S4.4-AC1: nghe lại sau khi đã chấm thì nút Nghe vẫn bấm được và phát lại', async () => {
    const { user } = renderListenRunner();
    await user.click(await screen.findByRole('button', { name: 'Nghe' }));
    expect(fakeAudio.playCount).toBe(1);

    await user.click(screen.getByRole('button', { name: 'Chọn đúng' }));

    expect(screen.getByRole('button', { name: 'Chọn đúng' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Nghe' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Nghe' }));
    expect(fakeAudio.playCount).toBe(2);
  });

  it('S4.4-AC1: sang câu khác thì dừng audio đang phát', async () => {
    const { user } = renderListenRunner();
    await user.click(await screen.findByRole('button', { name: 'Nghe' }));
    await user.click(screen.getByRole('button', { name: 'Chọn đúng' }));
    const pausesBefore = fakeAudio.pauseCount;

    await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));

    expect(screen.getByText('Câu 2 / 3')).toBeInTheDocument();
    expect(fakeAudio.pauseCount).toBeGreaterThan(pausesBefore);
  });

  it('S4.4-AC2: bật Nghe chậm ở câu 1 thì sang câu 2 công tắc vẫn bật và phát 0.75x', async () => {
    const { user } = renderListenRunner();
    await user.click(await screen.findByRole('switch'));
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getByRole('button', { name: 'Chọn đúng' }));

    await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));

    expect(screen.getByText('Câu 2 / 3')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getByRole('button', { name: 'Nghe' }));
    expect(fakeAudio.playbackRate).toBe(0.75);
  });

  it('S4.4-AC2: mở bài khác thì công tắc Nghe chậm tắt và phát tốc độ thường', async () => {
    const OpenLessons = () => (
      <>
        <Link to="/lessons/l2">Bài khác</Link>
        <LessonRunnerContainer registry={listenRegistry} />
      </>
    );
    const user = userEvent.setup();
    render(
      <I18nextProvider i18n={testI18n}>
        <MemoryRouter initialEntries={['/lessons/l1']}>
          <Routes>
            <Route path="/lessons/:lessonId" element={<OpenLessons />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>,
    );
    await user.click(await screen.findByRole('switch'));
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');

    await user.click(screen.getByRole('link', { name: 'Bài khác' }));

    expect(await screen.findByText('Câu 1 / 3')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    await user.click(screen.getByRole('button', { name: 'Nghe' }));
    expect(fakeAudio.playbackRate).toBe(1);
  });
});

describe('LessonRunnerContainer — bài kiểm tra cuối chủ đề (S3.5)', () => {
  type Answer = 'Chọn đúng' | 'Chọn sai';

  const TEST_LESSON = {
    ...LESSON,
    id: 'topic-test',
    type: 'test',
    title: 'Kiểm tra chủ đề',
    exercises: ['八', '白', '百', '爸', '吧'].map((wordId, index) => ({
      id: `e${index + 1}`,
      kind: 'tone-choice',
      wordId,
    })),
  };

  const mockTestLesson = (): void => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      mockContentFetch((input) =>
        /\/content\/lessons\/.+\.json$/.test(String(input))
          ? Response.json(TEST_LESSON)
          : new Response('', { status: 404 }),
      ),
    );
  };

  const answerAll = async (
    user: ReturnType<typeof renderRunner>['user'],
    answers: readonly Answer[],
  ): Promise<void> => {
    for (const answer of answers) {
      await user.click(await screen.findByRole('button', { name: answer }));
      await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    }
  };

  const PASSED: readonly Answer[] = [
    'Chọn đúng',
    'Chọn đúng',
    'Chọn đúng',
    'Chọn đúng',
    'Chọn đúng',
  ];
  const FAILED: readonly Answer[] = [
    'Chọn đúng',
    'Chọn sai',
    'Chọn đúng',
    'Chọn sai',
    'Chọn sai',
  ];

  beforeEach(() => {
    mockTestLesson();
  });

  it('S3.5-AC2: should show "Chưa đạt, cần từ 80%" and a "Làm lại" button when the test is not passed', async () => {
    const { user } = renderRunner();

    await answerAll(user, FAILED);

    expect(screen.getByText('Chưa đạt, cần từ 80%')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Làm lại' })).toBeVisible();
  });

  it('S3.5-AC2: should show "Bạn đã đạt" and no "Làm lại" button when the test is passed', async () => {
    const { user } = renderRunner();

    await answerAll(user, PASSED);

    expect(screen.getByText('Bạn đã đạt')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Làm lại' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Chưa đạt/)).not.toBeInTheDocument();
  });

  it('S3.5-AC2: should show no pass line and no "Làm lại" button for a regular lesson', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      mockContentFetch((input) =>
        /\/content\/lessons\/.+\.json$/.test(String(input))
          ? Response.json(LESSON)
          : new Response('', { status: 404 }),
      ),
    );
    const { user } = renderRunner();

    await answerAll(user, ['Chọn sai', 'Chọn sai', 'Chọn sai']);

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.queryByText(/Chưa đạt/)).not.toBeInTheDocument();
    expect(screen.queryByText('Bạn đã đạt')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Làm lại' }),
    ).not.toBeInTheDocument();
  });

  it('S3.5-AC2: should restart at "Câu 1 / 5" with the focus on that line when "Làm lại" is pressed', async () => {
    const { user } = renderRunner();
    await answerAll(user, FAILED);

    await user.click(screen.getByRole('button', { name: 'Làm lại' }));

    expect(screen.getByText('Câu về 八')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAccessibleName('Câu 1 / 5');
    expect(screen.getByText('Câu 1 / 5')).toHaveFocus();
    expect(screen.queryByText('Chưa đạt, cần từ 80%')).not.toBeInTheDocument();
  });

  it('S3.5-AC2: should score the retry from scratch, not adding the previous attempt', async () => {
    let clock = 1_000_000;
    vi.spyOn(Date, 'now').mockImplementation(() => clock);
    const { user } = renderRunner();
    await screen.findByText('Câu về 八');
    clock += 90_000;
    await answerAll(user, FAILED);
    expect(screen.getByText('1:30')).toBeInTheDocument();
    expect(screen.getByText('Sai 3 câu')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Làm lại' }));
    clock += 5_000;
    await answerAll(user, PASSED);

    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Đúng 5 / 5 câu')).toBeInTheDocument();
    expect(screen.getByText('Sai 0 câu')).toBeInTheDocument();
    expect(screen.getByText('0:05')).toBeInTheDocument();
    expect(screen.getByText('Bạn đã đạt')).toBeInTheDocument();
  });

  it('S3.5-AC2: should show "Làm lại" again when the second attempt is still not passed', async () => {
    const { user } = renderRunner();
    await answerAll(user, FAILED);
    await user.click(screen.getByRole('button', { name: 'Làm lại' }));

    await answerAll(user, FAILED);

    expect(screen.getByText('Chưa đạt, cần từ 80%')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Làm lại' })).toBeVisible();
  });

  it('S3.5-X1: should reopen an interrupted test at "Câu 1 / 5", not at the saved position', async () => {
    const db = createDatabase();
    await db.lessonProgress.put({
      lessonId: ':lessonId',
      status: 'in-progress',
      cursor: 2,
    });
    db.close();

    renderRunner();

    expect(await screen.findByText('Câu về 八')).toBeInTheDocument();
    expect(screen.queryByText('Câu về 百')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAccessibleName('Câu 1 / 5');
  });
});

describe('LessonRunnerContainer — đổi bài sau khi làm lại (S3.5)', () => {
  const testLessonOf = (id: string) => ({
    id,
    type: 'test',
    title: `Kiểm tra ${id}`,
    exercises: ['八', '白'].map((wordId, index) => ({
      id: `${id}-e${index + 1}`,
      kind: 'tone-choice',
      wordId,
    })),
  });

  const renderWithLinkToB = () =>
    render(
      <I18nextProvider i18n={testI18n}>
        <MemoryRouter initialEntries={['/lessons/a']}>
          <Link to="/lessons/b">Sang bài B</Link>
          <Routes>
            <Route
              path="/lessons/:lessonId"
              element={<LessonRunnerContainer registry={registry} />}
            />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>,
    );

  it('S3.5-AC2: should not move focus to the progress line of another test opened after "Làm lại"', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      mockContentFetch((input) => {
        const id = /\/content\/lessons\/(.+)\.json$/.exec(String(input))?.[1];
        return id === undefined
          ? new Response('', { status: 404 })
          : Response.json(testLessonOf(id));
      }),
    );
    const user = userEvent.setup();
    renderWithLinkToB();
    for (const answer of ['Chọn sai', 'Chọn sai']) {
      await user.click(await screen.findByRole('button', { name: answer }));
      await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    }
    await user.click(screen.getByRole('button', { name: 'Làm lại' }));
    expect(screen.getByText('Câu 1 / 2')).toHaveFocus();

    await user.click(screen.getByRole('link', { name: 'Sang bài B' }));

    expect(
      await screen.findByRole('heading', { name: 'Kiểm tra b' }),
    ).toBeVisible();
    expect(await screen.findByText('Câu 1 / 2')).not.toHaveFocus();
  });
});

describe('LessonRunnerContainer — câu nói tự đánh giá (S5.2)', () => {
  const SPEAK_LESSON = {
    id: 'speak-lesson',
    type: 'lesson',
    title: 'Luyện nói',
    exercises: [{ id: 'e1', kind: 'speak', sentenceId: 's1' }],
  };

  beforeEach(() => {
    installRecordingEnvironment();
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      mockContentFetch((input) =>
        /\/content\/lessons\/.+\.json$/.test(String(input))
          ? Response.json(SPEAK_LESSON)
          : new Response('', { status: 404 }),
      ),
    );
  });

  afterEach(() => {
    restoreRecordingEnvironment();
  });

  it('S5.2-AC2: chọn "Đúng" ở câu nói duy nhất thì không hiện giải thích, tổng kết 100% và "Sai 0 câu"', async () => {
    const { user } = renderWithProviders(
      <AudioSpeedProvider>
        <LessonRunnerContainer />
      </AudioSpeedProvider>,
      { route: '/lessons/:lessonId' },
    );

    await user.click(await screen.findByRole('button', { name: 'Đúng' }));

    expect(screen.queryByText(/Đáp án/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Sai 0 câu')).toBeInTheDocument();
  });

  it('S5.2-AC2: chọn "Gần đúng" thì tính câu sai, hiện chữ, pinyin, nghĩa; tổng kết 0% và "Sai 1 câu"', async () => {
    const { user } = renderWithProviders(
      <AudioSpeedProvider>
        <LessonRunnerContainer />
      </AudioSpeedProvider>,
      { route: '/lessons/:lessonId' },
    );

    await user.click(await screen.findByRole('button', { name: 'Gần đúng' }));

    expect(screen.getByRole('status')).toHaveTextContent(
      'Đáp án: 你好 · nǐ hǎo · xin chào',
    );
    await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('Sai 1 câu')).toBeInTheDocument();
  });

  it('S5.2-AC2: chọn "Chưa đúng" thì tính câu sai, hiện chữ, pinyin, nghĩa; tổng kết 0% và "Sai 1 câu"', async () => {
    const { user } = renderWithProviders(
      <AudioSpeedProvider>
        <LessonRunnerContainer />
      </AudioSpeedProvider>,
      { route: '/lessons/:lessonId' },
    );

    await user.click(await screen.findByRole('button', { name: 'Chưa đúng' }));

    expect(screen.getByRole('status')).toHaveTextContent(
      'Đáp án: 你好 · nǐ hǎo · xin chào',
    );
    await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('Sai 1 câu')).toBeInTheDocument();
  });

  it('S5.2-AC2: bài 4 câu (2 câu thường đúng, "Đúng", "Chưa đúng") thì tổng kết 75%, "Đúng 3 / 4 câu" và "Sai 1 câu"', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      mockContentFetch((input) =>
        /\/content\/lessons\/.+\.json$/.test(String(input))
          ? Response.json({
              ...SPEAK_LESSON,
              exercises: [
                { id: 'e1', kind: 'pinyin-type', wordId: '八' },
                { id: 'e2', kind: 'pinyin-type', wordId: '八' },
                { id: 'e3', kind: 'speak', sentenceId: 's1' },
                { id: 'e4', kind: 'speak', sentenceId: 's1' },
              ],
            })
          : new Response('', { status: 404 }),
      ),
    );
    const { user } = renderWithProviders(
      <AudioSpeedProvider>
        <LessonRunnerContainer />
      </AudioSpeedProvider>,
      { route: '/lessons/:lessonId' },
    );

    for (let step = 0; step < 2; step += 1) {
      await user.type(await screen.findByRole('textbox'), 'ba1{Enter}');
      await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    }
    await user.click(await screen.findByRole('button', { name: 'Đúng' }));
    await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    await user.click(await screen.findByRole('button', { name: 'Chưa đúng' }));
    await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));

    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('Đúng 3 / 4 câu')).toBeInTheDocument();
    expect(screen.getByText('Sai 1 câu')).toBeInTheDocument();
  });
});

describe('LessonRunnerContainer — mở bài mới kiểm tra lại mic (S5.4)', () => {
  const speakLessonOf = (id: string) => ({
    id,
    type: 'lesson',
    title: `Luyện nói ${id}`,
    exercises: [{ id: `${id}-e1`, kind: 'speak', sentenceId: 's1' }],
  });

  beforeEach(() => {
    installRecordingEnvironment();
    rejectGetUserMedia('NotAllowedError');
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      mockContentFetch((input) => {
        const id = /\/content\/lessons\/(.+)\.json$/.exec(String(input))?.[1];
        return id === undefined
          ? new Response('', { status: 404 })
          : Response.json(speakLessonOf(id));
      }),
    );
  });

  afterEach(() => {
    restoreRecordingEnvironment();
  });

  it('S5.4-AC2: bài A mic bị chặn (đọc to), sang bài B khi mic hoạt động thì có nút Ghi âm và không còn lời nhắc đọc to', async () => {
    const user = userEvent.setup();
    render(
      <I18nextProvider i18n={testI18n}>
        <MemoryRouter initialEntries={['/lessons/a']}>
          <Link to="/lessons/b">Sang bài B</Link>
          <Routes>
            <Route
              path="/lessons/:lessonId"
              element={<LessonRunnerContainer />}
            />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>,
    );
    await user.click(await screen.findByRole('button', { name: 'Ghi âm' }));
    await screen.findByText(/đọc to chữ trên màn/i);
    grantMicrophone();

    await user.click(screen.getByRole('link', { name: 'Sang bài B' }));

    expect(
      await screen.findByRole('heading', { name: 'Luyện nói b' }),
    ).toBeVisible();
    expect(
      await screen.findByRole('button', { name: 'Ghi âm' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/đọc to chữ trên màn/i)).not.toBeInTheDocument();
  });
});
