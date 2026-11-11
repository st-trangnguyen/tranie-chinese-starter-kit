import type { ExerciseRegistry } from '@shared/components/exercises/exercise.registry';
import { renderWithProviders, screen } from '@test/render';
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
  'tone-choice': ({ exercise, onResult }) => (
    <div>
      <p>Câu về {exercise.wordId}</p>
      <button type="button" onClick={() => onResult({ isCorrect: true })}>
        Chọn đúng
      </button>
      <button
        type="button"
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

beforeEach(() => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) =>
    /\/content\/lessons\/.+\.json$/.test(String(input))
      ? Response.json(LESSON)
      : new Response('', { status: 404 }),
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

  it('S3.2-AC1: should not report the lesson as done when every exercise was skipped', async () => {
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
});
