import { createDatabase } from '@core/helpers/db.helper';
import type { ExerciseRegistry } from '@shared/components/exercises/exercise.registry';
import { mockContentFetch } from '@test/mocks/content-fetch';
import { renderWithProviders, screen } from '@test/render';
import LessonRunnerContainer from './LessonRunnerContainer';

type LessonType = 'lesson' | 'test';

const buildLesson = (type: LessonType) => ({
  id: 'l1',
  type,
  title: type === 'test' ? 'Kiểm tra thanh điệu' : 'Bốn thanh điệu',
  exercises: [
    { id: 'e1', kind: 'tone-choice', wordId: '八' },
    { id: 'e2', kind: 'tone-choice', wordId: '白' },
    { id: 'e3', kind: 'tone-choice', wordId: '百' },
  ],
});

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

const serveLesson = (type: LessonType): void => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    mockContentFetch(async (input) =>
      /\/content\/lessons\/.+\.json$/.test(String(input))
        ? Response.json(buildLesson(type))
        : new Response('', { status: 404 }),
    ),
  );
};

/** Cô lập test: IndexedDB dùng chung giữa các test, xoá vị trí đã lưu của bài. */
const resetSavedProgress = async (): Promise<void> => {
  const db = createDatabase();
  await db.lessonProgress.clear();
  db.close();
};

beforeEach(async () => {
  await resetSavedProgress();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('LessonRunnerContainer — liên kết Trang chủ ở màn tổng kết', () => {
  it.each<[string, LessonType]>([
    ['bài thường', 'lesson'],
    ['bài kiểm tra cuối chủ đề', 'test'],
  ])(
    'S8.1-AC1 Từ màn tổng kết về Trang chủ: should show a "Trang chủ" link on the summary of a finished %s and go to /home when clicked',
    async (_label, type) => {
      serveLesson(type);
      const { user } = renderWithProviders(
        <LessonRunnerContainer registry={registry} />,
        { route: '/lessons/:lessonId' },
      );
      for (let step = 0; step < 3; step += 1) {
        await user.click(
          await screen.findByRole('button', { name: 'Chọn đúng' }),
        );
        await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));
      }
      expect(
        await screen.findByText('Bạn đã làm xong các câu của bài này.'),
      ).toBeInTheDocument();

      await user.click(screen.getByRole('link', { name: 'Trang chủ' }));

      expect(await screen.findByTestId('location')).toHaveTextContent(
        /^\/home$/,
      );
    },
  );

  it('S8.1-AC1 Màn bài khi đang làm câu không có liên kết Trang chủ: should not show a "Trang chủ" link at question 1 nor while viewing the answer result', async () => {
    serveLesson('lesson');
    const { user } = renderWithProviders(
      <LessonRunnerContainer registry={registry} />,
      { route: '/lessons/:lessonId' },
    );

    const answerButton = await screen.findByRole('button', {
      name: 'Chọn đúng',
    });
    expect(screen.getByText('Câu về 八')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Trang chủ' }),
    ).not.toBeInTheDocument();

    await user.click(answerButton);
    expect(
      await screen.findByRole('button', { name: 'Tiếp tục' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Trang chủ' }),
    ).not.toBeInTheDocument();
  });
});
