import { createDatabase } from '@core/helpers/db.helper';
import type { ExerciseRegistry } from '@shared/components/exercises/exercise.registry';
import { ProgressService } from '@shared/services/progress.service';
import { mockContentFetch } from '@test/mocks/content-fetch';
import { renderWithProviders, screen, waitFor } from '@test/render';
import { setPageVisibility } from '@test/visibility.helpers';
import LessonRunnerContainer from './LessonRunnerContainer';

const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const START_TIME = new Date(2026, 10, 18, 9, 0, 0).getTime();

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

/** Bài kiểm tra cuối chủ đề: cùng schema bài học, `type: 'test'`. */
const TOPIC_TEST = {
  ...LESSON,
  id: 'topic-test',
  type: 'test',
  title: 'Kiểm tra chủ đề',
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
    </div>
  ),
};

const mockLessonContent = (lesson: typeof LESSON): void => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    mockContentFetch(async (input) =>
      /\/content\/lessons\/.+\.json$/.test(String(input))
        ? Response.json(lesson)
        : new Response('', { status: 404 }),
    ),
  );
};

const renderRunner = () =>
  renderWithProviders(<LessonRunnerContainer registry={registry} />, {
    route: '/lessons/:lessonId',
  });

/** Cô lập test: IndexedDB dùng chung giữa các test, xoá tiến độ bài và thời gian học theo ngày. */
const resetSavedProgress = async (): Promise<void> => {
  const db = createDatabase();
  await Promise.all([db.lessonProgress.clear(), db.dailyStats.clear()]);
  db.close();
};

/** Ghi sẵn bài `lessonId` là đã học xong, như người học đã hoàn thành bài này từ trước. */
const markLessonCompleted = async (lessonId: string): Promise<void> => {
  const db = createDatabase();
  await db.lessonProgress.put({ lessonId, status: 'completed' });
  db.close();
};

const readTodayMinutes = async (): Promise<number> =>
  (await new ProgressService().getTodayStudy(Date.now())).minutes;

beforeEach(async () => {
  await resetSavedProgress();
  setPageVisibility(false);
  // Chỉ giả Date: timer và promise thật để Dexie (fake-indexeddb), user-event và waitFor vẫn chạy.
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(START_TIME);
  mockLessonContent(LESSON);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('LessonRunnerContainer — thời gian học hôm nay (S8.1)', () => {
  it('S8.1-AC2 Ở màn bài được tính: should add 3 minutes to today after staying 3 min 10 s on the lesson screen and leaving it', async () => {
    const { unmount } = renderRunner();
    expect(await screen.findByText('Câu về 八')).toBeInTheDocument();

    vi.setSystemTime(START_TIME + 3 * MINUTE + 10 * SECOND);
    unmount();

    await waitFor(async () => {
      expect(await readTodayMinutes()).toBe(3);
    });
  });

  it('S8.1-AC2 Thoát giữa bài vẫn được tính: should add 2 minutes to today when leaving after 2 min 10 s without finishing the lesson', async () => {
    const { user, unmount } = renderRunner();
    expect(await screen.findByText('Câu về 八')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Chọn đúng' }));
    vi.setSystemTime(START_TIME + 2 * MINUTE + 10 * SECOND);
    unmount();

    await waitFor(async () => {
      expect(await readTodayMinutes()).toBe(2);
    });
  });

  it('S8.1-AC2 Học lại bài đã xong vẫn được tính: should add 4 minutes to today after reopening a completed lesson for 4 min 10 s', async () => {
    await markLessonCompleted(LESSON.id);

    const { unmount } = renderWithProviders(
      <LessonRunnerContainer registry={registry} lessonId={LESSON.id} />,
    );
    expect(await screen.findByText('Câu về 八')).toBeInTheDocument();

    vi.setSystemTime(START_TIME + 4 * MINUTE + 10 * SECOND);
    unmount();

    await waitFor(async () => {
      expect(await readTodayMinutes()).toBe(4);
    });
  });

  it('S8.1-AC2 Bài kiểm tra cuối chủ đề được tính: should add 4 minutes to today after 3 min 10 s on a topic test until its summary plus 1 min on the summary', async () => {
    mockLessonContent(TOPIC_TEST);
    const { user, unmount } = renderRunner();
    expect(await screen.findByText('Câu về 八')).toBeInTheDocument();

    for (const [index] of TOPIC_TEST.exercises.entries()) {
      await user.click(
        await screen.findByRole('button', { name: 'Chọn đúng' }),
      );
      if (index === TOPIC_TEST.exercises.length - 1) {
        // Câu cuối: đã làm bài 3 phút 10 giây, bấm "Tiếp tục" thì tới màn tổng kết.
        vi.setSystemTime(START_TIME + 3 * MINUTE + 10 * SECOND);
      }
      await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    }
    expect(await screen.findByText('Bạn đã đạt')).toBeInTheDocument();

    vi.setSystemTime(START_TIME + 4 * MINUTE + 10 * SECOND);
    unmount();

    await waitFor(async () => {
      expect(await readTodayMinutes()).toBe(4);
    });
  });

  it('S8.1-AC2 Thời gian app chạy nền không tính: should add only 2 minutes to today when the app stays in the background 10 min between 1 min 10 s and 1 min on the lesson screen', async () => {
    const { unmount } = renderRunner();
    expect(await screen.findByText('Câu về 八')).toBeInTheDocument();

    vi.setSystemTime(START_TIME + 1 * MINUTE + 10 * SECOND);
    setPageVisibility(true);
    vi.setSystemTime(START_TIME + 11 * MINUTE + 10 * SECOND);
    setPageVisibility(false);
    vi.setSystemTime(START_TIME + 12 * MINUTE + 10 * SECOND);
    unmount();

    await waitFor(async () => {
      expect(await readTodayMinutes()).toBe(2);
    });
  });

  it('S8.1-AC2 Hai tab cùng mở màn bài: should add 6 minutes to today when two lesson screens stay open together 3 min 10 s and both are left', async () => {
    // Hai cây React riêng trong cùng trang, mỗi cây là một màn bài tính thời gian riêng.
    const first = renderRunner();
    const second = renderRunner();
    await waitFor(() => {
      expect(screen.getAllByText('Câu về 八')).toHaveLength(2);
    });

    vi.setSystemTime(START_TIME + 3 * MINUTE + 10 * SECOND);
    first.unmount();
    second.unmount();

    await waitFor(async () => {
      expect(await readTodayMinutes()).toBe(6);
    });
  });
});
