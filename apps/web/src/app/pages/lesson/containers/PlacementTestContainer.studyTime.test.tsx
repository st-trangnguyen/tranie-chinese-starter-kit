import { I18nextProvider } from 'react-i18next';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render } from '@testing-library/react';

import { createDatabase } from '@core/helpers/db.helper';
import type { ExerciseRegistry } from '@shared/components/exercises/exercise.registry';
import { ProgressService } from '@shared/services/progress.service';
import testI18n from '@test/i18n';
import { mockContentFetch } from '@test/mocks/content-fetch';
import { screen, userEvent, waitFor } from '@test/render';
import { setPageVisibility } from '@test/visibility.helpers';
import PlacementTestContainer from './PlacementTestContainer';

const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const START_TIME = new Date(2026, 10, 18, 9, 0, 0).getTime();

const CONTENT_ROOT = {
  contentVersion: '0123456789ab',
  stages: [
    {
      id: 'hsk1',
      title: 'HSK 1',
      units: [{ id: 'unit-b', title: 'Chủ đề B', lessonIds: ['b1', 'test-b'] }],
    },
  ],
};

const PLACEMENT_TEST = {
  id: 'test-b',
  type: 'test',
  title: 'Kiểm tra test-b',
  exercises: ['八', '白', '百'].map((wordId, index) => ({
    id: `test-b-e${index + 1}`,
    kind: 'tone-choice',
    wordId,
  })),
};

const LESSONS: Record<string, unknown> = {
  b1: {
    id: 'b1',
    type: 'lesson',
    title: 'Bài b1',
    exercises: [{ id: 'b1-e1', kind: 'tone-choice', wordId: 'b1' }],
  },
  'test-b': PLACEMENT_TEST,
};

/** Dạng bài giả: một nút để người học trả lời đúng. */
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

const renderPlacement = (unitId: string) =>
  render(
    <I18nextProvider i18n={testI18n}>
      <MemoryRouter initialEntries={[`/units/${unitId}/placement-test`]}>
        <Routes>
          <Route
            path="units/:unitId/placement-test"
            element={<PlacementTestContainer registry={registry} />}
          />
        </Routes>
      </MemoryRouter>
    </I18nextProvider>,
  );

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
    mockContentFetch(async (input) => {
      const url = String(input);
      if (url === '/content/content.json') {
        return Response.json(CONTENT_ROOT);
      }
      const id = /\/content\/lessons\/(.+)\.json$/.exec(url)?.[1] ?? '';
      const lesson = LESSONS[id];
      return lesson === undefined
        ? new Response('', { status: 404 })
        : Response.json(lesson);
    }),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('PlacementTestContainer — thời gian học hôm nay (S8.1)', () => {
  it('S8.1-AC2 Bài kiểm tra vượt cấp được tính: should add 4 minutes to today after 3 min 10 s on a placement test until its summary plus 1 min on the summary', async () => {
    const { unmount } = renderPlacement('unit-b');
    const user = userEvent.setup();
    expect(await screen.findByText('Câu về 八')).toBeInTheDocument();

    for (const [index] of PLACEMENT_TEST.exercises.entries()) {
      await user.click(
        await screen.findByRole('button', { name: 'Chọn đúng' }),
      );
      if (index === PLACEMENT_TEST.exercises.length - 1) {
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
});
