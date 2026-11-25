import type { Word } from '@csk/shared';
import { createDatabase } from '@core/helpers/db.helper';
import {
  DexieProgressStore,
  progressStore,
} from '@core/services/progress-store.service';
import type { ExerciseRegistry } from '@shared/components/exercises/exercise.registry';
import { mockContentFetch, wordOf } from '@test/mocks/content-fetch';
import { renderWithProviders, screen, waitFor } from '@test/render';
import LessonRunnerContainer from './LessonRunnerContainer';

const LESSON_ID = 'greeting';

const GREETING_WORDS: readonly Word[] = [
  { ...wordOf('你好'), hanzi: '你好', pinyin: 'nǐ hǎo', vi: ['xin chào'] },
];

/** Bài học một câu, có từ 你好. */
const LESSON = {
  id: LESSON_ID,
  type: 'lesson',
  title: 'Chào hỏi',
  exercises: [{ id: 'e1', kind: 'tone-choice', wordId: '你好' }],
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

const mockLessonContent = (): void => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    mockContentFetch(
      (input) => {
        const url = String(input);
        if (/\/strokes\/index\.json$/.test(url)) {
          return Response.json([]);
        }
        return /\/content\/lessons\/.+\.json$/.test(url)
          ? Response.json(LESSON)
          : new Response('', { status: 404 });
      },
      { words: GREETING_WORDS },
    ),
  );
};

/** Xoá dữ liệu cũ trong IndexedDB thật (fake-indexeddb) của app: cả năm bảng. */
const clearDatabase = async (): Promise<void> => {
  const db = createDatabase();
  await db.settings.clear();
  await db.lessonProgress.clear();
  await db.dailyStats.clear();
  await db.cards.clear();
  await db.writtenCharacters.clear();
  db.close();
};

beforeEach(async () => {
  await clearDatabase();
  mockLessonContent();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('LessonRunnerContainer — tạo thẻ ôn tập (S9.1)', () => {
  it('S9.1-AC1 Không lưu được thẻ thì bài vẫn xong: should show the summary without any alert, mark the lesson completed and create no 你好 card when saving cards fails', async () => {
    const addNewCards = vi
      .spyOn(DexieProgressStore.prototype, 'addNewCards')
      .mockRejectedValueOnce(new Error('IndexedDB write failed'));
    const { user } = renderWithProviders(
      <LessonRunnerContainer registry={registry} lessonId={LESSON_ID} />,
    );

    await user.click(await screen.findByRole('button', { name: 'Chọn đúng' }));
    await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));

    expect(
      await screen.findByText('Bạn đã làm xong các câu của bài này.'),
    ).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();

    // Chờ lần ghi tiến độ và lần tạo thẻ (bị lỗi) chạy xong rồi mới kiểm cảnh báo.
    await waitFor(async () => {
      expect(await progressStore.getLessonProgress(LESSON_ID)).toMatchObject({
        status: 'completed',
      });
    });
    await waitFor(() => {
      expect(addNewCards).toHaveBeenCalled();
    });
    await addNewCards.mock.results[0]?.value.catch(() => undefined);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Chưa lưu được kết quả bài này'),
    ).not.toBeInTheDocument();
    const cards = await progressStore.getAllCards();
    expect(cards.filter((card) => card.wordId === '你好')).toEqual([]);
  });
});
