import { I18nextProvider } from 'react-i18next';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render } from '@testing-library/react';

import { createDatabase } from '@core/helpers/db.helper';
import type { ExerciseRegistry } from '@shared/components/exercises/exercise.registry';
import testI18n from '@test/i18n';
import { mockContentFetch } from '@test/mocks/content-fetch';
import { screen, userEvent, waitFor } from '@test/render';
import PlacementTestContainer from './PlacementTestContainer';

const CONTENT_ROOT = {
  contentVersion: '0123456789ab',
  stages: [
    {
      id: 'hsk1',
      title: 'HSK 1',
      units: [
        { id: 'unit-a', title: 'Chủ đề A', lessonIds: ['a1', 'test-a'] },
        { id: 'unit-b', title: 'Chủ đề B', lessonIds: ['b1', 'b2', 'test-b'] },
        { id: 'unit-c', title: 'Chủ đề C', lessonIds: ['c1'] },
      ],
    },
  ],
};

const testLessonOf = (id: string, words: readonly string[]) => ({
  id,
  type: 'test',
  title: `Kiểm tra ${id}`,
  exercises: words.map((wordId, index) => ({
    id: `${id}-e${index + 1}`,
    kind: 'tone-choice',
    wordId,
  })),
});

const regularLessonOf = (id: string) => ({
  id,
  type: 'lesson',
  title: `Bài ${id}`,
  exercises: [{ id: `${id}-e1`, kind: 'tone-choice', wordId: id }],
});

const LESSONS: Record<string, unknown> = {
  a1: regularLessonOf('a1'),
  'test-a': testLessonOf('test-a', ['甲', '乙']),
  b1: regularLessonOf('b1'),
  b2: regularLessonOf('b2'),
  'test-b': testLessonOf('test-b', ['八', '白', '百', '爸', '吧']),
  c1: regularLessonOf('c1'),
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
        onClick={() => onResult({ isCorrect: false, explanation: 'Sai rồi' })}
      >
        Chọn sai
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

beforeEach(async () => {
  const db = createDatabase();
  await db.lessonProgress.clear();
  db.close();
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
  vi.restoreAllMocks();
});

describe('PlacementTestContainer', () => {
  it('S3.6-AC1: should open the placement test of the unit at "Câu 1 / 5"', async () => {
    renderPlacement('unit-b');

    expect(await screen.findByText('Câu về 八')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAccessibleName('Câu 1 / 5');
    expect(
      screen.getByRole('heading', { name: 'Kiểm tra test-b' }),
    ).toBeVisible();
  });

  it('S3.6-AC1: should open the test of the requested unit, not another unit', async () => {
    renderPlacement('unit-a');

    expect(await screen.findByText('Câu về 甲')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAccessibleName('Câu 1 / 2');
    expect(screen.queryByText('Câu về 八')).not.toBeInTheDocument();
  });

  it('S3.6-AC1: should show "Không mở được bài học." when the unit does not exist', async () => {
    renderPlacement('unit-khong-co');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Không mở được bài học.',
    );
    expect(screen.queryByText(/^Câu về/)).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('S3.6-AC1: should show "Không mở được bài học." when the unit has no test, without opening another lesson', async () => {
    renderPlacement('unit-c');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Không mở được bài học.',
    );
    expect(screen.queryByText(/^Câu về/)).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('S3.6-AC2: should show "Chưa đạt, cần từ 80%" and "Làm lại", then restart at "Câu 1 / 5"', async () => {
    renderPlacement('unit-b');
    const user = userEvent.setup();
    for (const answer of [
      'Chọn đúng',
      'Chọn sai',
      'Chọn đúng',
      'Chọn sai',
      'Chọn sai',
    ]) {
      await user.click(await screen.findByRole('button', { name: answer }));
      await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    }

    expect(screen.getByText('Chưa đạt, cần từ 80%')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Làm lại' }));

    expect(screen.getByText('Câu về 八')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAccessibleName('Câu 1 / 5');
  });

  const readCompletedIds = async (): Promise<string[]> => {
    const db = createDatabase();
    try {
      const rows = await db.lessonProgress.toArray();
      return rows
        .filter((row) => row.status === 'completed')
        .map((row) => row.lessonId)
        .sort();
    } finally {
      db.close();
    }
  };

  const answerAll = async (answers: readonly string[]) => {
    const user = userEvent.setup();
    for (const answer of answers) {
      await user.click(await screen.findByRole('button', { name: answer }));
      await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    }
  };

  it('S3.6-AC2: should complete b1, b2 and test-b when every answer is right', async () => {
    renderPlacement('unit-b');

    await answerAll(Array<string>(5).fill('Chọn đúng'));

    await waitFor(async () => {
      expect(await readCompletedIds()).toEqual(['b1', 'b2', 'test-b']);
    });
  });

  it('S3.6-AC2: should write no progress row when the result is below 80%', async () => {
    renderPlacement('unit-b');

    await answerAll([
      'Chọn đúng',
      'Chọn sai',
      'Chọn đúng',
      'Chọn sai',
      'Chọn sai',
    ]);

    expect(screen.getByText('Chưa đạt, cần từ 80%')).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 300));
    const db = createDatabase();
    try {
      expect(await db.lessonProgress.toArray()).toEqual([]);
    } finally {
      db.close();
    }
  });

  it('S3.6-AC1: should announce the loading state with role="status" while the lesson is loading', () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      () => new Promise<Response>(() => undefined),
    );
    renderPlacement('unit-b');

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
