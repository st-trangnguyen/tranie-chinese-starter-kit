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

const readTodayMinutes = async (): Promise<number> =>
  (await new ProgressService().getTodayStudy(Date.now())).minutes;

beforeEach(async () => {
  await resetSavedProgress();
  setPageVisibility(false);
  // Chỉ giả Date: timer và promise thật để Dexie (fake-indexeddb), user-event và waitFor vẫn chạy.
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(START_TIME);
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    mockContentFetch(async (input) =>
      /\/content\/lessons\/.+\.json$/.test(String(input))
        ? Response.json(LESSON)
        : new Response('', { status: 404 }),
    ),
  );
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
});
