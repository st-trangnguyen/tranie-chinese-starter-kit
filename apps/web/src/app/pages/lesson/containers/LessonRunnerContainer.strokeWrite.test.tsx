import { describe, expect, it, vi } from 'vitest';

import {
  PERSON,
  answerToneChoiceAndContinue,
  findLessonPad,
  outlinePathsOf,
  renderLessonRunner,
  setupLessonStrokeWrite,
} from '@test/lesson-stroke-write.helpers';
import { screen } from '@test/render';

// Ranh giới ngoài: thư viện vẽ/chấm nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

setupLessonStrokeWrite();

describe('LessonRunnerContainer — câu viết', () => {
  it('S7.1-AC1 Câu viết hiện khung viết của đúng chữ: should show the empty writing pad of 人 with its 2-stroke outline, without the unsupported-kind fallback, when reaching the stroke-write exercise', async () => {
    const { user } = renderLessonRunner();
    await answerToneChoiceAndContinue(user);

    expect(screen.getByRole('progressbar')).toHaveAccessibleName('Câu 2 / 3');
    expect(screen.queryByText('Dạng bài này chưa có.')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Bỏ qua câu này' }),
    ).not.toBeInTheDocument();

    const pad = await findLessonPad(PERSON);
    expect(outlinePathsOf(pad)).toHaveLength(2);
    expect(pad).toHaveAttribute('data-completed-stroke-count', '0');
  });
});
